/**
 * JAMB Quiz - subject key mapping.
 *
 * Maps this app's question-bank keys (camelCase, historical) to the
 * utmelab-api catalog slugs (kebab-case, JAMB's own spelling).
 * Subjects with no API equivalent stay on the local bank — see api.js.
 */

// [appKey, apiSlug]
export const SUBJECT_MAP = [
  ['english', 'use-of-english'],
  ['mathematics', 'mathematics'],
  ['physics', 'physics'],
  ['chemistry', 'chemistry'],
  ['biology', 'biology'],
  ['economics', 'economics'],
  ['government', 'government'],
  ['literature', 'literature-in-english'],
  ['crs', 'christian-religious-studies'],
  ['geography', 'geography'],
  ['commerce', 'commerce'],
  ['financialAccounting', 'principles-of-accounts'],
  ['agriculturalScience', 'agricultural-science'],
  ['arabic', 'arabic'],
  ['computerStudies', 'computer-studies'],
  ['fineArts', 'art'],
  ['french', 'french'],
  ['hausa', 'hausa'],
  ['history', 'history'],
  ['homeEconomics', 'home-economics'],
  ['igbo', 'igbo'],
  ['irk', 'islamic-religious-studies'],
  ['music', 'music'],
  ['physicalEducation', 'physical-education'],
  ['yoruba', 'yoruba'],
];

// Reverse lookup: API slug -> app key.
export const SLUG_TO_KEY = Object.fromEntries(
  SUBJECT_MAP.map(function([appKey, slug]) { return [slug, appKey]; }),
);

// The app's subject universe: exactly the JAMB offering. The local bank
// historically carried extra (NECO) subjects — stale rows that must never
// reach the grid, online or off. Anything outside this set is dropped at
// load, before render.
export const APP_KEYS = new Set(SUBJECT_MAP.map(function([appKey]) { return appKey; }));

export function retainJambSubjects(bank) {
  const kept = {};
  Object.keys(bank || {}).forEach(function(key) {
    if (APP_KEYS.has(key)) kept[key] = bank[key];
  });
  return kept;
}
