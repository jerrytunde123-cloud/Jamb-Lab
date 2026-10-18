/**
 * JAMB Quiz - ETag-revalidated question cache.
 *
 * The API no longer publishes a `bank_version` (its `/health` is plain
 * liveness text now), so the cache cannot be gated on a content version.
 * What the question endpoint does publish is an `ETag` over the exact
 * response bytes, which changes whenever a row in that page changes. Every
 * cached subject therefore stores its pages as `{ etag, questions }` and
 * `js/api.js` re-requests each page with `If-None-Match`:
 *
 *   304  → the page is byte-identical: reuse it, download nothing
 *   200  → the page changed: replace it
 *
 * There is no TTL: a fixed-then-unfixed question changes the response
 * bytes, so the ETag changes and the next boot picks the fix up. Entries
 * are per subject (`jamb_qcache_v3:<appKey>`), so a quota failure or a
 * corrupt row degrades to refetch — never to a half-loaded quiz. Storage
 * failures (private mode, quota) clear the cache and carry on uncached;
 * they never throw into the loader.
 */

const PREFIX = 'jamb_qcache_v3:';
const LEGACY_PREFIXES = ['jamb_qcache_v1:', 'jamb_qcache_v2:'];

function storage() {
  try {
    return window.localStorage;
  } catch (e) {
    return null;
  }
}

function validPage(page) {
  return Boolean(page) &&
    Array.isArray(page.questions) &&
    (page.etag === null || page.etag === undefined || typeof page.etag === 'string');
}

/** Drop cache entries written by the old version-gated scheme. */
function purgeLegacy(store) {
  try {
    const dead = [];
    for (let i = 0; i < store.length; i += 1) {
      const k = store.key(i);
      if (!k) continue;
      for (let j = 0; j < LEGACY_PREFIXES.length; j += 1) {
        if (k.indexOf(LEGACY_PREFIXES[j]) === 0) {
          dead.push(k);
          break;
        }
      }
    }
    dead.forEach(function(k) { store.removeItem(k); });
  } catch (e) {
    // Unusable storage: nothing cached anyway.
  }
}

/** `{ appKey: { pages: [{ etag, questions }] } }` for every usable entry. */
export function readCache() {
  const hit = {};
  const store = storage();
  if (!store) return hit;
  purgeLegacy(store);
  try {
    for (let i = 0; i < store.length; i += 1) {
      const k = store.key(i);
      if (!k || k.indexOf(PREFIX) !== 0) continue;
      let row = null;
      try {
        row = JSON.parse(store.getItem(k));
      } catch (e) {
        continue; // corrupt entry: a miss, not a crash
      }
      if (!row || !Array.isArray(row.pages) || row.pages.length === 0) continue;
      if (!row.pages.every(validPage)) continue;
      const questions = [];
      row.pages.forEach(function(page) {
        questions.push.apply(questions, page.questions);
      });
      if (questions.length > 0) {
        hit[k.slice(PREFIX.length)] = { pages: row.pages };
      }
    }
  } catch (e) {
    return {};
  }
  return hit;
}

/** Store `{ appKey: { pages } }` entries. Never throws. */
export function writeCache(entries) {
  const store = storage();
  if (!store || !entries) return;
  purgeLegacy(store);
  try {
    Object.keys(entries).forEach(function(appKey) {
      const entry = entries[appKey];
      if (!entry || !Array.isArray(entry.pages) || entry.pages.length === 0) return;
      if (!entry.pages.every(validPage)) return;
      const questions = [];
      entry.pages.forEach(function(page) {
        questions.push.apply(questions, page.questions);
      });
      // A subject that now serves nothing must not keep old rows alive.
      if (questions.length === 0) {
        store.removeItem(PREFIX + appKey);
        return;
      }
      store.setItem(PREFIX + appKey, JSON.stringify({ pages: entry.pages }));
    });
  } catch (e) {
    clearCache();
  }
}

export function clearCache() {
  const store = storage();
  if (!store) return;
  try {
    const dead = [];
    for (let i = 0; i < store.length; i += 1) {
      const k = store.key(i);
      if (k && k.indexOf('jamb_qcache_') === 0) dead.push(k);
    }
    dead.forEach(function(k) { store.removeItem(k); });
  } catch (e) {
    // Unusable storage: nothing cached anyway.
  }
}
