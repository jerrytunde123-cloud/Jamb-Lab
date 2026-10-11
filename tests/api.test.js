/**
 * JAMB Quiz - utmelab-api adapter tests.
 */

import { vi } from 'vitest';
import { apiEnabled, catalogEnabled, fetchApiBank, fetchApiSubjects, mergeCatalog } from '../js/api.js';
import { retainJambSubjects } from '../js/subject-map.js';

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

  it('keeps local rows for subjects the API cannot serve', async function() {
    vi.stubGlobal('fetch', vi.fn(function(url) {
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

  it('loads the subject list from the public catalog without a key', async function() {
    const seen = {};
    vi.stubGlobal('fetch', vi.fn(function(url, opts) {
      seen.url = url;
      seen.headers = (opts && opts.headers) || {};
      return Promise.resolve({ ok: true, json: function() {
        return Promise.resolve({ exam: 'JAMB', subjects: [
          { slug: 'mathematics', exam: 'JAMB', name: 'Mathematics' },
        ] });
      } });
    }));
    const subjects = await fetchApiSubjects();
    expect(subjects.length).toBe(1);
    expect(subjects[0].slug).toBe('mathematics');
    expect(seen.headers['x-api-key']).toBeUndefined();
  });

  it('lets the API catalog decide which subjects exist', function() {
    const local = {
      mathematics: { name: 'Mathematics', icon: 'fa-calculator', questions: [{ id: 'old' }] },
      civicEducation: { name: 'Civic Education', icon: 'fa-book', questions: [] },
    };
    const merged = mergeCatalog(local, [
      { slug: 'mathematics', name: 'Mathematics' },
      { slug: 'yoruba', name: 'Yoruba' },
    ]);
    expect(Object.keys(merged).sort()).toEqual(['civicEducation', 'mathematics', 'yoruba']);
    expect(merged.mathematics.questions.length).toBe(1); // locals kept until overlay
    expect(merged.yoruba).toMatchObject({ name: 'Yoruba', questions: [] });
    expect(merged.civicEducation.questions).toEqual([]);
  });

  it('leaves the catalog on: the base is hardcoded, only the key is env', function() {
    expect(catalogEnabled()).toBe(true);
  });

  it('drops stale non-JAMB subjects before anything renders', function() {
    const bank = {
      mathematics: { name: 'Mathematics', questions: [] },
      civicEducation: { name: 'Civic Education', questions: [] },
      marketing: { name: 'Marketing', questions: [] },
    };
    expect(Object.keys(retainJambSubjects(bank))).toEqual(['mathematics']);
  });
});
