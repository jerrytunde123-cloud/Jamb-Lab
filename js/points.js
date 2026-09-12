/**
 * JAMB Quiz - Points System
 */

const JAMB_POINTS = (function() {
  'use strict';

  const state = typeof JAMB_STATE !== 'undefined' ? JAMB_STATE : require('./state.js');
  const utils = typeof JAMB_UTILS !== 'undefined' ? JAMB_UTILS : require('./utils.js');

  function readNumber(key) {
    const n = parseInt(localStorage.getItem(key) || '0', 10);
    return isNaN(n) ? 0 : n;
  }

  function getPoints() {
    return readNumber('jamb_points');
  }

  function getEarned() {
    return readNumber('jamb_earned');
  }

  function getSpent() {
    return readNumber('jamb_spent');
  }

  function setPoints(value) {
    state.setPoints(value);
    updateUI();
  }

  function addEarned(value) {
    state.setEarned(getEarned() + value);
  }

  function addSpent(value) {
    state.setSpent(getSpent() + value);
  }

  function addPoints(amount) {
    const newTotal = Math.max(0, getPoints() + amount);
    setPoints(newTotal);

    if (amount > 0) {
      addEarned(amount);
    } else if (amount < 0) {
      addSpent(Math.abs(amount));
    }
  }

  function deductPoints(amount) {
    if (getPoints() < amount) return false;
    addPoints(-amount);
    return true;
  }

  function updateUI() {
    const pointsEl = utils.$('pointsValue');
    const bigEl = utils.$('pointsBig');
    const earnedEl = utils.$('pointsEarned');
    const spentEl = utils.$('pointsSpent');

    if (pointsEl) pointsEl.textContent = String(getPoints());
    if (bigEl) bigEl.textContent = String(getPoints());
    if (earnedEl) earnedEl.textContent = String(getEarned());
    if (spentEl) spentEl.textContent = String(getSpent());

    updateStartButtonState();
  }

  function updateStartButtonState() {
    const btn = utils.$('startQuizBtn');
    if (!btn) return;

    const config = state.getConfig();
    const n = state.getSelectedSubjectCount();
    const cost = n * config.POINTS.QUIZ_COST;

    if (n === 0) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-play"></i> Select at least 1 subject';
      return;
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-play"></i> Start Quiz (-' + cost + ' pts)';
  }

  function dailyTopUp() {
    // Points are only earned from sharing, not automatic top-ups
    return;
  }

  return {
    getPoints: getPoints,
    getEarned: getEarned,
    getSpent: getSpent,
    setPoints: setPoints,
    addEarned: addEarned,
    addSpent: addSpent,
    addPoints: addPoints,
    deductPoints: deductPoints,
    updateUI: updateUI,
    updateStartButtonState: updateStartButtonState,
    dailyTopUp: dailyTopUp
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = JAMB_POINTS;
}
