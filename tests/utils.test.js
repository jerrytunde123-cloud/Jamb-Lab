/**
 * JAMB Quiz - Utility Functions Tests
 */

const JAMB_UTILS = require('../js/utils.js');

describe('JAMB_UTILS - Utility Functions', function() {
  beforeEach(function() {
    localStorage.clear();
    document.body.innerHTML = '<div id="toast"><span id="toastMsg"></span></div>';
  });

  describe('todayKey()', function() {
    it('should return a date string in YYYY-MM-DD format', function() {
      const key = JAMB_UTILS.todayKey();
      expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return today\'s date', function() {
      const key = JAMB_UTILS.todayKey();
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      expect(key).toBe(year + '-' + month + '-' + day);
    });
  });

  describe('isToday() / markToday()', function() {
    it('should be false before marking', function() {
      expect(JAMB_UTILS.isToday('share')).toBe(false);
    });

    it('should be true after marking', function() {
      JAMB_UTILS.markToday('share');
      expect(JAMB_UTILS.isToday('share')).toBe(true);
    });
  });

  describe('shuffleArray()', function() {
    it('should return a new array of the same length', function() {
      const src = [1, 2, 3, 4, 5];
      const result = JAMB_UTILS.shuffleArray(src);
      expect(result).toHaveLength(5);
      expect(result).not.toBe(src);
      expect(result.slice().sort()).toEqual(src.slice().sort());
    });

    it('should handle empty array', function() {
      expect(JAMB_UTILS.shuffleArray([])).toEqual([]);
    });
  });

  describe('shuffleQuestion()', function() {
    it('should keep the correct answer after shuffling', function() {
      const q = {
        id: 'test-1',
        question: 'What is 2+2?',
        options: ['3', '4', '5', '6'],
        correct: 1
      };
      const shuffled = JAMB_UTILS.shuffleQuestion(q);
      expect(shuffled.options[shuffled.correct]).toBe('4');
      expect(q.options).toEqual(['3', '4', '5', '6']);
    });

    it('should return the question unchanged when there are fewer than 2 options', function() {
      const q = { id: 't', question: 'x', options: ['4'], correct: 0 };
      expect(JAMB_UTILS.shuffleQuestion(q)).toEqual(q);
    });
  });

  describe('formatTime()', function() {
    it('should format seconds to MM:SS', function() {
      expect(JAMB_UTILS.formatTime(0)).toBe('00:00');
      expect(JAMB_UTILS.formatTime(60)).toBe('01:00');
      expect(JAMB_UTILS.formatTime(3600)).toBe('60:00');
    });

    it('should pad single digit minutes and seconds', function() {
      expect(JAMB_UTILS.formatTime(5)).toBe('00:05');
      expect(JAMB_UTILS.formatTime(65)).toBe('01:05');
      expect(JAMB_UTILS.formatTime(3665)).toBe('61:05');
    });

    it('should handle large values', function() {
      expect(JAMB_UTILS.formatTime(150)).toBe('02:30');
      expect(JAMB_UTILS.formatTime(3661)).toBe('61:01');
    });
  });

  describe('showToast()', function() {
    it('should update toast message element', function() {
      JAMB_UTILS.showToast('Test message');
      expect(document.getElementById('toastMsg').textContent).toBe('Test message');
    });

    it('should add color class when provided', function() {
      JAMB_UTILS.showToast('Success', 'green');
      expect(document.getElementById('toast').className).toContain('green');
    });

    it('should not crash if toast element missing', function() {
      document.body.innerHTML = '';
      expect(function() { JAMB_UTILS.showToast('Test'); }).not.toThrow();
    });
  });

  describe('DOM Helpers', function() {
    it('should return element by id', function() {
      const el = document.createElement('div');
      el.id = 'test-el';
      document.body.appendChild(el);
      expect(JAMB_UTILS.$('test-el')).toBe(el);
    });

    it('should return null if element not found', function() {
      expect(JAMB_UTILS.$('nonexistent')).toBeNull();
    });

    it('should return matching elements from getAll', function() {
      const div = document.createElement('div');
      div.className = 'test-class';
      document.body.appendChild(div);
      expect(JAMB_UTILS.getAll('.test-class').length).toBe(1);
    });

    it('should create elements with class and html', function() {
      const el = JAMB_UTILS.createEl('div', 'my-class', 'Hello');
      expect(el.tagName).toBe('DIV');
      expect(el.className).toBe('my-class');
      expect(el.innerHTML).toBe('Hello');
    });

    it('should not set innerHTML if undefined', function() {
      const el = JAMB_UTILS.createEl('div', 'my-class', undefined);
      expect(el.innerHTML).toBe('');
    });
  });

  describe('imageSrc()', function() {
    it('prefixes local image paths with assets/', function() {
      expect(JAMB_UTILS.imageSrc('images/foo.jpg')).toBe('assets/images/foo.jpg');
    });

    it('leaves absolute URLs unchanged', function() {
      expect(JAMB_UTILS.imageSrc('https://cdn.example/x.png')).toBe('https://cdn.example/x.png');
    });

    it('returns empty string for missing images', function() {
      expect(JAMB_UTILS.imageSrc(null)).toBe('');
    });
  });

  describe('formatMathFallback() & renderFormattedText()', function() {
    it('converts fractions and basic LaTeX symbols in fallback mode', function() {
      const res = JAMB_UTILS.formatMathFallback('\\(\\frac{22}{7}\\) \\times 4');
      expect(res).toContain('(22)/(7)');
      expect(res).toContain('× 4');
      expect(res).not.toContain('\\(');
    });

    it('converts exponents and subscripts in fallback mode', function() {
      const res = JAMB_UTILS.formatMathFallback('x^{2} + 213\\(_4\\)');
      expect(res).toContain('x<sup>2</sup>');
      expect(res).toContain('213<sub>4</sub>');
    });

    it('renders text with newlines as <br>', function() {
      const el = document.createElement('div');
      JAMB_UTILS.renderFormattedText(el, 'Line 1\nLine 2');
      expect(el.innerHTML).toBe('Line 1<br>Line 2');
    });

    it('preserves safe formatting tags like <u> and <b>', function() {
      const el = document.createElement('div');
      JAMB_UTILS.renderFormattedText(el, 'Choose the <u>correct</u> word');
      expect(el.innerHTML).toBe('Choose the <u>correct</u> word');
    });
  });
});
