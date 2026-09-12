/**
 * JAMB Quiz - Score History
 */

const JAMB_HISTORY = (function() {
  'use strict';

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
      } else {
        entry.best = prev.best;
        entry.bestCorrect = prev.bestCorrect;
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

  return {
    recordQuiz: recordQuiz,
    getBest: getBest,
    getAll: getAll
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = JAMB_HISTORY;
}
