/**
 * JAMB Quiz - Score History
 * Tracks best scores per subject and overall stats
 */

const JAMB_HISTORY = (function() {
  'use strict';

  const state = JAMB_STATE;
  const utils = JAMB_UTILS;
  const STORAGE_KEY = 'jamb_history';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Record a finished quiz result
  // score = { correct, wrong, unanswered, percentage, total }
  // subjects = array of subject keys
  // Returns array of subjects where a new personal best was set
  function recordQuiz(subjects, score) {
    const data = load();
    const newBests = [];

    subjects.forEach(function(key) {
      const prev = data[key];
      const entry = {
        best: score.percentage,
        bestCorrect: score.correct,
        plays: (prev ? prev.plays : 0) + 1,
        lastPlayed: new Date().toISOString().slice(0, 10)
      };

      if (!prev || score.percentage > prev.best) {
        entry.isNewBest = true;
        newBests.push(key);
      }
      data[key] = entry;
    });

    save(data);
    return newBests;
  }

  function getBest(subject) {
    const data = load();
    return data[subject] || null;
  }

  function getAll() {
    return load();
  }

  function getSubjectsWithHistory() {
    return Object.keys(load());
  }

  // Get best percentage for a subject (0 if none)
  function getBestPercentage(subject) {
    const entry = getBest(subject);
    return entry ? entry.best : 0;
  }

  // Total plays across all subjects
  function getTotalPlays() {
    const data = load();
    return Object.values(data).reduce(function(sum, e) { return sum + (e.plays || 0); }, 0);
  }

  return {
    recordQuiz: recordQuiz,
    getBest: getBest,
    getAll: getAll,
    getSubjectsWithHistory: getSubjectsWithHistory,
    getBestPercentage: getBestPercentage,
    getTotalPlays: getTotalPlays
  };
})();