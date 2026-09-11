/**
 * JAMB Quiz - Utility Functions Tests
 * Tests for shuffleArray, shuffleQuestion, formatTime, todayKey, isToday, markToday
 */

const { JSDOM } = require('jsdom');

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true
});

global.window = dom.window;
global.document = dom.window.document;
global.localStorage = {
  store: {},
  getItem: function(key) { return this.store[key] || null; },
  setItem: function(key, value) { this.store[key] = String(value); },
  removeItem: function(key) { delete this.store[key]; },
  clear: function() { this.store = {}; }
};

// Mock toast element
const toastEl = document.createElement('div');
toastEl.id = 'toast';
const toastMsg = document.createElement('span');
toastMsg.id = 'toastMsg';
toastEl.appendChild(toastMsg);
document.body.appendChild(toastEl);

// Import modules
const JAMB_UTILS = require('../js/utils.js');

describe('JAMB_UTILS - Utility Functions', function() {
  describe('todayKey()', function() {
    it('should return a date string in YYYY-MM-DD format', function() {
      const key = JAMB_UTILS.todayKey();
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      expect(key).toMatch(regex);
    });

    it('should return today\'s date', function() {
      const key = JAMB_UTILS.todayKey();
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const expected = `${year}-${month}-${day}`;
      expect(key).toBe(expected);
    });
  });

  describe('isToday()', function() {
    beforeEach(function() {
      localStorage.clear();
    });

    it('should return false if key is not marked today', function() {
      const result = JAMB_UTILS.isToday('test_key');
      expect(result).toBe(false);
    });

    it('should return true if key matches today\'s date', function() {
      const today = JAMB_UTILS.todayKey();
      localStorage.setItem('jamb_daily_test_key', today);
      const result = JAMB_UTILS.isToday('test_key');
      expect(result).toBe(true);
    });

    it('should return false if key is from a different date', function() {
      localStorage.setItem('jamb_daily_test_key', '2020-01-01');
      const result = JAMB_UTILS.isToday('test_key');
      expect(result).toBe(false);
    });
  });

  describe('markToday()', function() {
    it('should set localStorage item with today\'s date', function() {
      JAMB_UTILS.markToday('test_key');
      const stored = localStorage.getItem('jamb_daily_test_key');
      const today = JAMB_UTILS.todayKey();
      expect(stored).toBe(today);
    });
  });

  describe('shuffleArray()', function() {
    it('should return an array of the same length', function() {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = JAMB_UTILS.shuffleArray(arr);
      expect(shuffled.length).toBe(arr.length);
    });

    it('should contain the same elements', function() {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = JAMB_UTILS.shuffleArray(arr);
      const sortedOriginal = [...arr].sort();
      const sortedShuffled = [...shuffled].sort();
      expect(sortedShuffled).toEqual(sortedOriginal);
    });

    it('should return a new array (not mutate original)', function() {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      JAMB_UTILS.shuffleArray(arr);
      expect(arr).toEqual(original);
    });

    it('should handle empty arrays', function() {
      const arr = [];
      const shuffled = JAMB_UTILS.shuffleArray(arr);
      expect(shuffled).toEqual([]);
    });

    it('should handle single element arrays', function() {
      const arr = [1];
      const shuffled = JAMB_UTILS.shuffleArray(arr);
      expect(shuffled).toEqual([1]);
    });
  });

  describe('shuffleQuestion()', function() {
    it('should return a question with shuffled options', function() {
      const q = {
        id: 'test-1',
        question: 'What is 2+2?',
        options: ['3', '4', '5', '6'],
        correct: 1
      };
      const shuffled = JAMB_UTILS.shuffleQuestion(q);
      expect(shuffled.options).not.toEqual(q.options);
    });

    it('should update correct index to match new position', function() {
      const q = {
        id: 'test-1',
        question: 'What is 2+2?',
        options: ['3', '4', '5', '6'],
        correct: 1
      };
      const shuffled = JAMB_UTILS.shuffleQuestion(q);
      const correctAnswer = q.options[q.correct];
      expect(shuffled.options[shuffled.correct]).toBe(correctAnswer);
    });

    it('should return original question if options < 2', function() {
      const q = {
        id: 'test-1',
        question: 'What is 2+2?',
        options: ['4'],
        correct: 0
      };
      const shuffled = JAMB_UTILS.shuffleQuestion(q);
      expect(shuffled).toEqual(q);
    });

    it('should not mutate original question', function() {
      const q = {
        id: 'test-1',
        question: 'What is 2+2?',
        options: ['3', '4', '5', '6'],
        correct: 1
      };
      const originalOptions = [...q.options];
      JAMB_UTILS.shuffleQuestion(q);
      expect(q.options).toEqual(originalOptions);
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
      const msgEl = document.getElementById('toastMsg');
      expect(msgEl.textContent).toBe('Test message');
    });

    it('should add color class when provided', function() {
      JAMB_UTILS.showToast('Success', 'green');
      const toast = document.getElementById('toast');
      expect(toast.className).toContain('green');
    });

    it('should not crash if toast element missing', function() {
      const original = document.getElementById('toast');
      document.body.removeChild(original);
      expect(function() {
        JAMB_UTILS.showToast('Test');
      }).not.toThrow();
      // Restore
      document.body.appendChild(toastEl);
    });
  });

  describe('DOM Helpers', function() {
    describe('$', function() {
      it('should return element by id', function() {
        const el = document.createElement('div');
        el.id = 'test-el';
        document.body.appendChild(el);
        expect(JAMB_UTILS.$( 'test-el')).toBe(el);
        document.body.removeChild(el);
      });

      it('should return null if element not found', function() {
        expect(JAMB_UTILS.$('nonexistent')).toBeNull();
      });
    });

    describe('getAll()', function() {
      it('should return NodeList of matching elements', function() {
        const divs = document.createElement('div');
        divs.className = 'test-class';
        document.body.appendChild(divs);
        const result = JAMB_UTILS.getAll('.test-class');
        expect(result.length).toBe(1);
        document.body.removeChild(divs);
      });
    });

    describe('createEl()', function() {
      it('should create element with tag', function() {
        const el = JAMB_UTILS.createEl('div');
        expect(el.tagName).toBe('DIV');
      });

      it('should set className if provided', function() {
        const el = JAMB_UTILS.createEl('div', 'my-class');
        expect(el.className).toBe('my-class');
      });

      it('should set innerHTML if provided', function() {
        const el = JAMB_UTILS.createEl('div', 'my-class', 'Hello');
        expect(el.innerHTML).toBe('Hello');
      });

      it('should not set innerHTML if undefined', function() {
        const el = JAMB_UTILS.createEl('div', 'my-class', undefined);
        expect(el.innerHTML).toBe('');
      });
    });
  });
});
