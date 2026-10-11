/**
 * JAMB Quiz - version-gated cache tests.
 */

import { readCache, writeCache, clearCache } from '../js/cache.js';

const ROWS = {
  mathematics: [{ id: 'm1', question: 'Q', options: ['A'], correct: 0, image: null }],
};

function cacheKeys() {
  const out = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const k = localStorage.key(i);
    if (k && k.indexOf('jamb_qcache_v1:') === 0) out.push(k);
  }
  return out;
}

describe('question cache', function() {
  beforeEach(function() {
    localStorage.clear();
  });

  it('misses when empty or versionless', function() {
    expect(readCache('v1')).toEqual({});
    writeCache('v1', ROWS);
    expect(readCache(undefined)).toEqual({});
    expect(readCache('')).toEqual({});
  });

  it('hits entries stamped with the same version', function() {
    writeCache('v1', ROWS);
    expect(readCache('v1')).toEqual(ROWS);
  });

  it('misses everything on a version flip', function() {
    writeCache('v1', ROWS);
    expect(readCache('v2')).toEqual({});
  });

  it('ignores corrupt and empty entries but serves the healthy ones', function() {
    localStorage.setItem('jamb_qcache_v1:broken', '{not json');
    localStorage.setItem('jamb_qcache_v1:empty', JSON.stringify({ version: 'v1', questions: [] }));
    writeCache('v1', ROWS);
    expect(readCache('v1')).toEqual(ROWS);
  });

  it('degrades to uncached when storage throws', function() {
    const proto = Object.getPrototypeOf(localStorage);
    const spy = vi.spyOn(proto, 'setItem').mockImplementation(function() {
      throw new Error('quota exceeded');
    });
    expect(function() { writeCache('v1', ROWS); }).not.toThrow();
    spy.mockRestore();
    expect(readCache('v1')).toEqual({});
    expect(cacheKeys()).toEqual([]);
  });

  it('clearCache removes only cache entries', function() {
    writeCache('v1', ROWS);
    localStorage.setItem('jamb_points', '10');
    clearCache();
    expect(cacheKeys()).toEqual([]);
    expect(localStorage.getItem('jamb_points')).toBe('10');
  });
});
