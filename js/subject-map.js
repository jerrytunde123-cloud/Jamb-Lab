/**
 * JAMB Quiz - subject catalog knowledge.
 *
 * The API is the source of truth for which subjects exist and what they
 * are called. This file holds only what the API cannot provide:
 * this app's stable internal keys (history and best scores in existing
 * users' localStorage are keyed by them — never rename) and the display
 * icons (the catalog carries no icon field).
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

// Display icons by app key. FontAwesome classes, as before.
export const ICONS = {
  agriculturalScience: 'fa-leaf',
  arabic: 'fa-language',
  biology: 'fa-dna',
  chemistry: 'fa-flask',
  commerce: 'fa-store',
  computerStudies: 'fa-laptop-code',
  crs: 'fa-bible',
  economics: 'fa-chart-line',
  english: 'fa-font',
  financialAccounting: 'fa-coins',
  fineArts: 'fa-palette',
  french: 'fa-language',
  geography: 'fa-globe-africa',
  government: 'fa-gavel',
  hausa: 'fa-language',
  history: 'fa-landmark',
  homeEconomics: 'fa-home',
  igbo: 'fa-language',
  irk: 'fa-moon',
  literature: 'fa-feather-alt',
  mathematics: 'fa-calculator',
  music: 'fa-music',
  physicalEducation: 'fa-running',
  physics: 'fa-atom',
  yoruba: 'fa-language',
};
