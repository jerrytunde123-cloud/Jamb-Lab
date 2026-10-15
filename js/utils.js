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
    // Shuffle positions, then carry every parallel array (optionImages)
    // through the same permutation so figures stay with their option.
    const order = shuffleArray(q.options.map(function(opt, i) { return i; }));
    const options = order.map(function(i) { return q.options[i]; });
    const correctIndex = order.indexOf(q.correct);
    const out = Object.assign({}, q, {
      options: options,
      correct: correctIndex === -1 ? 0 : correctIndex
    });
    if (Array.isArray(q.optionImages) && q.optionImages.length === q.options.length) {
      out.optionImages = order.map(function(i) { return q.optionImages[i]; });
    }
    return out;
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
    // Runtime image paths resolve against the app base, not the source
    // tree: diagram files ship verbatim from public/images/.
    const base = (import.meta.env && import.meta.env.BASE_URL) || '/';
    let p = String(image).replace(/^\//, '');
    if (p.indexOf('assets/images/') === 0) p = p.slice('assets/'.length); // legacy bank prefix
    if (p.indexOf('assets/') === 0) return p; // already source-relative (dev)
    return base + p;
  }

  function formatMathFallback(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\neq/g, '≠')
      .replace(/\\pi/g, 'π')
      .replace(/\\sqrt\{([^{}]+)\}/g, '√($1)')
      .replace(/\\sqrt/g, '√')
      .replace(/\\geq|\\ge/g, '≥')
      .replace(/\\leq|\\le/g, '≤')
      .replace(/\\Delta/g, 'Δ')
      .replace(/\\rightarrow/g, '→')
      .replace(/\\log_\{([^{}]+)\}/g, 'log<sub>$1</sub>')
      .replace(/\\log_([a-zA-Z0-9])/g, 'log<sub>$1</sub>')
      .replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>')
      .replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>')
      .replace(/\^([0-9a-zA-Z+-]+)/g, '<sup>$1</sup>')
      .replace(/_([0-9a-zA-Z+-]+)/g, '<sub>$1</sub>')
      .replace(/\\\(|\\\)|\\\[|\\\]/g, '');
  }

  function renderFormattedText(container, rawText) {
    if (!container) return;
    if (!rawText && rawText !== 0) {
      container.innerHTML = '';
      return;
    }

    let formatted = String(rawText);

    // Convert newlines to <br>
    formatted = formatted.replace(/\r\n|\n|\r/g, '<br>');

    container.innerHTML = formatted;

    // Typeset with KaTeX if available
    if (typeof window !== 'undefined' && typeof window.renderMathInElement === 'function') {
      try {
        window.renderMathInElement(container, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
        return;
      } catch (e) {
        // Fall back on error
      }
    }

    // Clean fallback if KaTeX is not loaded
    if (formatted.indexOf('\\(') !== -1 || formatted.indexOf('\\[') !== -1) {
      container.innerHTML = formatMathFallback(formatted);
    }
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
    imageSrc: imageSrc,
    formatMathFallback: formatMathFallback,
    renderFormattedText: renderFormattedText
  };
})();

export default JAMB_UTILS;
