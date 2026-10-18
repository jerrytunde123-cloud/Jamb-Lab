/**
 * JAMB Quiz - utmelab-api adapter tests.
 */

import { createHash, webcrypto } from 'node:crypto';
import { vi } from 'vitest';
import { apiEnabled, attachPassages, buildBankFromCatalog, catalogEnabled, dedupeQuestions, fetchApiBank, fetchApiSubjects } from '../js/api.js';

function rendered(id, answerId) {
  return {
    id: id,
    exam: 'JAMB',
    subject: 'mathematics',
    year: 2025,
    source: 'authored',
    text: 'What is ' + id + '?',
    options: [
      { id: 'a', text: 'one' },
      { id: 'b', text: 'two' },
      { id: 'c', text: 'three' },
      { id: 'd', text: 'four' },
    ],
    answer: answerId,
  };
}

function page(questions, totalPages) {
  return { questions: questions, page: 1, per_page: 200, total_pages: totalPages || 1, total_records: questions.length };
}

function reply(payload, headers) {
  return Promise.resolve({
    ok: true,
    json: function() { return Promise.resolve(payload); },
    headers: new Headers(headers || {}),
  });
}

describe('api adapter', function() {
  beforeEach(function() {
    vi.unstubAllGlobals();
    vi.stubEnv('VITE_UTMELAB_API_KEY', 'sk_test');
  });

  afterEach(function() {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('is disabled without a base or key', function() {
    expect(apiEnabled()).toBe(true);
    vi.stubEnv('VITE_UTMELAB_API_KEY', '');
    expect(apiEnabled()).toBe(false);
  });

  it('maps answer ids to option indexes in app shape', async function() {
    vi.stubGlobal('fetch', vi.fn(function(url) {
      expect(url).toContain('include_explanation=true');
      return Promise.resolve({ ok: true, json: function() {
        return Promise.resolve(page([rendered('q1', 'c')]));
      } });
    }));
    const overlay = await fetchApiBank();
    const q = overlay.mathematics.questions[0];
    expect(q.question).toBe('What is q1?');
    expect(q.options).toEqual(['one', 'two', 'three', 'four']);
    expect(q.correct).toBe(2);
    expect(q.year).toBe('JAMB 2025');
  });

  it('drops rows whose answer matches no option', async function() {
    vi.stubGlobal('fetch', vi.fn(function() {
      return Promise.resolve({ ok: true, json: function() {
        return Promise.resolve(page([rendered('q1', 'c'), rendered('q-bad', 'zzz')]));
      } });
    }));
    const overlay = await fetchApiBank();
    expect(overlay.mathematics.questions.length).toBe(1);
    expect(overlay.mathematics.questions[0].id).toBe('q1');
  });

  it('retries once after the told delay on 429, then serves', async function() {
    let calls = 0;
    vi.stubGlobal('fetch', vi.fn(function() {
      calls += 1;
      if (calls === 1) {
        return Promise.resolve({
          ok: false,
          status: 429,
          headers: new Headers({ 'retry-after': '0' }),
        });
      }
      return Promise.resolve({ ok: true, json: function() {
        return Promise.resolve(page([rendered('q1', 'a')]));
      } });
    }));
    const overlay = await fetchApiBank([['mathematics', 'mathematics']]);
    expect(overlay.mathematics.questions.length).toBe(1);
    expect(calls).toBeGreaterThan(1);
  });

  it('keeps local rows for subjects the API cannot serve', async function() {    vi.stubGlobal('fetch', vi.fn(function(url) {
      if (url.indexOf('subject=yoruba') !== -1) {
        return Promise.resolve({ ok: false, status: 429 });
      }
      return Promise.resolve({ ok: true, json: function() {
        return Promise.resolve(page([rendered('q1', 'a')]));
      } });
    }));
    const overlay = await fetchApiBank();
    expect(overlay.yoruba).toBeUndefined();
    expect(overlay.mathematics.questions.length).toBe(1);
  });

  it('uses the keyless discovery surface when no key is configured', async function() {
    vi.stubEnv('VITE_UTMELAB_API_KEY', '');
    const seen = {};
    vi.stubGlobal('fetch', vi.fn(function(url, opts) {
      seen.url = String(url);
      seen.headers = (opts && opts.headers) || {};
      return reply([{
        code: 'JAMB',
        name: 'Joint Admissions',
        subjects: [{ slug: 'mathematics', name: 'Mathematics', is_compulsory: false }],
      }]);
    }));
    const subjects = await fetchApiSubjects();
    expect(subjects.length).toBe(1);
    expect(subjects[0].slug).toBe('mathematics');
    expect(seen.url).toContain('/api/v1/public/exams');
    expect(seen.headers['x-api-key']).toBeUndefined();
  });

  it('uses the keyed catalog when a key is configured and accepts its bare array', async function() {
    const seen = {};
    vi.stubGlobal('fetch', vi.fn(function(url, opts) {
      if (String(url).indexOf('/public/exams') !== -1) {
        return Promise.resolve({ ok: false, status: 404 });
      }
      seen.headers = (opts && opts.headers) || {};
      return reply([{ slug: 'mathematics', exam: 'JAMB', name: 'Mathematics' }]);
    }));
    const subjects = await fetchApiSubjects();
    expect(subjects[0].slug).toBe('mathematics');
    expect(seen.headers['x-api-key']).toBe('sk_test');
  });

  it('accepts the older keyed envelope with a subjects field', async function() {
    vi.stubGlobal('fetch', vi.fn(function(url) {
      if (String(url).indexOf('/public/exams') !== -1) {
        return Promise.resolve({ ok: false, status: 404 });
      }
      return reply({ exam: 'JAMB', subjects: [
        { slug: 'mathematics', exam: 'JAMB', name: 'Mathematics' },
      ] });
    }));
    const subjects = await fetchApiSubjects();
    expect(subjects.length).toBe(1);
    expect(subjects[0].slug).toBe('mathematics');
  });

  it('builds the bank from the catalog: names from JAMB, icons static', function() {
    const bank = buildBankFromCatalog([
      { slug: 'mathematics', name: 'Mathematics' },
      { slug: 'use-of-english', name: 'Use of English' },
      { slug: 'civic-education', name: 'Civic Education' },
    ]);
    expect(Object.keys(bank).sort()).toEqual(['english', 'mathematics']);
    expect(bank.mathematics).toMatchObject({ name: 'Mathematics', icon: 'fa-calculator', questions: [] });
    expect(bank.english).toMatchObject({ name: 'Use of English', icon: 'fa-font', questions: [] });
  });

  it('leaves the catalog on: the base is hardcoded, only the key is env', function() {
    expect(catalogEnabled()).toBe(true);
  });

  it('keeps image placement: stem above, figures with their option', async function() {
    function rich(text, marks) { return { text: text, inline: marks || [] }; }
    function img(url, position) { return { start: 0, len: 0, kind: 'image', url: url, position: position }; }
    const row = {
      id: 'q-img', exam: 'JAMB', subject: 'physics', year: 2025, source: 'authored',
      text: rich('See the diagram above.', [img('https://cdn.example/fig.png', 'above')]),
      options: [
        { id: 'a', text: rich('plain', []) },
        { id: 'b', text: rich('with figure', [img('https://cdn.example/opt.png', 'below')]) },
      ],
      answer: 'b',
    };
    vi.stubGlobal('fetch', vi.fn(function(url) {
      return Promise.resolve({ ok: true, json: function() {
        return Promise.resolve(page([row]));
      } });
    }));
    const overlay = await fetchApiBank([['physics', 'physics']]);
    const q = overlay.physics.questions[0];
    expect(q.image).toEqual({ url: 'https://cdn.example/fig.png', position: 'above' });
    expect(q.optionImages[0]).toBeNull();
    expect(q.optionImages[1]).toEqual({ url: 'https://cdn.example/opt.png', position: 'below' });
  });

  it('drops passage rows the API cannot serve, keeps the rest', function() {
    const questions = [
      { id: 'free', passageId: null },
      { id: 'held', passageId: 'p1' },
      { id: 'dangling', passageId: 'p-missing' },
    ];
    const out = attachPassages(questions, { p1: { title: 'T', author: null, kind: 'comprehension', text: 'Once...' } });
    expect(out.map(function(q) { return q.id; })).toEqual(['free', 'held']);
    expect(out[1].passage.text).toBe('Once...');
  });  it('attaches a keyed, bare passage and sends the key', async function() {
    const row = {
      id: 'q-eng', exam: 'JAMB', subject: 'use-of-english', year: 2025, source: 'past_paper',
      text: { text: 'What is the passage about?', inline: [] },
      options: [{ id: 'a', text: { text: 'x', inline: [] } }],
      answer: 'a',
      passage_id: 'p1',
    };
    let passageHeaders = null;
    vi.stubGlobal('fetch', vi.fn(function(url, opts) {
      if (String(url).indexOf('/passages/') !== -1) {
        passageHeaders = (opts && opts.headers) || {};
        return reply({ id: 'p1', kind: 'comprehension', title: 'T', author: null, text: { text: 'Once...', inline: [] } });
      }
      return reply(page([row]));
    }));
    const overlay = await fetchApiBank([['english', 'use-of-english']]);
    const q = overlay.english.questions[0];
    expect(q.passageId).toBe('p1');
    expect(q.passage.text).toBe('Once...');
    expect(passageHeaders['x-api-key']).toBe('sk_test');
  });

  it('marks a successful empty subject as loaded so it is not refetched', async function() {
    vi.stubGlobal('fetch', vi.fn(function() {
      return reply(page([]));
    }));
    const overlay = await fetchApiBank([['mathematics', 'mathematics']]);
    expect(overlay.mathematics).toBeDefined();
    expect(overlay.mathematics.questions).toEqual([]);
    expect(overlay.mathematics.loaded).toBe(true);
  });

  it('waits the full Retry-After window before retrying a 429', async function() {
    vi.useFakeTimers();
    let calls = 0;
    vi.stubGlobal('fetch', vi.fn(function() {
      calls += 1;
      if (calls === 1) {
        return Promise.resolve({
          ok: false,
          status: 429,
          headers: new Headers({ 'retry-after': '60' }),
        });
      }
      return reply(page([rendered('q1', 'a')]));
    }));
    try {
      const pending = fetchApiBank([['mathematics', 'mathematics']]);
      await vi.advanceTimersByTimeAsync(59999);
      expect(calls).toBe(1);
      await vi.advanceTimersByTimeAsync(1);
      const overlay = await pending;
      expect(overlay.mathematics.questions.length).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('revalidates cached pages with If-None-Match and reuses a 304', async function() {
    const seen = [];
    let calls = 0;
    vi.stubGlobal('fetch', vi.fn(function(url, opts) {
      seen.push((opts && opts.headers) || {});
      calls += 1;
      if (calls === 1) {
        return reply(page([rendered('q1', 'a')]), {
          etag: '"v1"',
          'access-control-expose-headers': 'etag',
        });
      }
      return Promise.resolve({
        ok: false,
        status: 304,
        headers: new Headers({ etag: '"v1"', 'access-control-expose-headers': 'etag' }),
      });
    }));
    const first = await fetchApiBank([['mathematics', 'mathematics']]);
    expect(first.mathematics.pages[0].etag).toBe('"v1"');
    const second = await fetchApiBank([['mathematics', 'mathematics']], first);
    expect(second.mathematics.questions.length).toBe(1);
    expect(second.mathematics.questions[0].id).toBe('q1');
    expect(seen[1]['if-none-match']).toBe('"v1"');
  });

  it('derives the server ETag from the body when CORS hides the header', async function() {
    vi.stubGlobal('crypto', webcrypto);
    const body = JSON.stringify(page([rendered('q1', 'a')]));
    const expected = '"' + createHash('sha256').update(body).digest('hex') + '"';
    vi.stubGlobal('fetch', vi.fn(function() {
      return Promise.resolve({
        ok: true,
        text: function() { return Promise.resolve(body); },
        headers: new Headers({ 'access-control-expose-headers': 'etag' }),
      });
    }));
    const overlay = await fetchApiBank([['mathematics', 'mathematics']]);
    expect(overlay.mathematics.pages[0].etag).toBe(expected);
  });

  it('does not send a validator the CORS policy has not exposed', async function() {
    const body = JSON.stringify(page([rendered('q1', 'a')]));
    vi.stubGlobal('fetch', vi.fn(function() {
      return Promise.resolve({
        ok: true,
        text: function() { return Promise.resolve(body); },
        headers: new Headers(),
      });
    }));
    const overlay = await fetchApiBank([['mathematics', 'mathematics']]);
    expect(overlay.mathematics.pages[0].etag).toBeNull();
  });

  it('keeps a cached subject when its revalidation request fails', async function() {
    const cached = {
      mathematics: { pages: [{ etag: '"v1"', questions: [{ id: 'cached', question: 'Q', options: ['A', 'B'], correct: 0, image: null }] }] },
    };
    vi.stubGlobal('fetch', vi.fn(function() {
      return Promise.reject(new Error('offline'));
    }));
    const overlay = await fetchApiBank([['mathematics', 'mathematics']], cached);
    expect(overlay.mathematics.questions[0].id).toBe('cached');
  });

  it('drops exact duplicate rows but keeps same-stem diagram questions', function() {
    function row(id, stem, fig) {
      return { id: id, question: stem, options: ['a', 'b'], image: fig ? { url: fig, position: 'below' } : null };
    }
    const out = dedupeQuestions([
      row('1', 'What is X?', null),
      row('2', '  what   is x? ', null), // same stem, case/space differ: dupe
      row('3', 'The part labelled I is the', 'https://cdn.example/fig1.png'),
      row('4', 'The part labelled I is the', 'https://cdn.example/fig2.png'), // same stem, other figure: keep
      row('5', 'The part labelled I is the', 'https://cdn.example/fig2.png'), // same stem, same figure: dupe
    ]);
    expect(out.map(function(q) { return q.id; })).toEqual(['1', '3', '4']);
  });
});
