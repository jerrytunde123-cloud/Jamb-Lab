/**
 * JAMB Quiz - Utility Functions
 * Common helpers used across the application
 */

const JAMB_UTILS = (function() {
  'use strict';

  // ============================================
  // DATE HELPERS
  // ============================================
  function todayKey() {
    const d = new Date();
    return d.getFullYear() + '-' + 
           String(d.getMonth() + 1).padStart(2, '0') + '-' + 
           String(d.getDate()).padStart(2, '0');
  }

  function isToday(key) {
    return localStorage.getItem('jamb_daily_' + key) === todayKey();
  }

  function markToday(key) {
    localStorage.setItem('jamb_daily_' + key, todayKey());
  }

  // ============================================
  // ARRAY HELPERS
  // ============================================
  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = a[i];
      a[i] = a[j];
      a[j] = temp;
    }
    return a;
  }

  function shuffleQuestion(q) {
    if (!q.options || q.options.length < 2) return q;
    const shuffled = shuffleArray(q.options);
    let correctIndex = shuffled.indexOf(q.options[q.correct]);
    if (correctIndex === -1) correctIndex = 0;
    return Object.assign({}, q, { options: shuffled, correct: correctIndex });
  }

  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================
  let toastTimer = null;

  function showToast(message, color) {
    if (color === undefined) color = '';
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toastMsg');
    
    if (!toast || !msgEl) return;
    
    toast.className = 'toast show ' + color;
    msgEl.textContent = message;
    
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() {
      toast.className = 'toast ' + color;
    }, 2600);
  }

  // ============================================
  // DOM HELPERS
  // ============================================
  function $(id) {
    return document.getElementById(id);
  }

  function getAll(selector) {
    return document.querySelectorAll(selector);
  }

  function createEl(tag, className, html) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html !== undefined) el.innerHTML = html;
    return el;
  }

  // ============================================
  // PUBLIC API
  // ============================================
  return {
    todayKey: todayKey,
    isToday: isToday,
    markToday: markToday,
    shuffleArray: shuffleArray,
    shuffleQuestion: shuffleQuestion,
    showToast: showToast,
    $: $,
    getAll: getAll,
    createEl: createEl
  };
})();