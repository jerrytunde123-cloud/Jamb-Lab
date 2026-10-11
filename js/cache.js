/**
 * JAMB Quiz - version-gated question cache.
 *
 * The API's content is still being corrected, so rows are never cached by
 * time: a TTL would serve fixed-then-unfixed questions. Instead every entry
 * is tagged with the bank's content version (`bank_version` from `/health`,
 * which changes if and only if content changed):
 *
 *   same version  → serve from localStorage, zero question requests
 *   new version   → refetch, store under the new version
 *   unknown       → trust nothing, fetch everything, store nothing
 *
 * Entries are per subject (`jamb_qcache_v1:<appKey>`), so a quota failure
 * or a corrupt row degrades to refetch — never to a half-loaded quiz.
 * Storage failures (private mode, quota) clear the cache and carry on
 * uncached; they never throw into the loader.
 */

const PREFIX = 'jamb_qcache_v1:';

function storage() {
  try {
    return window.localStorage;
  } catch (e) {
    return null;
  }
}

/** `{ appKey: questions[] }` for entries stamped with this version. */
export function readCache(bankVersion) {
  const hit = {};
  const store = storage();
  if (!store || !bankVersion) return hit;
  let i = 0;
  try {
    for (i = 0; i < store.length; i += 1) {
      const k = store.key(i);
      if (!k || k.indexOf(PREFIX) !== 0) continue;
      let row = null;
      try {
        row = JSON.parse(store.getItem(k));
      } catch (e) {
        continue; // corrupt entry: a miss, not a crash
      }
      if (row && row.version === bankVersion &&
          Array.isArray(row.questions) && row.questions.length > 0) {
        hit[k.slice(PREFIX.length)] = row.questions;
      }
    }
  } catch (e) {
    return {};
  }
  return hit;
}

/** Store `{ appKey: questions[] }` under this version. Never throws. */
export function writeCache(bankVersion, entries) {
  const store = storage();
  if (!store || !bankVersion || !entries) return;
  try {
    Object.keys(entries).forEach(function(appKey) {
      store.setItem(PREFIX + appKey, JSON.stringify({
        version: bankVersion,
        questions: entries[appKey],
      }));
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
      if (k && k.indexOf(PREFIX) === 0) dead.push(k);
    }
    dead.forEach(function(k) { store.removeItem(k); });
  } catch (e) {
    // Unusable storage: nothing cached anyway.
  }
}
