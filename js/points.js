/**
 * JAMB Quiz - Points System
 * Handles earning, spending, and displaying points
 */

const JAMB_POINTS = (function() {
  'use strict';

  const state = JAMB_STATE;
  const utils = JAMB_UTILS;

  // ============================================
  // GETTERS
  // ============================================
  function getPoints() {
    return parseInt(localStorage.getItem('jamb_points') || '0', 10);
  }

  function getEarned() {
    return parseInt(localStorage.getItem('jamb_earned') || '0', 10);
  }

  function getSpent() {
    return parseInt(localStorage.getItem('jamb_spent') || '0', 10);
  }

  // ============================================
  // SETTERS
  // ============================================
  function setPoints(value) {
    state.setPoints(value);
    updateUI();
  }

  function addEarned(value) {
    const current = getEarned();
    localStorage.setItem('jamb_earned', String(current + value));
    state.setEarned(state.getEarned() + value);
  }

  function addSpent(value) {
    const current = getSpent();
    localStorage.setItem('jamb_spent', String(current + value));
    state.setSpent(state.getSpent() + value);
  }

  // ============================================
  // TRANSACTIONS
  // ============================================
  function addPoints(amount) {
    const current = getPoints();
    const newTotal = Math.max(0, current + amount);
    setPoints(newTotal);
    
    if (amount > 0) {
      addEarned(amount);
    } else if (amount < 0) {
      addSpent(Math.abs(amount));
    }
  }

  function deductPoints(amount) {
    const current = getPoints();
    if (current < amount) return false;
    
    addPoints(-amount);
    return true;
  }

  // ============================================
  // UI UPDATE
  // ============================================
  function updateUI() {
    const pointsEl = utils.$('pointsValue');
    const bigEl = utils.$('pointsBig');
    const earnedEl = utils.$('pointsEarned');
    const spentEl = utils.$('pointsSpent');
    
    if (pointsEl) pointsEl.textContent = getPoints();
    if (bigEl) bigEl.textContent = getPoints();
    if (earnedEl) earnedEl.textContent = getEarned();
    if (spentEl) spentEl.textContent = getSpent();
    
    // Update start button state if exists
    updateStartButtonState();
  }

  function updateStartButtonState() {
    const btn = utils.$('startQuizBtn');
    if (!btn) return;
    
    const config = state.getConfig();
    const n = state.getSelectedSubjectCount();
    const cost = n * config.POINTS.QUIZ_COST;
    const pts = getPoints();
    
    if (!state.isUnlocked()) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-lock"></i> Join channels to unlock';
      return;
    }
    
    if (n === 0) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-play"></i> Select at least 1 subject';
      return;
    }
    
    if (pts < cost) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-play"></i> Need ' + cost + ' pts (you have ' + pts + ')';
      return;
    }
    
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-play"></i> Start Quiz (−' + cost + ' pts)';
  }

  // ============================================
  // PUBLIC API
  // ============================================
  return {
    getPoints: getPoints,
    getEarned: getEarned,
    getSpent: getSpent,
    addPoints: addPoints,
    deductPoints: deductPoints,
    updateUI: updateUI,
    updateStartButtonState: updateStartButtonState
  };
})();