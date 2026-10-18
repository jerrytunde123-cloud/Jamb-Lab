/**
 * JAMB Quiz - utmelab-api adapter.
 *
 * Fetches questions from the API and reshapes them into this app's local
 * question shape, so the quiz engine below never knows where a row came
 * from:
 *
 *   API RenderedQuestion            app question
 *   ---------------------           ------------
 *   text.text                 ---->   question
 *   options[{id, text.text}]  ---->   options [text...]
 *   answer (option id)        ---->   correct (option index)
 *   inline image marks        ---->   image / optionImages (url + position)
 *   passage_id                ---->   passage (attached, else row dropped)
 *
 * Answers arrive with `include_explanation=true` and are mapped back to an
 * index immediately; nothing downstream changes (shuffle, scoring, review).
 * Rows whose answer id matches no option are dropped — an unscorable
 * question must never reach the quiz. Rows pointing at a passage that
 * cannot be fetched are dropped too — a comprehension stem without its
 * passage is unanswerable.
 *
 * The API is content-versioned only by ETag: there is no `bank_version`
 * endpoint any more. Cached question pages are therefore revalidated with
 * If-None-Match when their subject is selected (304 reuses, 200 replaces),
 * never trusted by age. A subject the API cannot serve and that has no
 * cached copy stays empty rather than inventing rows.
 */

import { ICONS, SLUG_TO_KEY, SUBJECT_MAP } from './subject-map.js';

// Single-exam app: the API is exam-scoped and this client only serves
// JAMB, so the exam is a constant — not a third env var to configure.
const EXAM = 'JAMB';
const PER_PAGE = 200; // server cap (D3/D30)

// Read lazily (not at module scope) so tests can stub the env and the
// values always reflect the running build.
// Hardcoded: this client talks to one API. When it gets a public URL,
// change it here and rebuild — no per-environment config for the base.
function apiBase() { return 'https://api.utmelab.com'; }
function apiKey() { return import.meta.env.VITE_UTMELAB_API_KEY || ''; }

export function apiEnabled() {
  return Boolean(apiBase() && apiKey());
}

// The discovery surface is public (no key); the keyed catalog is the
// fallback while deployments without `/api/v1/public/*` are still live.
// Question rows and passages need the key (see apiEnabled).
export function catalogEnabled() {
  return Boolean(apiBase());
}

function responseHeader(res, name) {
  return res && res.headers && typeof res.headers.get === 'function'
    ? res.headers.get(name)
    : null;
}

/**
 * The response's strong ETag.
 *
 * The header is the source of truth, but the API's CORS policy does not
 * expose it to browser JS. The API computes it as the quoted lowercase
 * SHA-256 of the exact response bytes, so a browser can derive the same
 * value from the body it just read. Prefer the header when a deployment
 * exposes it; otherwise hash the text. No crypto (very old browser) means
 * no ETag, which only costs a full fetch — never correctness.
 */
