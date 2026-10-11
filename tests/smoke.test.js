/**
 * End-to-end smoke test against the real index.html wiring.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { vi } from 'vitest';
import JAMB_STATE from '../js/state.js';
import JAMB_UTILS from '../js/utils.js';
import JAMB_POINTS from '../js/points.js';
import JAMB_UNLOCK from '../js/unlock.js';
import JAMB_QUESTIONS from '../js/questions.js';
import JAMB_APP from '../js/main.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
document.documentElement.innerHTML = '<head></head><body>' +
  bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, '') +
  '</body>';

function makeQuestion(id, opts) {
  opts = opts || {};
  return {
    id: id,
    question: 'Question ' + id,
    options: ['Alpha', 'Beta', 'Gamma', 'Delta'],
    correct: 1,
    image: opts.image || null
  };
}

function makeBank() {
  const bank = {
    english: { name: 'English Language', icon: 'fa-language', questions: [] },
    mathematics: { name: 'Mathematics', icon: 'fa-calculator', questions: [] }
  };
  for (let i = 0; i < 20; i++) {
    bank.english.questions.push(makeQuestion('en-' + i, { image: 'images/diagram.png' }));
    bank.mathematics.questions.push(makeQuestion('ma-' + i));
  }
  return bank;
}

const bank = makeBank();
vi.stubGlobal('fetch', vi.fn(function() {
  return Promise.resolve({
    ok: true,
    json: function() { return Promise.resolve(bank); }
  });
}));

window.scrollTo = function() {};

function answerCurrent() {
  const q = JAMB_QUESTIONS.getCurrentQuestions()[JAMB_QUESTIONS.getCurrentIndex()];
  document.querySelectorAll('#optionsContainer .option')[q.correct].click();
}

describe('app smoke', function() {
  beforeAll(function() {
    localStorage.clear();
    // Pre-mark today's daily top-up so the share-only points flow below
    // starts from 0 points (daily top-up has its own unit tests).
    JAMB_UTILS.markToday('topup');
    JAMB_APP.init();
    return JAMB_QUESTIONS.loadQuestionBank();
  });

  it('loads required home, quiz, result and modal markup', function() {
    ['mainScreen', 'quizScreen', 'resultScreen', 'unlockModal', 'startQuizBtn',
      'subjectGrid', 'channel1Btn', 'channel2Btn', 'nextBtn', 'submitBtn',
      'reviewAccordion', 'referralLink'].forEach(function(id) {
      expect(document.getElementById(id)).not.toBeNull();
    });
  });

  it('renders subjects from the question bank', function() {
    const items = document.querySelectorAll('.subject-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('English Language');
  });

  it('keeps Start Quiz disabled until a subject is selected', function() {
    const btn = document.getElementById('startQuizBtn');
    expect(btn.disabled).toBe(true);
    document.querySelector('[data-subject-key="english"]').click();
    expect(btn.disabled).toBe(false);
    expect(btn.innerHTML).toContain('-5 pts');
  });

  it('opens the unlock modal when locked', function() {
    document.getElementById('startQuizBtn').click();
    expect(document.getElementById('unlockModal').classList.contains('show')).toBe(true);
    expect(document.getElementById('modalProceedBtn').disabled).toBe(true);
  });

  it('unlocks after both channels are joined without giving free exam points', async function() {
    // Channel buttons deep-link to WhatsApp and confirm the join after a
    // 2.5s grace period (unlock.js). Fake timers fast-forward that delay.
    vi.useFakeTimers();
    document.getElementById('modalChannel1Btn').click();
    document.getElementById('modalChannel2Btn').click();
    await vi.advanceTimersByTimeAsync(3000);
    expect(JAMB_STATE.isUnlocked()).toBe(true);
    expect(document.getElementById('modalProceedBtn').disabled).toBe(false);
    // Unlock awards the designed bonuses: +15 first-time both-channels
    // bonus and +5 daily check-in — but no exam points.
    expect(JAMB_POINTS.getPoints()).toBe(20);
  });

  it('earns points from sharing to start the exam, and uses points upon starting', function() {
    // User shares to earn points
    document.getElementById('shareFriendsBtn').click();
    expect(JAMB_POINTS.getPoints()).toBe(30);

    const pointsBefore = JAMB_POINTS.getPoints();
    document.getElementById('modalProceedBtn').click();

    const quizScreen = document.getElementById('quizScreen');
    expect(quizScreen.style.display).toBe('block');
    expect(document.getElementById('mainScreen').style.display).toBe('none');
    // Points are used up (5 points deducted for 1 subject)
    expect(JAMB_POINTS.getPoints()).toBe(pointsBefore - 5);

    const questions = JAMB_QUESTIONS.getCurrentQuestions();
    expect(questions.length).toBe(20);

    if (questions[0].image) {
      const img = document.querySelector('#questionText img.question-image');
      expect(img).not.toBeNull();
      expect(img.getAttribute('src')).toBe('/images/diagram.png');
    }

    const nextBtn = document.getElementById('nextBtn');
    expect(nextBtn.style.display).not.toBe('none');
    expect(nextBtn.disabled).toBe(false);

    answerCurrent();
    nextBtn.click();
    expect(JAMB_QUESTIONS.getCurrentIndex()).toBe(1);
    expect(document.getElementById('questionCounter').textContent).toContain('Question 2 of 20');

    for (let i = 1; i < 19; i++) {
      answerCurrent();
      document.getElementById('nextBtn').click();
    }
    expect(JAMB_QUESTIONS.getCurrentIndex()).toBe(19);
    expect(document.getElementById('nextBtn').style.display).toBe('none');
    expect(document.getElementById('submitBtn').style.display).toBe('block');

    answerCurrent();
    const earnedBefore = JAMB_POINTS.getEarned();
    document.getElementById('submitBtn').click();
    document.getElementById('submitBtn').click();

    expect(document.getElementById('resultScreen').style.display).toBe('block');
    expect(document.getElementById('resultCorrect').textContent).toBe('20');
    expect(document.getElementById('resultPercentage').textContent).toBe('100%');
    // No points earned from exam - only from sharing
    expect(JAMB_POINTS.getEarned()).toBe(earnedBefore);

    const reviewItems = document.querySelectorAll('#reviewAccordion .review-item');
    expect(reviewItems.length).toBe(20);
    expect(reviewItems[0].style.display).toBe('block');
    expect(reviewItems[5].style.display).toBe('none');
  });

  it('returns home with points used up and clears the subject selection', function() {
    document.getElementById('restartBtn').click();
    expect(document.getElementById('mainScreen').style.display).toBe('block');
    expect(document.getElementById('resultScreen').style.display).toBe('none');
    expect(JAMB_STATE.getSelectedSubjectCount()).toBe(0);
    expect(document.getElementById('startQuizBtn').disabled).toBe(true);
    // Points remained used up, no auto top-up
    expect(JAMB_POINTS.getPoints()).toBe(25);
  });
});
