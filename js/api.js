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
 * There is no local fallback bank: stale rows are worse than an honest
 * error, so a subject the API cannot serve stays empty and the loader
 * says so instead of serving rot.
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

// The catalog is public (no key): which subjects exist is API data even
// for keyless clients. Question rows still need the key (see apiEnabled).
// Passages are public too — content to read, not answers to protect.
export function catalogEnabled() {
  return Boolean(apiBase());
}

async function getJSON(path, attempt) {
  const res = await fetch(apiBase() + path, {
    headers: { 'x-api-key': apiKey() },
  });
  // The deployment key is shared by every visitor at 60 req/min, so a
  // fresh boot (~26 requests) can legitimately 429 under concurrency.
  // The API answers 429 with Retry-After (and only on 429s, D43) plus
  // X-RateLimit-Reset — wait as told, then retry twice, then give up.
  if (res.status === 429 && (attempt || 0) < 2) {
    await new Promise(function(resolve) { setTimeout(resolve, retryDelayMs(res.headers)); });
    return getJSON(path, (attempt || 0) + 1);
  }
  if (!res.ok) throw new Error('API ' + res.status + ' for ' + path);
  return res.json();
}

function retryDelayMs(headers) {
  const cap = 15000;
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

async function fetchSubjectQuestions(slug) {
  const out = [];
  let page = 1;
  for (;;) {
    const url = '/api/v1/questions?exam=' + encodeURIComponent(EXAM) +
      '&subject=' + encodeURIComponent(slug) +
      '&include_explanation=true&per_page=' + PER_PAGE + '&page=' + page;
    const data = await getJSON(url);
    if (!data || !Array.isArray(data.questions)) throw new Error('bad payload for ' + slug);
    data.questions.forEach(function(rq) {
      const q = toLocalQuestion(rq);
      if (q) out.push(q);
    });
    if (page >= (data.total_pages || 1)) break;
    page += 1;
  }
  return out;
}

/**
 * One passage by id. Public endpoint — no key sent. Returns
 * `{ title, author, kind, text }` or null on any failure. Never throws:
 * a missing passage means its questions drop, not that the boot dies.
 */
async function fetchPassage(id) {
  try {
    const res = await fetch(apiBase() + '/api/v1/passages/' + encodeURIComponent(id));
    if (!res.ok) return null;
    const data = await res.json();
    const p = data && data.passage;
    if (!p) return null;
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

/**
 * The bank's content version. Keyless and tiny — the one request a boot
 * always makes, so the question cache can prove itself current without
 * re-downloading anything. Throws when unreachable or malformed.
 */
export async function fetchBankVersion() {
  const res = await fetch(apiBase() + '/health');
  if (!res.ok) throw new Error('API ' + res.status + ' for health');
  const data = await res.json();
  if (!data || !data.bank_version) throw new Error('bad health payload');
  return data.bank_version;
}

/**
 * The exam's subject list, straight from the catalog. Public endpoint —
 * no key sent. Throws on any failure or malformed payload.
 * Returns array of { slug, name, is_compulsory, objective_paper_questions }
 */
export async function fetchApiSubjects() {
  const exam = encodeURIComponent(EXAM);
  const res = await fetch(apiBase() + '/api/v1/exams/' + exam + '/subjects');
  if (!res.ok) throw new Error('API ' + res.status + ' for subjects');
  const data = await res.json();
  if (!data || !Array.isArray(data.subjects)) throw new Error('bad subjects payload');
  return data.subjects;
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
 * Returns `{ appKey: { questions } }` for every subject that served at
 * least one answerable question. `pairs` defaults to the whole catalog;
 * pass a subset to refetch only what's missing. Passages are resolved
 * once across all subjects and attached before rows are servable; rows
 * left dangling are dropped. Never throws — a failed subject is simply
 * absent.
 */
export async function fetchApiBank(pairs) {
  const overlay = {};
  const settled = await Promise.all((pairs || SUBJECT_MAP).map(function([appKey, slug]) {
    return fetchSubjectQuestions(slug).then(
      function(questions) { return { appKey: appKey, questions: questions }; },
      function() { return null; },
    );
  }));
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
    if (answerable.length > 0) overlay[row.appKey] = { questions: answerable };
  });
  return overlay;
}