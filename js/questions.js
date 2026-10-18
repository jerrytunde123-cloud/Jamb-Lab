/**
 * JAMB Quiz - Subjects, question bank, and quiz engine
 */

import JAMB_STATE from './state.js';
import JAMB_UTILS from './utils.js';
import JAMB_POINTS from './points.js';
import JAMB_HISTORY from './history.js';
import { apiEnabled, buildBankFromCatalog, fetchApiBank, fetchApiSubjects } from './api.js';
import { readCache, writeCache } from './cache.js';
import { addSeen, clearSeen, getSeen } from './seen.js';

const JAMB_QUESTIONS = (function() {
  'use strict';

  const state = JAMB_STATE;
  const utils = JAMB_UTILS;
  const points = JAMB_POINTS;
  const history = JAMB_HISTORY;

  const QUIZ_CONFIG = state.getConfig().QUIZ;
  const POINTS_CONFIG = state.getConfig().POINTS;

  const SUBJECT_PRIORITY = [
    'english', 'mathematics',
    'biology', 'chemistry', 'physics',
    'economics', 'commerce', 'financialAccounting',
    'literature', 'government', 'geography', 'civicEducation', 'history', 'crs', 'irk',
    'furtherMathematics',
    'computerStudies', 'dataProcessing',
    'agriculturalScience', 'animalHusbandry',
    'hausa', 'igbo', 'yoruba',
    'french', 'arabic',
    'marketing', 'insurance', 'officePractice', 'cateringCraftPractice',
    'homeEconomics', 'physicalEducation', 'fineArts', 'music'
  ];

  const PRIORITY_INDEX = {};
  SUBJECT_PRIORITY.forEach(function(key, i) { PRIORITY_INDEX[key] = i; });

  let currentQuestions = [];
  let currentIndex = 0;
  let userAnswers = [];
  let timeLeft = 0;
  let timerInterval = null;
  let reviewExpanded = false;
  let reviewToggleBound = false;
  let quizFinished = false;

  // Rows are loaded per subject on selection, never all at boot: the shared
  // deployment key is metered at 60 req/min, and a visitor only practises
  // up to MAX_SUBJECTS. `loadedKeys` means this session has a fetched or
  // revalidated copy (not just a cached one); `loading` holds the in-flight
  // promise so a second click joins it instead of fetching again.
  const loadedKeys = {};
  const loading = {};
  let sessionCache = {};

  function getSubjectName(key) {
    const bank = state.getQuestionBank();
    if (bank && bank[key] && bank[key].name) return bank[key].name;
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, function(s) { return s.toUpperCase(); });
  }

  function getSubjectIcon(key) {
    const bank = state.getQuestionBank();
    if (bank && bank[key] && bank[key].icon) {
      const icon = bank[key].icon;
      if (icon.indexOf(' ') === -1) return 'fas ' + icon;
      return icon;
    }
    return 'fas fa-book';
  }

  function scrollTop() {
    try {
      if (window && typeof window.scrollTo === 'function') window.scrollTo(0, 0);
    } catch (e) { /* jsdom and some webviews omit scrollTo */ }
  }

  function sortSubjectsByImportance(keys) {
    return keys.slice().sort(function(a, b) {
      const ai = PRIORITY_INDEX[a];
      const bi = PRIORITY_INDEX[b];
      if (ai !== undefined && bi !== undefined) return ai - bi;
      if (ai !== undefined) return -1;
      if (bi !== undefined) return 1;
      return a.localeCompare(b);
    });
  }

  function setLoadingText(msg) {
    // The text span holds the message so the spinner sibling survives;
    // fall back to the container for older markup.
    const textEl = utils.$('subjectLoadingText') || utils.$('subjectLoading');
    if (textEl) textEl.textContent = msg;
  }

  function applyOverlay(bank, rows) {
    Object.keys(rows).forEach(function(key) {
      if (bank[key] && rows[key] && Array.isArray(rows[key].questions)) {
        bank[key].questions = rows[key].questions;
      }
    });
    return bank;
  }

  /** Cached pages as an overlay, for painting cached rows without a request. */
  function cachedRows(cached) {
    const rows = {};
    Object.keys(cached || {}).forEach(function(key) {
      const entry = cached[key];
      if (!entry || !Array.isArray(entry.pages)) return;
      const questions = [];
      entry.pages.forEach(function(page) {
        questions.push.apply(questions, page.questions || []);
      });
      if (questions.length > 0) rows[key] = { questions: questions, pages: entry.pages };
    });
    return rows;
  }

  /**
   * Fetch (or revalidate) one subject's rows. Returns the same promise while
   * a request is in flight, so selecting and pressing Start cannot double-
   * fetch. Never rejects: a failed subject stays unloaded and can be retried.
   */
  function ensureSubjectLoaded(key) {
    if (!apiEnabled()) return Promise.resolve(null);
    const bank = state.getQuestionBank();
    const subject = bank && bank[key];
    if (!subject || !subject.apiSlug) return Promise.resolve(null);
    if (loadedKeys[key]) {
      return Promise.resolve({
        questions: subject.questions,
        pages: (sessionCache[key] && sessionCache[key].pages) || [],
      });
    }
    if (loading[key]) return loading[key];

    state.addLoadingSubject(key);
    const promise = fetchApiBank([[key, subject.apiSlug]], sessionCache)
      .then(function(overlay) {
        const entry = overlay[key];
        if (!entry) {
          utils.showToast('Could not load ' + getSubjectName(key), 'red');
          return null;
        }
        applyOverlay(bank, overlay);
        writeCache(overlay);
        sessionCache[key] = { pages: entry.pages };
        loadedKeys[key] = true;
        return entry;
      })
      .catch(function() {
        utils.showToast('Could not load ' + getSubjectName(key), 'red');
        return null;
      })
      .then(function(result) {
        delete loading[key];
        state.removeLoadingSubject(key);
        renderSubjectGrid();
        updateSubjectUI();
        return result;
      });

    loading[key] = promise;
    updateSubjectUI();
    renderSubjectGrid();
    return promise;
  }

  function loadQuestionBank() {
    const loadingEl = utils.$('subjectLoading');
    if (loadingEl) loadingEl.style.display = 'block';
    setLoadingText('Loading subjects…');

    // Subjects come from the discovery catalog (or the keyed catalog while
    // that surface rolls out). Boot paints any cached rows but fetches no
    // question endpoint: a subject's rows are fetched/revalidated when it is
    // selected. That keeps a visitor's traffic proportional to the subjects
    // they actually practise, instead of 25 requests for every page view.
    Object.keys(loadedKeys).forEach(function(key) { delete loadedKeys[key]; });
    Object.keys(loading).forEach(function(key) { delete loading[key]; });
    state.clearLoadingSubjects();
    sessionCache = {};

    return fetchApiSubjects()
      .then(function(apiSubjects) {
        const bank = buildBankFromCatalog(apiSubjects);
        if (!apiEnabled()) return bank;
        sessionCache = readCache();
        return applyOverlay(bank, cachedRows(sessionCache));
      })
      .then(function(bank) {
        state.setQuestionBank(bank);
        state.setSubjectsLoaded(true);
        renderSubjectGrid();
        if (loadingEl) loadingEl.style.display = 'none';
        return bank;
      })
      .catch(function() {
        const grid = utils.$('subjectGrid');
        if (grid) {
          grid.innerHTML = '';
          grid.setAttribute('aria-busy', 'false');
        }
        if (loadingEl) loadingEl.style.display = 'block';
        setLoadingText('Failed to load questions. Please refresh.');
        utils.showToast('Could not load quiz data', 'red');
        return null;
      });
  }

  function renderSubjectGrid() {
    const grid = utils.$('subjectGrid');
    if (!grid) return;

    grid.innerHTML = '';
    grid.setAttribute('aria-busy', 'false');
    const questionBank = state.getQuestionBank();
    if (!questionBank) return;

    const subjects = sortSubjectsByImportance(Object.keys(questionBank));
    const showMore = state.getShowMoreSubjects();
    const visible = showMore ? subjects : subjects.slice(0, 12);
    const selected = state.getSelectedSubjects();

    visible.forEach(function(key) {
      const displayName = getSubjectName(key);
      const isLoading = Boolean(loading[key]);
      const item = document.createElement('div');
      item.className = 'subject-item' +
        (selected.indexOf(key) !== -1 ? ' selected' : '') +
        (isLoading ? ' loading' : '');
      item.setAttribute('data-subject-key', key);

      const icon = document.createElement('i');
      icon.className = getSubjectIcon(key);
      item.appendChild(icon);
      item.appendChild(document.createTextNode(' ' + displayName));

      if (isLoading) {
        const spin = document.createElement('i');
        spin.className = 'fas fa-spinner fa-spin subject-spinner';
        item.appendChild(spin);
      }

      if (history) {
        const best = history.getBest(key);
        if (best) {
          const star = document.createElement('span');
          star.className = 'best-star';
          star.textContent = '★ ' + best.best + '%';
          item.appendChild(star);
        }
      }

      item.addEventListener('click', function() {
        toggleSubjectSelection(key, displayName, item);
      });
      grid.appendChild(item);
    });

    const showMoreBtn = utils.$('showMoreSubjectsBtn');
    if (showMoreBtn) {
      showMoreBtn.style.display = subjects.length > 12 ? 'block' : 'none';
      showMoreBtn.innerHTML = showMore
        ? '<i class="fas fa-minus"></i> Show less subjects'
        : '<i class="fas fa-plus"></i> Show more subjects';
    }
  }

  function toggleSubjectSelection(key, displayName, item) {
    const selected = state.getSelectedSubjects();

    if (selected.indexOf(key) !== -1) {
      state.removeSelectedSubject(key);
      if (item) item.classList.remove('selected');
    } else {
      if (selected.length >= QUIZ_CONFIG.MAX_SUBJECTS) {
        utils.showToast('Max ' + QUIZ_CONFIG.MAX_SUBJECTS + ' subjects', 'red');
        return;
      }
      state.addSelectedSubject(key);
      if (item) item.classList.add('selected');
      ensureSubjectLoaded(key);
    }

    updateSubjectUI();
  }

  function updateSubjectUI() {
    const countEl = utils.$('selectedCount');
    const costEl = utils.$('quizCost');
    const n = state.getSelectedSubjectCount();

    if (countEl) countEl.textContent = String(n);
    if (costEl) costEl.textContent = String(n * POINTS_CONFIG.QUIZ_COST);

    const infoEl = utils.$('bestScoresInfo');
    if (infoEl && history) {
      const selected = state.getSelectedSubjects();
      if (selected.length > 0) {
        const parts = selected.map(function(key) {
          const best = history.getBest(key);
          const name = getSubjectName(key);
          return best ? name + ' ' + best.best + '%' : name + ' —';
        });
        infoEl.innerHTML = '<i class="fas fa-trophy"></i> Your best: ' + parts.join(' · ');
      } else {
        infoEl.textContent = '';
      }
    }

    points.updateStartButtonState();
  }

  function takeFromPool(pool, count) {
    const taken = [];
    const n = Math.min(count, pool.length);
    for (let i = 0; i < n; i++) {
      taken.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return taken;
  }

  // Take up to `count` rows preferring ones this subject has not served
  // before. Resets the subject's history when everything has been seen, so
  // repeats happen only after exhaustion, never by luck. Taken rows leave
  // `pool`, so the leftover stage below cannot re-add them to this quiz.
  function takeUnseen(key, pool, count) {
    const seen = getSeen(key);
    let unseen = pool.filter(function(q) { return seen.indexOf(q.id) === -1; });
    if (unseen.length === 0 && pool.length > 0) {
      clearSeen(key);
      unseen = pool.slice();
    }
    const taken = takeFromPool(unseen, count);
    taken.forEach(function(q) {
      const at = pool.indexOf(q);
      if (at !== -1) pool.splice(at, 1);
    });
    if (taken.length < count) {
      taken.push.apply(taken, takeFromPool(pool, count - taken.length));
    }
    return taken;
  }

  function markServed(selected) {
    const byKey = {};
    selected.forEach(function(q) {
      if (!q || !q._key || !q.id) return;
      (byKey[q._key] = byKey[q._key] || []).push(q.id);
    });
    Object.keys(byKey).forEach(function(key) { addSeen(key, byKey[key]); });
  }

  function generateQuizQuestions(subjectKeys) {
    const questionBank = state.getQuestionBank();
    if (!questionBank || !subjectKeys.length) return [];

    const perSubject = [];
    subjectKeys.forEach(function(key) {
      const subjectData = questionBank[key];
      if (!subjectData || !subjectData.questions || !subjectData.questions.length) return;
      const subjectName = subjectData.name || getSubjectName(key);
      const pool = subjectData.questions.map(function(q) {
        return Object.assign({}, q, { _subject: subjectName, _key: key });
      });
      perSubject.push({ key: key, pool: utils.shuffleArray(pool) });
    });

    if (!perSubject.length) return [];

    const target = QUIZ_CONFIG.LENGTH;
    const selected = [];
    const base = Math.floor(target / perSubject.length);
    let remainder = target % perSubject.length;

    perSubject.forEach(function(entry) {
      const want = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
      selected.push.apply(selected, takeUnseen(entry.key, entry.pool, want));
    });

    if (selected.length < target) {
      const leftover = [];
      perSubject.forEach(function(entry) {
        leftover.push.apply(leftover, entry.pool);
      });
      selected.push.apply(selected, takeFromPool(leftover, target - selected.length));
    }

    markServed(selected);
    return utils.shuffleArray(selected).map(utils.shuffleQuestion);
  }

  function toggleShowMoreSubjects() {
    state.setShowMoreSubjects(!state.getShowMoreSubjects());
    renderSubjectGrid();
  }

  function startQuiz(subjectKeys) {
    const questions = generateQuizQuestions(subjectKeys);
    if (questions.length === 0) {
      utils.showToast('No questions available', 'red');
      return null;
    }

    currentQuestions = questions;
    currentIndex = 0;
    userAnswers = new Array(questions.length).fill(null);
    timeLeft = QUIZ_CONFIG.TIME;
    reviewExpanded = false;
    quizFinished = false;

    const quizData = {
      questions: questions,
      index: 0,
      answers: userAnswers,
      timeLeft: timeLeft,
      timer: null,
      subjectKeys: subjectKeys
    };
    state.setCurrentQuiz(quizData);
    return quizData;
  }

  function beginQuiz(subjects) {
    const mainScreen = utils.$('mainScreen');
    const quizScreen = utils.$('quizScreen');
    const resultScreen = utils.$('resultScreen');

    if (mainScreen) mainScreen.style.display = 'none';
    if (resultScreen) resultScreen.style.display = 'none';
    if (quizScreen) quizScreen.style.display = 'block';

    const subjectNameEl = utils.$('quizSubjectName');
    if (subjectNameEl) {
      subjectNameEl.innerHTML = '';
      const icon = document.createElement('i');
      icon.className = 'fas fa-book';
      subjectNameEl.appendChild(icon);
      subjectNameEl.appendChild(document.createTextNode(' ' + subjects.join(' · ')));
    }

    const scoreLbl = utils.$('scoreLbl');
    if (scoreLbl) scoreLbl.textContent = 'out of ' + currentQuestions.length;

    scrollTop();
    startTimer();
    renderQuestion();
    utils.showToast('Quiz started! Good luck!', 'green');
  }

  function startTimer() {
    clearInterval(timerInterval);
    updateTimerDisplay();
    timerInterval = setInterval(function() {
      timeLeft--;
      updateTimerDisplay();
      const quiz = state.getCurrentQuiz();
      if (quiz) quiz.timeLeft = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        utils.showToast('Time up!', 'red');
        finishQuiz();
      }
    }, 1000);
    const quiz = state.getCurrentQuiz();
    if (quiz) quiz.timer = timerInterval;
  }

  function updateTimerDisplay() {
    const timerEl = utils.$('timerDisplay');
    if (!timerEl) return;
    timerEl.innerHTML = '<i class="fas fa-clock"></i> ' + utils.formatTime(timeLeft);
    timerEl.classList.toggle('warning', timeLeft <= 60);
  }

  function renderQuestion() {
    if (currentIndex >= currentQuestions.length) {
      finishQuiz();
      return;
    }
    const q = currentQuestions[currentIndex];

    const counterEl = utils.$('questionCounter');
    if (counterEl) {
      counterEl.textContent = 'Question ' + (currentIndex + 1) + ' of ' + currentQuestions.length +
        (q._subject ? '  ·  ' + q._subject : '');
    }

    const questionEl = utils.$('questionText');
    if (questionEl) {
      questionEl.innerHTML = '';
      // A comprehension stem without its passage cannot be answered, so
      // rows arrive with the passage attached (see attachPassages) and it
      // renders first — the shared stimulus, then the question on it.
      if (q.passage && q.passage.text) {
        const pBlock = document.createElement('div');
        pBlock.className = 'passage-block';
        const pHead = document.createElement('div');
        pHead.className = 'passage-head';
        pHead.textContent = [q.passage.kind, q.passage.title].filter(Boolean).join(' — ') || 'Reading passage';
        pBlock.appendChild(pHead);
        const pText = document.createElement('div');
        pText.className = 'passage-text';
        utils.renderFormattedText(pText, q.passage.text);
        pBlock.appendChild(pText);
        questionEl.appendChild(pBlock);
      }
      const stem = document.createElement('div');
      utils.renderFormattedText(stem, q.question);
      questionEl.appendChild(stem);
      if (q.image && q.image.url) {
        const img = document.createElement('img');
        img.className = 'question-image';
        img.alt = 'Question illustration';
        img.src = utils.imageSrc(q.image.url);
        img.addEventListener('error', function() { img.remove(); });
        // The API states the placement: above means the stem refers down
        // ("the diagram above"), below means it refers up. Default below.
        if (q.image.position === 'above' && stem.parentNode === questionEl) {
          questionEl.insertBefore(img, stem);
        } else {
          questionEl.appendChild(img);
        }
      }
    }

    const progressFill = utils.$('progressFill');
    if (progressFill) {
      progressFill.style.width = ((currentIndex + 1) / currentQuestions.length) * 100 + '%';
    }

    const container = utils.$('optionsContainer');
    if (container) {
      container.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D', 'E'];
      (q.options || []).forEach(function(opt, i) {
        const div = document.createElement('div');
        div.className = 'option' + (userAnswers[currentIndex] === i ? ' selected' : '');
        const letter = document.createElement('span');
        letter.className = 'letter';
        letter.textContent = letters[i] || String(i + 1);
        const text = document.createElement('span');
        text.className = 'option-text';
        utils.renderFormattedText(text, opt);
        div.appendChild(letter);
        div.appendChild(text);
        // A figure that belongs to one option renders with that option,
        // never hoisted under the stem. Shuffling carries it along
        // (see shuffleQuestion) so it cannot drift to another letter.
        const optImg = q.optionImages && q.optionImages[i];
        if (optImg && optImg.url) {
          const img = document.createElement('img');
          img.className = 'option-image';
          img.alt = 'Option illustration';
          img.src = utils.imageSrc(optImg.url);
          img.addEventListener('error', function() { img.remove(); });
          div.appendChild(img);
        }
        div.addEventListener('click', function() { selectOption(i); });
        container.appendChild(div);
      });
    }

    const prevBtn = utils.$('prevBtn');
    const nextBtn = utils.$('nextBtn');
    const submitBtn = utils.$('submitBtn');
    const last = currentIndex === currentQuestions.length - 1;

    if (prevBtn) prevBtn.style.display = currentIndex > 0 ? 'block' : 'none';
    if (nextBtn) nextBtn.style.display = last ? 'none' : 'block';
    if (submitBtn) submitBtn.style.display = last ? 'block' : 'none';
  }

  function selectOption(index) {
    const q = currentQuestions[currentIndex];
    if (!q || !q.options || index < 0 || index >= q.options.length) return;
    userAnswers[currentIndex] = index;
    renderQuestion();
  }

  function nextQuestion() {
    if (currentIndex < currentQuestions.length - 1) {
      currentIndex++;
      renderQuestion();
    }
  }

  function prevQuestion() {
    if (currentIndex > 0) {
      currentIndex--;
      renderQuestion();
    }
  }

  function finishQuiz() {
    if (quizFinished) return;
    quizFinished = true;
    clearInterval(timerInterval);
    const resultScreen = utils.$('resultScreen');
    const quizScreen = utils.$('quizScreen');
    if (quizScreen) quizScreen.style.display = 'none';
    if (resultScreen) resultScreen.style.display = 'block';
    showResults();
    scrollTop();
  }

  function calculateScore() {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    currentQuestions.forEach(function(q, i) {
      if (userAnswers[i] === null) unanswered++;
      else if (userAnswers[i] === q.correct) correct++;
      else wrong++;
    });

    const percentage = currentQuestions.length > 0
      ? Math.round((correct / currentQuestions.length) * 100)
      : 0;

    return {
      total: currentQuestions.length,
      correct: correct,
      wrong: wrong,
      unanswered: unanswered,
      percentage: percentage,
      pointsEarned: 0
    };
  }

  function applyReviewVisibility() {
    const accordion = utils.$('reviewAccordion');
    if (!accordion) return;
    const items = accordion.querySelectorAll('.review-item');
    items.forEach(function(item, i) {
      item.style.display = (reviewExpanded || i < 5) ? 'block' : 'none';
    });
    const moreBtn = utils.$('showMoreQuestions');
    if (moreBtn) {
      moreBtn.style.display = items.length > 5 ? 'block' : 'none';
      moreBtn.innerHTML = reviewExpanded
        ? '<i class="fas fa-minus"></i> Show less questions'
        : '<i class="fas fa-plus"></i> Show more questions';
    }
  }

  function appendOptionImage(parent, q, idx) {
    const optImg = q.optionImages && q.optionImages[idx];
    if (!optImg || !optImg.url) return;
    const img = document.createElement('img');
    img.className = 'option-image';
    img.alt = 'Option illustration';
    img.src = utils.imageSrc(optImg.url);
    img.addEventListener('error', function() { img.remove(); });
    parent.appendChild(img);
  }

  function bindReviewToggle() {    if (reviewToggleBound) return;
    const moreBtn = utils.$('showMoreQuestions');
    if (!moreBtn) return;
    reviewToggleBound = true;
    moreBtn.addEventListener('click', function() {
      reviewExpanded = !reviewExpanded;
      applyReviewVisibility();
    });
  }

  function showResults() {
    const score = calculateScore();
    const letters = ['A', 'B', 'C', 'D', 'E'];

    const correctEl = utils.$('resultCorrect');
    const wrongEl = utils.$('resultWrong');
    const unansEl = utils.$('resultUnanswered');
    const pctEl = utils.$('resultPercentage');
    const ptsEl = utils.$('resultPoints');

    if (correctEl) correctEl.textContent = String(score.correct);
    if (wrongEl) wrongEl.textContent = String(score.wrong);
    if (unansEl) unansEl.textContent = String(score.unanswered);
    if (pctEl) pctEl.textContent = score.percentage + '%';
    if (ptsEl) ptsEl.textContent = (score.pointsEarned >= 0 ? '+' : '') + score.pointsEarned;

    const title = utils.$('resultTitle');
    const message = utils.$('resultMessage');
    if (score.percentage === 100) {
      if (title) title.textContent = 'Perfect score!';
      if (message) message.textContent = 'You got every question right.';
    } else if (score.percentage >= 70) {
      if (title) title.textContent = 'Well done!';
      if (message) message.textContent = 'Keep practicing to improve your score.';
    } else {
      if (title) title.textContent = 'Keep going';
      if (message) message.textContent = 'Review the answers below and try again.';
    }

    const accordion = utils.$('reviewAccordion');
    if (accordion) {
      accordion.innerHTML = '';
      currentQuestions.forEach(function(q, overallIndex) {
        const ok = userAnswers[overallIndex] !== null && userAnswers[overallIndex] === q.correct;
        const item = document.createElement('div');
        item.className = 'review-item ' + (ok ? 'correct' : 'wrong');

        const qEl = document.createElement('div');
        qEl.className = 'q';
        const qNum = document.createElement('span');
        qNum.textContent = (overallIndex + 1) + '. ';
        qEl.appendChild(qNum);
        const qText = document.createElement('span');
        utils.renderFormattedText(qText, q.question + ' ');
        qEl.appendChild(qText);
        if (q._subject) {
          const sub = document.createElement('span');
          sub.className = 'q-subject';
          sub.textContent = '[' + q._subject + ']';
          qEl.appendChild(sub);
        }
        item.appendChild(qEl);

        const ans = document.createElement('div');
        ans.className = 'ans';
        ans.appendChild(document.createTextNode('Your answer: '));
        const userSpan = document.createElement('span');
        userSpan.className = ok ? 'correct-ans' : 'user-wrong';
        if (userAnswers[overallIndex] === null) {
          userSpan.textContent = 'Not answered';
        } else {
          const idx = userAnswers[overallIndex];
          userSpan.appendChild(document.createTextNode((letters[idx] || '') + '. '));
          const optSpan = document.createElement('span');
          utils.renderFormattedText(optSpan, q.options[idx]);
          userSpan.appendChild(optSpan);
          appendOptionImage(userSpan, q, idx);
        }
        ans.appendChild(userSpan);
        item.appendChild(ans);

        if (!ok && q.options && q.options[q.correct] !== undefined) {
          const ca = document.createElement('div');
          ca.className = 'ans';
          ca.appendChild(document.createTextNode('Correct: '));
          const caSpan = document.createElement('span');
          caSpan.className = 'correct-ans';
          caSpan.appendChild(document.createTextNode((letters[q.correct] || '') + '. '));
          const optSpan = document.createElement('span');
          utils.renderFormattedText(optSpan, q.options[q.correct]);
          caSpan.appendChild(optSpan);
          appendOptionImage(caSpan, q, q.correct);
          ca.appendChild(caSpan);
          item.appendChild(ca);
        }

        accordion.appendChild(item);
      });
    }

    bindReviewToggle();
    applyReviewVisibility();

    if (history) {
      const quiz = state.getCurrentQuiz();
      const subjects = quiz ? quiz.subjectKeys : [];
      const newBests = history.recordQuiz(subjects, score);
      const badge = utils.$('bestBadge');
      if (badge) {
        if (newBests.length > 0) {
          badge.classList.add('show');
          utils.showToast('New personal best in ' + newBests.map(getSubjectName).join(', ') + '!', 'green');
        } else {
          badge.classList.remove('show');
        }
      }
    }
  }

  function restartQuiz() {
    clearInterval(timerInterval);
    const resultScreen = utils.$('resultScreen');
    const mainScreen = utils.$('mainScreen');
    if (resultScreen) resultScreen.style.display = 'none';
    if (mainScreen) mainScreen.style.display = 'block';

    state.clearSelectedSubjects();
    state.clearCurrentQuiz();
    currentQuestions = [];
    currentIndex = 0;
    userAnswers = [];
    renderSubjectGrid();
    updateSubjectUI();

    scrollTop();
  }

  function tryStartQuiz() {
    if (!state.getQuestionBank()) {
      utils.showToast('Question bank not loaded', 'red');
      return false;
    }
    const selected = state.getSelectedSubjects();
    if (selected.length === 0) {
      utils.showToast('Select at least 1 subject', 'red');
      return false;
    }
    if (apiEnabled()) {
      const awaiting = selected.filter(function(key) { return Boolean(loading[key]); });
      if (awaiting.length > 0) {
        utils.showToast('Still loading ' + awaiting.map(getSubjectName).join(', '), 'red');
        return false;
      }
      const missing = selected.filter(function(key) { return !loadedKeys[key]; });
      if (missing.length > 0) {
        missing.forEach(ensureSubjectLoaded);
        utils.showToast('Loading ' + missing.map(getSubjectName).join(', ') + '…', 'red');
        return false;
      }
    }
    const cost = selected.length * POINTS_CONFIG.QUIZ_COST;
    if (!points.deductPoints(cost)) {
      utils.showToast('Need ' + cost + ' pts (you have ' + points.getPoints() + '). Share below to get points!', 'red');
      const shareSec = document.querySelector('.share-section');
      if (shareSec && typeof shareSec.scrollIntoView === 'function') {
        shareSec.scrollIntoView({ behavior: 'smooth' });
      }
      return false;
    }
    const quiz = startQuiz(selected);
    if (!quiz) {
      points.addPoints(cost);
      return false;
    }
    beginQuiz(selected.map(getSubjectName));
    return true;
  }

  return {
    getSubjectName: getSubjectName,
    getSubjectIcon: getSubjectIcon,
    ensureSubjectLoaded: ensureSubjectLoaded,
    loadQuestionBank: loadQuestionBank,
    renderSubjectGrid: renderSubjectGrid,
    toggleSubjectSelection: toggleSubjectSelection,
    toggleShowMoreSubjects: toggleShowMoreSubjects,
    updateSubjectUI: updateSubjectUI,
    generateQuizQuestions: generateQuizQuestions,
    startQuiz: startQuiz,
    beginQuiz: beginQuiz,
    renderQuestion: renderQuestion,
    selectOption: selectOption,
    nextQuestion: nextQuestion,
    prevQuestion: prevQuestion,
    finishQuiz: finishQuiz,
    calculateScore: calculateScore,
    showResults: showResults,
    restartQuiz: restartQuiz,
    tryStartQuiz: tryStartQuiz,
    getCurrentQuestions: function() { return currentQuestions; },
    getCurrentIndex: function() { return currentIndex; },
    getUserAnswers: function() { return userAnswers; },
    getTimeLeft: function() { return timeLeft; }
  };
})();

export default JAMB_QUESTIONS;
