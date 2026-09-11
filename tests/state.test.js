/**
 * JAMB Quiz - State Management Tests
 * Tests for application state management
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

// Import modules in correct order
const JAMB_STATE = require('../js/state.js');
const JAMB_UTILS = require('../js/utils.js');
const JAMB_POINTS = require('../js/points.js');

describe('JAMB_STATE - Application State', function() {
  beforeEach(function() {
    localStorage.clear();
  });

  describe('Configuration', function() {
    it('should have POINTS configuration', function() {
      const config = JAMB_STATE.getConfig();
      expect(config.POINTS).toBeDefined();
      expect(config.POINTS.QUIZ_COST).toBe(5);
      expect(config.POINTS.UNLOCK_BONUS).toBe(15);
    });

    it('should have QUIZ configuration', function() {
      const config = JAMB_STATE.getConfig();
      expect(config.QUIZ).toBeDefined();
      expect(config.QUIZ.LENGTH).toBe(20);
      expect(config.QUIZ.TIME).toBe(25 * 60);
      expect(config.QUIZ.MAX_SUBJECTS).toBe(4);
    });
  });

  describe('User State', function() {
    it('should initialize userId as null', function() {
      expect(JAMB_STATE.getUserId()).toBeNull();
    });

    it('should allow setting userId', function() {
      JAMB_STATE.setUserId('ABC123');
      expect(JAMB_STATE.getUserId()).toBe('ABC123');
    });
  });

  describe('Unlock State', function() {
    it('should initialize unlocked as false', function() {
      expect(JAMB_STATE.isUnlocked()).toBe(false);
    });

    it('should allow setting unlocked state', function() {
      JAMB_STATE.setUnlocked(true);
      expect(JAMB_STATE.isUnlocked()).toBe(true);
    });
  });

  describe('Points State', function() {
    it('should initialize points as 0', function() {
      expect(JAMB_STATE.getPoints()).toBe(0);
    });

    it('should allow setting points', function() {
      JAMB_STATE.setPoints(100);
      expect(JAMB_STATE.getPoints()).toBe(100);
      expect(localStorage.getItem('jamb_points')).toBe('100');
    });

    it('should not allow negative points', function() {
      JAMB_STATE.setPoints(-50);
      expect(JAMB_STATE.getPoints()).toBe(0);
    });

    it('should track earned points', function() {
      JAMB_STATE.setEarned(50);
      expect(JAMB_STATE.getEarned()).toBe(50);
    });

    it('should track spent points', function() {
      JAMB_STATE.setSpent(30);
      expect(JAMB_STATE.getSpent()).toBe(30);
    });
  });

  describe('Referral State', function() {
    it('should initialize referralCount as 0', function() {
      expect(JAMB_STATE.getReferralCount()).toBe(0);
    });

    it('should allow setting referral count', function() {
      JAMB_STATE.setReferralCount(5);
      expect(JAMB_STATE.getReferralCount()).toBe(5);
    });

    it('should initialize referralUsed as null', function() {
      expect(JAMB_STATE.getReferralUsed()).toBeNull();
    });

    it('should allow setting referral used', function() {
      JAMB_STATE.setReferralUsed('REF123');
      expect(JAMB_STATE.getReferralUsed()).toBe('REF123');
    });

    it('should initialize newbieBonusClaimed as false', function() {
      expect(JAMB_STATE.isNewbieBonusClaimed()).toBe(false);
    });

    it('should allow setting newbie bonus claimed', function() {
      JAMB_STATE.setNewbieBonusClaimed(true);
      expect(JAMB_STATE.isNewbieBonusClaimed()).toBe(true);
    });
  });

  describe('Question Bank State', function() {
    it('should initialize questionBank as null', function() {
      expect(JAMB_STATE.getQuestionBank()).toBeNull();
    });

    it('should allow setting question bank', function() {
      const bank = { english: { questions: [] } };
      JAMB_STATE.setQuestionBank(bank);
      expect(JAMB_STATE.getQuestionBank()).toEqual(bank);
    });

    it('should initialize subjectsLoaded as false', function() {
      expect(JAMB_STATE.isSubjectsLoaded()).toBe(false);
    });

    it('should allow setting subjects loaded', function() {
      JAMB_STATE.setSubjectsLoaded(true);
      expect(JAMB_STATE.isSubjectsLoaded()).toBe(true);
    });
  });

  describe('Subject Selection State', function() {
    it('should initialize showMoreSubjects as false', function() {
      expect(JAMB_STATE.getShowMoreSubjects()).toBe(false);
    });

    it('should allow toggling showMoreSubjects', function() {
      JAMB_STATE.setShowMoreSubjects(true);
      expect(JAMB_STATE.getShowMoreSubjects()).toBe(true);
    });

    it('should initialize selectedSubjects as empty Set', function() {
      const selected = JAMB_STATE.getSelectedSubjects();
      expect(selected).toBeInstanceOf(Set);
      expect(selected.size).toBe(0);
    });

    it('should allow setting selected subjects', function() {
      const set = new Set(['english', 'math']);
      JAMB_STATE.setSelectedSubjects(set);
      expect(JAMB_STATE.getSelectedSubjects()).toEqual(set);
    });

    it('should allow adding selected subject', function() {
      JAMB_STATE.addSelectedSubject('english');
      expect(JAMB_STATE.getSelectedSubjects()).toContain('english');
    });

    it('should allow removing selected subject', function() {
      JAMB_STATE.addSelectedSubject('english');
      JAMB_STATE.removeSelectedSubject('english');
      expect(JAMB_STATE.getSelectedSubjects()).not.toContain('english');
    });

    it('should allow clearing selected subjects', function() {
      JAMB_STATE.addSelectedSubject('english');
      JAMB_STATE.addSelectedSubject('math');
      JAMB_STATE.clearSelectedSubjects();
      expect(JAMB_STATE.getSelectedSubjects().size).toBe(0);
    });

    it('should return selected subject count', function() {
      JAMB_STATE.addSelectedSubject('english');
      expect(JAMB_STATE.getSelectedSubjectCount()).toBe(1);
      JAMB_STATE.addSelectedSubject('math');
      expect(JAMB_STATE.getSelectedSubjectCount()).toBe(2);
    });
  });

  describe('Quiz State', function() {
    it('should initialize currentQuiz as null', function() {
      expect(JAMB_STATE.getCurrentQuiz()).toBeNull();
    });

    it('should allow setting current quiz', function() {
      const quiz = { questions: [], index: 0 };
      JAMB_STATE.setCurrentQuiz(quiz);
      expect(JAMB_STATE.getCurrentQuiz()).toEqual(quiz);
    });

    it('should allow clearing current quiz', function() {
      JAMB_STATE.setCurrentQuiz({ questions: [] });
      JAMB_STATE.clearCurrentQuiz();
      expect(JAMB_STATE.getCurrentQuiz()).toBeNull();
    });
  });

  describe('Daily State', function() {
    it('should initialize lastTopUpTime as null', function() {
      expect(JAMB_STATE.getLastTopUpTime()).toBeNull();
    });

    it('should allow setting last top up time', function() {
      const time = Date.now();
      JAMB_STATE.setLastTopUpTime(time);
      expect(JAMB_STATE.getLastTopUpTime()).toBe(time);
    });
  });
});
