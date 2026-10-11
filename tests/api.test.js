/**
 * JAMB Quiz - utmelab-api adapter tests.
 */

import { vi } from 'vitest';
import { apiEnabled, fetchApiBank } from '../js/api.js';

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
    vi.stubEnv('VITE_API_BASE', 'http://api.test');
    vi.stubEnv('VITE_API_KEY', 'sk_test');
    vi.stubEnv('VITE_EXAM', 'JAMB');
  });

  afterEach(function() {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('is disabled without a base or key', function() {
    expect(apiEnabled()).toBe(true);
    vi.stubEnv('VITE_API_KEY', '');
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
});
