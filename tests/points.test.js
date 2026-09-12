/**
 * JAMB Quiz - Points System Tests
 */

const JAMB_STATE = require('../js/state.js');
const JAMB_POINTS = require('../js/points.js');

describe('JAMB_POINTS - Points System', function() {
  beforeEach(function() {
    localStorage.clear();
    JAMB_STATE.setPoints(0);
    JAMB_STATE.setEarned(0);
    JAMB_STATE.setSpent(0);
    JAMB_STATE.setUnlocked(true);
    JAMB_STATE.clearSelectedSubjects();
    document.body.innerHTML =
      '<span id="pointsValue"></span>' +
      '<span id="pointsBig"></span>' +
      '<span id="pointsEarned"></span>' +
      '<span id="pointsSpent"></span>' +
      '<button id="startQuizBtn"></button>';
  });

  describe('getPoints()', function() {
    it('should return 0 when no points stored', function() {
      expect(JAMB_POINTS.getPoints()).toBe(0);
    });

    it('should return stored points value', function() {
      localStorage.setItem('jamb_points', '100');
      expect(JAMB_POINTS.getPoints()).toBe(100);
    });
  });

  describe('getEarned() / getSpent()', function() {
    it('should return stored earned value', function() {
      localStorage.setItem('jamb_earned', '500');
      expect(JAMB_POINTS.getEarned()).toBe(500);
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

    it('should not deduct when the balance is too low', function() {
      JAMB_POINTS.addPoints(50);
      expect(JAMB_POINTS.deductPoints(100)).toBe(false);
      expect(JAMB_POINTS.getPoints()).toBe(50);
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
    it('should disable button when no subjects selected', function() {
      JAMB_POINTS.updateStartButtonState();
      expect(document.getElementById('startQuizBtn').disabled).toBe(true);
      expect(document.getElementById('startQuizBtn').innerHTML).toContain('Select at least 1');
    });

    it('should enable button when subjects are selected even if locked', function() {
      JAMB_STATE.setUnlocked(false);
      JAMB_STATE.addSelectedSubject('english');
      JAMB_POINTS.updateStartButtonState();
      expect(document.getElementById('startQuizBtn').disabled).toBe(false);
      expect(document.getElementById('startQuizBtn').innerHTML).toContain('Start Quiz');
    });

    it('should enable button when subjects are selected even with zero points', function() {
      JAMB_STATE.addSelectedSubject('english');
      JAMB_POINTS.updateStartButtonState();
      expect(document.getElementById('startQuizBtn').disabled).toBe(false);
      expect(document.getElementById('startQuizBtn').innerHTML).toContain('Start Quiz');
    });

    it('should show correct cost', function() {
      JAMB_STATE.addSelectedSubject('english');
      JAMB_STATE.addSelectedSubject('math');
      JAMB_STATE.setPoints(100);
      JAMB_POINTS.updateStartButtonState();
      expect(document.getElementById('startQuizBtn').innerHTML).toContain('-10 pts');
    });
  });
});
