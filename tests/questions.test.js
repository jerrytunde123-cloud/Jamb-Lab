/**
 * JAMB Quiz - Question generation and subject helpers
 */

const JAMB_STATE = require('../js/state.js');
const JAMB_UTILS = require('../js/utils.js');
const JAMB_QUESTIONS = require('../js/questions.js');

function makeQuestion(id, correct) {
  return {
    id: id,
    question: 'Q ' + id,
    options: ['A', 'B', 'C', 'D'],
    correct: correct || 0,
    image: null
  };
}

function makeBank() {
  const bank = {};
  ['english', 'mathematics', 'biology', 'chemistry'].forEach(function(key) {
    bank[key] = {
      name: key === 'english' ? 'English Language' : key.charAt(0).toUpperCase() + key.slice(1),
      icon: 'fa-book',
      questions: []
    };
    for (let i = 0; i < 30; i++) {
      bank[key].questions.push(makeQuestion(key + '-' + i, i % 4));
    }
  });
  return bank;
}

describe('JAMB_QUESTIONS', function() {
  beforeEach(function() {
    localStorage.clear();
    JAMB_STATE.clearSelectedSubjects();
    JAMB_STATE.setQuestionBank(makeBank());
  });

  it('uses question-bank names instead of hardcoded keys', function() {
    expect(JAMB_QUESTIONS.getSubjectName('english')).toBe('English Language');
    expect(JAMB_QUESTIONS.getSubjectIcon('english')).toBe('fas fa-book');
  });

  it('splits 20 questions equally across two subjects', function() {
    const quiz = JAMB_QUESTIONS.generateQuizQuestions(['english', 'mathematics']);
    expect(quiz.length).toBe(20);

    const counts = { 'English Language': 0, Mathematics: 0 };
    quiz.forEach(function(q) { counts[q._subject] += 1; });
    expect(counts['English Language']).toBe(10);
    expect(counts.Mathematics).toBe(10);
  });

  it('splits 20 questions across four subjects (5 each)', function() {
    const quiz = JAMB_QUESTIONS.generateQuizQuestions(['english', 'mathematics', 'biology', 'chemistry']);
    expect(quiz.length).toBe(20);
    const counts = {};
    quiz.forEach(function(q) {
      counts[q._subject] = (counts[q._subject] || 0) + 1;
    });
    Object.keys(counts).forEach(function(name) {
      expect(counts[name]).toBe(5);
    });
  });

  it('returns an empty list when no subjects are given', function() {
    expect(JAMB_QUESTIONS.generateQuizQuestions([])).toEqual([]);
  });

  it('keeps a valid correct index after shuffling options', function() {
    const quiz = JAMB_QUESTIONS.generateQuizQuestions(['english']);
    expect(quiz.length).toBe(20);
    quiz.forEach(function(q) {
      expect(q.options[q.correct]).toBeDefined();
      expect(q.options.length).toBe(4);
    });
  });
});

describe('JAMB_UTILS.imageSrc', function() {
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