async function responseEtag(res, text) {
  const exposed = String(
    responseHeader(res, 'access-control-expose-headers') || '',
  ).split(',').map(function(h) { return h.trim().toLowerCase(); });
  const crossOrigin = typeof location !== 'undefined' &&
    location.origin !== apiBase();
  // A cross-origin ETag is invisible without `Access-Control-Expose-Headers`.
  // The same CORS policy that exposes it also has to allow the echo header in
  // preflight, so exposing `etag` is the feature test for revalidation: until
  // it appears, do not send If-None-Match (the browser would block it).
  if (crossOrigin && exposed.indexOf('etag') === -1) return null;
  const header = responseHeader(res, 'etag');
  if (header) return header;
  if (!text || typeof crypto === 'undefined' || !crypto.subtle ||
      typeof TextEncoder === 'undefined') {
    return null;
  }
  try {
    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(text),
    );
    const hex = Array.from(new Uint8Array(digest)).map(function(b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
    return '"' + hex + '"';
  } catch (e) {
    return null;
  }
}

/**
 * One API request. Sends the key when configured (every catalog read except
 * the discovery surface is keyed), and can revalidate a cached page with its
 * ETag: a 304 comes back as `{ notModified: true }` without a body.
 *
 * The deployment key is shared by every visitor at 60 req/min, so
 * concurrent selections can still meet the ceiling even though boot no
 * longer fetches rows. The API answers 429 with Retry-After (and only on
 * 429s, D43) plus X-RateLimit-Reset — wait as told, then retry twice.
 */
async function request(path, options) {
  options = options || {};
  const attempt = options.attempt || 0;
  const headers = {};
  if (apiKey()) headers['x-api-key'] = apiKey();
  if (options.etag) headers['if-none-match'] = options.etag;

  const res = await fetch(apiBase() + path, { headers: headers });
  if (res.status === 429 && attempt < 2) {
    await new Promise(function(resolve) { setTimeout(resolve, retryDelayMs(res.headers)); });
    return request(path, { etag: options.etag, attempt: attempt + 1 });
  }
  if (res.status === 304) {
    return { notModified: true, etag: options.etag || null };
  }
  if (!res.ok) {
    const err = new Error('API ' + res.status + ' for ' + path);
    err.status = res.status;
    throw err;
  }
  // Read the body once: text is what the server hashed for its ETag, so
  // the client can derive the same tag without the header being exposed.
  if (typeof res.text === 'function') {
    const text = await res.text();
    return { data: JSON.parse(text), etag: await responseEtag(res, text) };
  }
  return { data: await res.json(), etag: responseHeader(res, 'etag') };
}

function retryDelayMs(headers) {
  // The API answers 429 with Retry-After: 60 (the rate-limit window), so a
  // shorter cap would retry inside the same window and fail twice more.
  const cap = 60000;
  const after = headers && parseFloat(headers.get('retry-after'));
  if (!isNaN(after)) return Math.min(Math.max(after * 1000, 0), cap);
  const reset = headers && parseFloat(headers.get('x-ratelimit-reset'));
  if (!isNaN(reset)) return Math.min(Math.max(reset * 1000 - Date.now(), 0), cap);
  return 2000;
}

/**
 * Extract plain text from a RichText object (or return string as-is).
 * RichText shape: { text: string, inline: Inline[] }
 */
function richTextToString(rt) {
  if (!rt) return '';
  if (typeof rt === 'string') return rt;
  return rt.text || '';
}

/**
 * First image mark in a RichText value, with the API's own placement.
 * `{ url, position }` where position is 'above' or 'below' (anything
 * else means below — the renderer only knows those two slots).
 */
function extractImage(rt) {
  if (!rt || !Array.isArray(rt.inline)) return null;
  for (const mark of rt.inline) {
    if (mark && mark.kind === 'image' && mark.url) {
      return {
        url: mark.url,
        position: mark.position === 'above' ? 'above' : 'below',
      };
    }
  }
  return null;
}

function toLocalQuestion(rq) {
  if (!rq || !Array.isArray(rq.options)) return null;

  // Extract plain text from RichText objects
  const questionText = richTextToString(rq.text);
  const options = rq.options.map(function(o) { return richTextToString(o.text); });

  // Find correct answer index by matching option id
  const correct = rq.options.findIndex(function(o) { return o.id === rq.answer; });
  if (correct < 0 || correct >= options.length) return null;

  // Stem image keeps its placement; each option keeps its own image so a
  // figure that belongs to option C never slides under the stem.
  const optionImages = rq.options.map(function(o) { return extractImage(o.text); });

  return {
    id: rq.id,
    question: questionText,
    options: options,
    correct: correct,
    image: extractImage(rq.text),
    optionImages: optionImages,
    year: 'JAMB ' + rq.year,
    source: 'utmelab-api',
    sourceId: rq.id,
    passageId: rq.passage_id || null,
    passage: null, // attached by attachPassages before the row is servable
  };
}

/**
 * One subject's pages, revalidated against the cached copy.
 * The API has no content-version endpoint, so each cached page carries the
 * ETag it arrived with and is re-requested with If-None-Match: a 304 reuses
 * that page, a 200 replaces it. No TTL — a fixed-then-unfixed row is picked
 * up on the very next selection because the response bytes (and so the
 * ETag) changed. Returns `[{ etag, questions }]` in page order.
 */
async function fetchSubjectQuestions(slug, cached) {
  const pages = [];
  const cachedPages = cached && Array.isArray(cached.pages) ? cached.pages : [];
  let page = 1;
  for (;;) {
    const prev = cachedPages[page - 1];
    const url = '/api/v1/questions?exam=' + encodeURIComponent(EXAM) +
      '&subject=' + encodeURIComponent(slug) +
      '&include_explanation=true&per_page=' + PER_PAGE + '&page=' + page;
    const out = await request(url, { etag: prev && prev.etag });
    if (out.notModified) {
      pages.push(prev);
      if (page >= cachedPages.length) break;
    } else {
      const data = out.data;
      if (!data || !Array.isArray(data.questions)) throw new Error('bad payload for ' + slug);
      const questions = [];
      data.questions.forEach(function(rq) {
        const q = toLocalQuestion(rq);
        if (q) questions.push(q);
      });
      pages.push({ etag: out.etag, questions: questions });
      if (page >= (data.total_pages || 1)) break;
    }
    page += 1;
  }
  return pages;
}

/**
 * One passage by id. Public endpoint — no key sent. Returns
 * `{ title, author, kind, text }` or null on any failure. Never throws:
 * a missing passage means its questions drop, not that the boot dies.
 */
async function fetchPassage(id) {
  try {
    const out = await request('/api/v1/passages/' + encodeURIComponent(id));
    // The endpoint serves the passage bare now; older deployments wrapped
    // it in `{ passage }`. Accept both so a rolling deploy cannot blank
    // every comprehension set.
    const p = out.data && (out.data.passage || out.data);
    if (!p || !p.id) return null;
    return {
      title: p.title || null,
      author: p.author || null,
      kind: p.kind || null,
      text: richTextToString(p.text),
    };
  } catch (e) {
    return null;
  }
}

/**
 * `{ passageId: passage }` for every id given. Never throws — ids that
 * fail are simply absent, and their questions are dropped downstream.
 */
async function fetchPassages(ids) {
  const map = {};
  const settled = await Promise.all((ids || []).map(function(id) {
    return fetchPassage(id).then(function(p) { return { id: id, passage: p }; });
  }));
  settled.forEach(function(row) {
    if (row && row.passage) map[row.id] = row.passage;
  });
  return map;
}

/**
 * Drop duplicate rows within one subject pool. The key is stem + options +
 * figure: two rows sharing a stem but carrying different diagrams (e.g. two
 * "labelled diagram" questions) are different questions and both survive.
 * Keeps the first of each key. Never throws.
 */
export function dedupeQuestions(questions) {
  const seen = {};
  return (questions || []).filter(function(q) {
    if (!q) return false;
    const stem = String(q.question || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const opts = (q.options || []).map(function(o) {
      return String(o == null ? '' : o).toLowerCase().replace(/\s+/g, ' ').trim();
    }).join(' | ');
    const fig = (q.image && q.image.url) || '';
    // Content-only key, deliberately not the id: bank dupes are the same
    // content under two ids. Same stem + same options + same figure = dupe.
    const key = stem + '\u001f' + opts + '\u001f' + fig;
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  });
}

/**
 * Attach passages to rows that need them. Returns only answerable rows:
 * a row with a passageId but no fetched passage is dropped — a
 * comprehension stem without its passage cannot be answered. Never throws.
 */
export function attachPassages(questions, passages) {
  return (questions || []).filter(function(q) {
    if (!q || !q.passageId) return true;
    const p = passages && passages[q.passageId];
    if (!p) return false;
    q.passage = p;
    return true;
  });
}

async function fetchKeyedSubjects() {
  const exam = encodeURIComponent(EXAM);
  const out = await request('/api/v1/exams/' + exam + '/subjects');
  const data = out.data;
  // Current deployments serve a bare array; older ones wrapped it in
  // `{ exam, subjects }`. Accept both across a rolling deploy.
  const subjects = Array.isArray(data) ? data : (data && data.subjects);
  if (!Array.isArray(subjects)) throw new Error('bad subjects payload');
  return subjects;
}

async function fetchPublicSubjects() {
  const res = await fetch(apiBase() + '/api/v1/public/exams');
  if (!res.ok) throw new Error('API ' + res.status + ' for public exams');
  const data = await res.json();
  const exams = Array.isArray(data) ? data : (data && data.exams);
  const found = (exams || []).filter(function(e) { return e && e.code === EXAM; })[0];
  if (!found || !Array.isArray(found.subjects)) throw new Error('bad public exams payload');
  return found.subjects;
}

/**
 * The exam's subject list. A keyed client asks the keyed catalog directly
 * (one request, no guaranteed 404); a keyless one uses the discovery surface
 * `/api/v1/public/exams`. Each falls back to the other so a deployment in
 * either state still renders. Throws only when no surface answers.
 * Returns array of { slug, name, is_compulsory, objective_paper_questions }
 */
export async function fetchApiSubjects() {
  if (apiKey()) {
    try {
      return await fetchKeyedSubjects();
    } catch (e) {
      return fetchPublicSubjects();
    }
  }
  try {
    return await fetchPublicSubjects();
  } catch (e) {
    return fetchKeyedSubjects();
  }
}

/**
 * Build the app's bank shape straight from the API catalog. Names come
 * from the catalog (JAMB's own spelling); icons from the static map —
 * the catalog carries none. Every subject starts with zero questions;
 * rows arrive via the overlay.
 */
export function buildBankFromCatalog(apiSubjects) {
  const bank = {};
  (apiSubjects || []).forEach(function(s) {
    if (!s || !s.slug) return;
    const key = SLUG_TO_KEY[s.slug];
    if (!key) return;
    bank[key] = {
      name: s.name || key,
      icon: ICONS[key] || 'fa-book',
      questions: [],
      apiSlug: s.slug,
    };
  });
  return bank;
}

/**
 * Returns `{ appKey: { questions, pages } }` for every subject that served
 * at least one answerable question. `pairs` defaults to the whole catalog;
 * `cached` is the previous boot's `{ appKey: { pages } }`, used both to
 * revalidate with If-None-Match and to keep a subject usable when its
 * revalidation fails. Passages are resolved once across all subjects and
 * attached before rows are servable; rows left dangling are dropped.
 * Never throws — a failed subject with no cached copy is simply absent.
 */
export async function fetchApiBank(pairs, cached) {
  const overlay = {};
  const settled = await Promise.all((pairs || SUBJECT_MAP).map(function([appKey, slug]) {
    return fetchSubjectQuestions(slug, cached && cached[appKey]).then(
      function(pages) { return { appKey: appKey, pages: pages, ok: true }; },
      function() {
        const prev = cached && cached[appKey];
        return prev && Array.isArray(prev.pages)
          ? { appKey: appKey, pages: prev.pages, ok: false }
          : null;
      },
    );
  }));
  settled.forEach(function(row) {
    if (!row) return;
    row.questions = [];
    row.pages.forEach(function(p) {
      row.questions.push.apply(row.questions, p.questions);
    });
  });
  // One passage fetch per distinct id across all subjects — English
  // comprehension sets share passages, so this is a handful of requests.
  const allRows = [];
  settled.forEach(function(row) {
    if (row && row.questions.length > 0) allRows.push.apply(allRows, row.questions);
  });
  const ids = {};
  allRows.forEach(function(q) { if (q.passageId) ids[q.passageId] = true; });
  const passages = await fetchPassages(Object.keys(ids));
  settled.forEach(function(row) {
    if (!row) return;
    const answerable = attachPassages(row.questions, passages);
    const unique = dedupeQuestions(answerable);
    // A successful empty subject is a real answer (render it and stop
    // retrying); all-rows-dropped is not — that is a passage/serve failure
    // and the subject should stay loadable.
    if (unique.length > 0 || (row.ok && row.questions.length === 0)) {
      overlay[row.appKey] = {
        questions: unique,
        pages: row.pages,
        loaded: row.ok,
      };
    }
  });
  return overlay;
}