/**
 * JAMB Quiz - ETag-revalidated cache tests.
 */

import { readCache, writeCache, clearCache } from '../js/cache.js';

const ROWS = {
  mathematics: {
    pages: [{
      etag: '"page-1"',
      questions: [{ id: 'm1', question: 'Q', options: ['A'], correct: 0, image: null }],
    }],
  },
};

function cacheKeys() {
  const out = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const k = localStorage.key(i);
    if (k && k.indexOf('jamb_qcache_v3:') === 0) out.push(k);
  }
  return out;
}

describe('question cache', function() {
  beforeEach(function() {
    localStorage.clear();
  });

  it('misses when empty', function() {
    expect(readCache()).toEqual({});
  });

  it('hits entries stored with their page ETags', function() {
    writeCache(ROWS);
    expect(readCache()).toEqual(ROWS);
  });

  it('keeps multiple pages in order', function() {
    writeCache({
      physics: {
        pages: [
          { etag: '"p1"', questions: [{ id: 'a' }] },
          { etag: '"p2"', questions: [{ id: 'b' }] },
        ],
      },
    });
    const hit = readCache();
    expect(hit.physics.pages.map(function(p) { return p.etag; })).toEqual(['"p1"', '"p2"']);
    expect(hit.physics.pages[1].questions[0].id).toBe('b');
  });

  it('ignores corrupt, empty and malformed entries but serves the healthy ones', function() {
    localStorage.setItem('jamb_qcache_v3:broken', '{not json');
    localStorage.setItem('jamb_qcache_v3:empty', JSON.stringify({ pages: [{ etag: null, questions: [] }] }));
    localStorage.setItem('jamb_qcache_v3:malformed', JSON.stringify({ pages: [{ questions: 'nope' }] }));
    writeCache(ROWS);
    expect(readCache()).toEqual(ROWS);
  });

  it('removes an entry when the subject now serves nothing', function() {
    writeCache(ROWS);
    writeCache({
      mathematics: { pages: [{ etag: '"empty"', questions: [] }] },
    });
    expect(readCache()).toEqual({});
  });

  it('purges the old version-gated entries', function() {
    localStorage.setItem('jamb_qcache_v2:mathematics', JSON.stringify({ version: 'v1', questions: [{ id: 'old' }] }));
    writeCache(ROWS);
    expect(localStorage.getItem('jamb_qcache_v2:mathematics')).toBeNull();
    expect(readCache()).toEqual(ROWS);
  });

  it('degrades to uncached when storage throws', function() {
    const proto = Object.getPrototypeOf(localStorage);
    const spy = vi.spyOn(proto, 'setItem').mockImplementation(function() {
      throw new Error('quota exceeded');
    });
    expect(function() { writeCache(ROWS); }).not.toThrow();
    spy.mockRestore();
    expect(readCache()).toEqual({});
    expect(cacheKeys()).toEqual([]);
  });

  it('clearCache removes only cache entries', function() {
    writeCache(ROWS);
    localStorage.setItem('jamb_qcache_v1:legacy', '{}');
    localStorage.setItem('jamb_points', '10');
    clearCache();
    expect(cacheKeys()).toEqual([]);
    expect(localStorage.getItem('jamb_qcache_v1:legacy')).toBeNull();
    expect(localStorage.getItem('jamb_points')).toBe('10');
  });
});
