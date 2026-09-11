/**
 * JAMB Quiz - Points System Tests
 * Tests for points earning, spending, and display
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

// Create points display elements
const pointsValue = document.createElement('span');
pointsValue.id = 'pointsValue';
const pointsBig = document.createElement('span');
pointsBig.id = 'pointsBig';
const pointsEarned = document.createElement('span');
pointsEarned.id = 'pointsEarned';
const pointsSpent = document.createElement('span');
pointsSpent.id = 'pointsSpent';
const startQuizBtn = document.createElement('button');
startQuizBtn.id = 'startQuizBtn';
document.body.appendChild(pointsValue);
document.body.appendChild(pointsBig);
document.body.appendChild(pointsEarned);
document.body.appendChild(pointsSpent);
document.body.appendChild(startQuizBtn);

// Import modules in correct order
const JAMB_STATE = require('../js/state.js');
const JAMB_UTILS = require('../js/utils.js');
const JAMB_POINTS = require('../js/points.js');

describe('JAMB_POINTS - Points System', function() {
  beforeEach(function() {
    localStorage.clear();
    JAMB_STATE.setPoints(0);
    JAMB_STATE.setEarned(0);
    JAMB_STATE.setSpent(0);
    JAMB_STATE.setUnlocked(true);
    JAMB_STATE.clearSelectedSubjects();
  });

  describe('getPoints()', function() {
    it('should return 0 when no points stored', function() {
      expect(JAMB_POINTS.getPoints()).toBe(0);
    });

    it('should return stored points value', function() {
      localStorage.setItem('jamb_points', '100');
      expect(JAMB_POINTS.getPoints()).toBe(100);
    });

    it('should parse string to integer', function() {
      localStorage.setItem('jamb_points', '250');
      expect(JAMB_POINTS.getPoints()).toBe(250);
    });
  });

  describe('getEarned()', function() {
    it('should return 0 when no earned stored', function() {
      expect(JAMB_POINTS.getEarned()).toBe(0);
    });

    it('should return stored earned value', function() {
      localStorage.setItem('jamb_earned', '500');
      expect(JAMB_POINTS.getEarned()).toBe(500);
    });
  });

  describe('getSpent()', function() {
    it('should return 0 when no spent stored', function() {
      expect(JAMB_POINTS.getSpent()).toBe(0);
    });

    it('should return stored spent value', function() {
      localStorage.setItem('jamb_spent', '200');
      expect(JAMB_POINTS.getSpent()).toBe(200);
    });
  });

  describe('addPoints()', function() {
    it('should add positive points to total', function() {
      JAMB_POINTS.addPoints(50);
      expect(JAMB_POINTS.getPoints()).toBe(50);
    });

    it('should add multiple times', function() {
      JAMB_POINTS.addPoints(30);
      JAMB_POINTS.addPoints(20);
      expect(JAMB_POINTS.getPoints()).toBe(50);
    });

    it('should track earned points for positive amounts', function() {
      JAMB_POINTS.addPoints(100);
      expect(JAMB_POINTS.getEarned()).toBe(100);
    });

    it('should not track earned for zero', function() {
      JAMB_POINTS.addPoints(0);
      expect(JAMB_POINTS.getEarned()).toBe(0);
    });
  });

  describe('deductPoints()', function() {
    it('should deduct points when sufficient', function() {
      JAMB_POINTS.addPoints(100);
      const result = JAMB_POINTS.deductPoints(30);
      expect(result).toBe(true);
      expect(JAMB_POINTS.getPoints()).toBe(70);
    });

    it('should fail when insufficient points', function() {
      JAMB_POINTS.addPoints(20);
      const result = JAMB_POINTS.deductPoints(50);
      expect(result).toBe(false);
      expect(JAMB_POINTS.getPoints()).toBe(20);
    });

    it('should track spent points', function() {
      JAMB_POINTS.addPoints(100);
      JAMB_POINTS.deductPoints(30);
      expect(JAMB_POINTS.getSpent()).toBe(30);
    });

    it('should not go below zero', function() {
      JAMB_POINTS.addPoints(50);
      JAMB_POINTS.deductPoints(100);
      expect(JAMB_POINTS.getPoints()).toBe(0);
    });
  });

  describe('setPoints()', function() {
    it('should set points to specific value', function() {
      JAMB_POINTS.setPoints(200);
      expect(JAMB_POINTS.getPoints()).toBe(200);
    });

    it('should update localStorage', function() {
      JAMB_POINTS.setPoints(150);
      expect(localStorage.getItem('jamb_points')).toBe('150');
    });

    it('should update UI', function() {
      JAMB_POINTS.setPoints(75);
      expect(document.getElementById('pointsValue').textContent).toBe('75');
      expect(document.getElementById('pointsBig').textContent).toBe('75');
    });
  });

  describe('addEarned()', function() {
    it('should add to earned total', function() {
      JAMB_POINTS.addEarned(50);
      JAMB_POINTS.addEarned(30);
      expect(JAMB_POINTS.getEarned()).toBe(80);
    });

    it('should update localStorage', function() {
      JAMB_POINTS.addEarned(100);
      expect(localStorage.getItem('jamb_earned')).toBe('100');
    });

    it('should update state', function() {
      JAMB_POINTS.addEarned(75);
      expect(JAMB_STATE.getEarned()).toBe(75);
    });
  });

  describe('addSpent()', function() {
    it('should add to spent total', function() {
      JAMB_POINTS.addSpent(20);
      JAMB_POINTS.addSpent(30);
      expect(JAMB_POINTS.getSpent()).toBe(50);
    });

    it('should update localStorage', function() {
      JAMB_POINTS.addSpent(40);
      expect(localStorage.getItem('jamb_spent')).toBe('40');
    });

    it('should update state', function() {
      JAMB_POINTS.addSpent(60);
      expect(JAMB_STATE.getSpent()).toBe(60);
    });
  });

  describe('updateUI()', function() {
    it('should update all point display elements', function() {
      localStorage.setItem('jamb_points', '100');
      localStorage.setItem('jamb_earned', '500');
      localStorage.setItem('jamb_spent', '200');
      
      JAMB_POINTS.updateUI();
      
      expect(document.getElementById('pointsValue').textContent).toBe('100');
      expect(document.getElementById('pointsBig').textContent).toBe('100');
      expect(document.getElementById('pointsEarned').textContent).toBe('500');
      expect(document.getElementById('pointsSpent').textContent).toBe('200');
    });
  });

  describe('updateStartButtonState()', function() {
    it('should disable button when not unlocked', function() {
      JAMB_STATE.setUnlocked(false);
      JAMB_POINTS.updateStartButtonState();
      expect(startQuizBtn.disabled).toBe(true);
      expect(startQuizBtn.innerHTML).toContain('Join channels');
    });

    it('should disable button when no subjects selected', function() {
      JAMB_STATE.setUnlocked(true);
      JAMB_POINTS.updateStartButtonState();
      expect(startQuizBtn.disabled).toBe(true);
      expect(startQuizBtn.innerHTML).toContain('Select at least 1');
    });

    it('should disable button when insufficient points', function() {
      JAMB_STATE.setUnlocked(true);
      JAMB_STATE.addSelectedSubject('english');
      JAMB_POINTS.updateStartButtonState();
      expect(startQuizBtn.disabled).toBe(true);
      expect(startQuizBtn.innerHTML).toContain('Need');
    });

    it('should enable button when ready', function() {
      JAMB_STATE.setUnlocked(true);
      JAMB_STATE.addSelectedSubject('english');
      JAMB_STATE.setPoints(100);
      JAMB_POINTS.updateStartButtonState();
      expect(startQuizBtn.disabled).toBe(false);
      expect(startQuizBtn.innerHTML).toContain('Start Quiz');
    });

    it('should show correct cost', function() {
      JAMB_STATE.setUnlocked(true);
      JAMB_STATE.addSelectedSubject('english');
      JAMB_STATE.addSelectedSubject('math');
      JAMB_STATE.setPoints(100);
      JAMB_POINTS.updateStartButtonState();
      expect(startQuizBtn.innerHTML).toContain('-10 pts');
    });
  });
});
