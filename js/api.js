/**
 * JAMB Quiz - utmelab-api adapter.
 *
 * Fetches questions from the API and reshapes them into this app's local
 * question shape, so the quiz engine below never knows where a row came
 * from:
 *
 *   API RenderedQuestion            app question
 *   ---------------------           ------------
 *   text                    ---->   question
 *   options [{id, text}]    ---->   options [text...]
 *   answer (option id)      ---->   correct (option index)
 *
 * Answers arrive with `include_explanation=true` and are mapped back to an
 * index immediately; nothing downstream changes (shuffle, scoring, review).
 * Rows whose answer id matches no option are dropped — an unscorable
 * question must never reach the quiz.
 *
 * Anything unmapped, unreachable, or unscorable falls back to the local
 * bank, per subject. A subject the API cannot serve keeps working.
 */

import { SLUG_TO_KEY, SUBJECT_MAP } from './subject-map.js';

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
export function catalogEnabled() {
  return Boolean(apiBase());
}

async function getJSON(path) {
  const res = await fetch(apiBase() + path, {
    headers: { 'x-api-key': apiKey() },
  });
  if (!res.ok) throw new Error('API ' + res.status + ' for ' + path);
  return res.json();
}

function toLocalQuestion(rq) {
  if (!rq || !Array.isArray(rq.options)) return null;
  const options = rq.options.map(function(o) { return o.text; });
  const correct = rq.options.findIndex(function(o) { return o.id === rq.answer; });
  if (correct < 0 || correct >= options.length) return null;
  return {
    id: rq.id,
    question: rq.text,
    options: options,
    correct: correct,
    image: rq.image || null,
    year: 'JAMB ' + rq.year,
    source: 'utmelab-api',
    sourceId: rq.id,
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
 * The exam's subject list, straight from the catalog. Public endpoint —
 * no key sent. Throws on any failure or malformed payload; the caller
 * keeps the local list.
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
 * Merge the API catalog into the local bank shape. The API decides which
 * subjects exist; the local bank keeps providing display names, icons and
 * fallback rows. An API subject with no local entry yet gets a fresh one
 * (questions arrive via the overlay); a local subject the API does not
 * list keeps working untouched.
 */
export function mergeCatalog(bank, apiSubjects) {
  const merged = Object.assign({}, bank);
  apiSubjects.forEach(function(s) {
    if (!s || !s.slug) return;
    const key = SLUG_TO_KEY[s.slug];
    if (!key) return;
    if (merged[key]) {
      merged[key] = Object.assign({}, merged[key], { apiSlug: s.slug });
    } else {
      merged[key] = { name: s.name || key, icon: 'fa-book', questions: [], apiSlug: s.slug };
    }
  });
  return merged;
}
/**
 * Returns `{ appKey: { questions } }` for every mapped subject that served
 * at least one scorable question. Never throws — a failed subject is simply
 * absent, and the caller keeps its local rows.
 */
export async function fetchApiBank() {
  const overlay = {};
  const settled = await Promise.all(SUBJECT_MAP.map(function([appKey, slug]) {
    return fetchSubjectQuestions(slug).then(
      function(questions) { return { appKey: appKey, questions: questions }; },
      function() { return null; },
    );
  }));
  settled.forEach(function(row) {
    if (row && row.questions.length > 0) overlay[row.appKey] = { questions: row.questions };
  });
  return overlay;
}
