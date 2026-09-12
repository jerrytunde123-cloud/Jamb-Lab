/**
 * JAMB Quiz - Utility Functions
 */

const JAMB_UTILS = (function() {
  'use strict';

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
    const originalCorrect = q.options[q.correct];
    const shuffled = shuffleArray(q.options);
    let correctIndex = shuffled.indexOf(originalCorrect);
    if (correctIndex === -1) correctIndex = 0;
    return Object.assign({}, q, { options: shuffled, correct: correctIndex });
  }

  function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

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

  function imageSrc(image) {
    if (!image) return '';
    if (/^https?:\/\//i.test(image)) return image;
    if (image.indexOf('assets/') === 0) return image;
    if (image.indexOf('public/') === 0) return 'assets/' + image.slice('public/'.length);
    return 'assets/' + image.replace(/^\//, '');
  }

  return {
    todayKey: todayKey,
    isToday: isToday,
    markToday: markToday,
    shuffleArray: shuffleArray,
    shuffleQuestion: shuffleQuestion,
    formatTime: formatTime,
    showToast: showToast,
    $: $,
    getAll: getAll,
    createEl: createEl,
    imageSrc: imageSrc
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = JAMB_UTILS;
}
