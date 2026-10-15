/**
 * JAMB Quiz - seen tracker (no-repeat across quizzes).
 *
 * The bank is finite and small subjects recycle fast, so served question ids
 * are remembered per subject in localStorage. Each quiz prefers unseen rows;
 * when every row has been served the cycle resets and everything is eligible
 * again — repeats happen only after exhaustion, never by luck.
 *
 * Storage failures degrade to repeats, never to crashes. All functions are
 * safe to call with anything.
 */

const KEY = 'jamb_seen_v1';
const CAP = 1000; // ids remembered per subject; far above any subject pool

function storage() {
  try {
    return window.localStorage;
  } catch (e) {
    return null;
  }
}

function readAll() {
  const store = storage();
  if (!store) return {};
  try {
    const raw = JSON.parse(store.getItem(KEY));
    return (raw && typeof raw === 'object') ? raw : {};
  } catch (e) {
    return {};
  }
}

/** Array of served ids for this subject (possibly empty). Never throws. */
export function getSeen(appKey) {
  const all = readAll();
  const list = all && all[appKey];
  return Array.isArray(list) ? list : [];
}

/** Remember these ids for this subject (capped). Never throws. */
export function addSeen(appKey, ids) {
  if (!appKey || !ids || ids.length === 0) return;
  const store = storage();
  if (!store) return;
  try {
    const all = readAll();
    const list = getSeen(appKey).concat(ids);
    all[appKey] = list.length > CAP ? list.slice(list.length - CAP) : list;
    store.setItem(KEY, JSON.stringify(all));
  } catch (e) {
    try { store.removeItem(KEY); } catch (ignored) { /* unusable storage */ }
  }
}

/** Forget this subject's history (fresh cycle). Never throws. */
export function clearSeen(appKey) {
  const store = storage();
  if (!store || !appKey) return;
  try {
    const all = readAll();
    delete all[appKey];
    store.setItem(KEY, JSON.stringify(all));
  } catch (e) {
    /* carry on uncached */
  }
}
