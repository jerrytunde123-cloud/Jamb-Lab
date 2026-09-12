/**
 * JAMB Quiz - Questions Module
 * Handles question loading, selection, quiz generation, and quiz UI
 */

const JAMB_QUESTIONS = (function() {
  'use strict';

  // Import dependencies
  const state = JAMB_STATE;
  const utils = JAMB_UTILS;
  const points = JAMB_POINTS;
  const config = state.getConfig();
  const QUIZ_CONFIG = config.QUIZ;
  const POINTS_CONFIG = config.POINTS;

  // Subject display names
  const SUBJECT_NAMES = {
    mathematics: 'Mathematics',
    english: 'English',
    biology: 'Biology',
    chemistry: 'Chemistry',
    physics: 'Physics',
    economics: 'Economics',
    government: 'Government',
    history: 'History',
    literature: 'Literature',
    accounting: 'Accounting',
    commerce: 'Commerce',
    civicEducation: 'Civic Education',
    christianReligiousStudies: 'CRS',
    islamicReligiousStudies: 'IRS',
    agriculturalScience: 'Agricultural Science',
    geography: 'Geography',
    french: 'French',
    hausa: 'Hausa',
    igbo: 'Igbo',
    yoruba: 'Yoruba',
    computerStudies: 'Computer Studies',
    dataProcessing: 'Data Processing',
    visualArt: 'Visual Art',
    music: 'Music',
    homeEconomics: 'Home Economics',
    officePractice: 'Office Practice',
    physicalEducation: 'Physical Education'
  };

  const SUBJECT_ICONS = {
    mathematics: 'fas fa-square-root-variable',
    english: 'fas fa-language',
    biology: 'fas fa-dna',
    chemistry: 'fas fa-flask',
    physics: 'fas fa-atom',
    economics: 'fas fa-chart-line',
    government: 'fas fa-landmark',
    history: 'fas fa-clock-rotate-left',
    literature: 'fas fa-book-open',
    accounting: 'fas fa-calculator',
    commerce: 'fas fa-store',
    civicEducation: 'fas fa-gavel',
    christianReligiousStudies: 'fas fa-cross',
    islamicReligiousStudies: 'fas fa-star-and-crescent',
    agriculturalScience: 'fas fa-seedling',
    geography: 'fas fa-globe-americas',
    french: 'fas fa-language',
    hausa: 'fas fa-font',
    igbo: 'fas fa-font',
    yoruba: 'fas fa-font',
    computerStudies: 'fas fa-laptop-code',
    dataProcessing: 'fas fa-database',
    visualArt: 'fas fa-palette',
    music: 'fas fa-music',
    homeEconomics: 'fas fa-home',
    officePractice: 'fas fa-file-alt',
    physicalEducation: 'fas fa-running'
  };

  // Helper functions
  function getSubjectName(key) {
    return SUBJECT_NAMES[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
  }

  function getSubjectIcon(key) {
    return SUBJECT_ICONS[key] || 'fas fa-book';
  }

  // Subjects ranked by how common/important they are for JAMB UTME
  // (most common first; anything not listed falls back to alphabetical after)
  const SUBJECT_PRIORITY = [
    // Core (compulsory for nearly all candidates)
    'english',            // English Language - compulsory
    'mathematics',        // Mathematics - compulsory for most
    // Science track
    'biology',
    'chemistry',
    'physics',
    // Commercial / management track
    'economics',
    'commerce',
    'financialAccounting',
    // Arts / social sciences
    'literature',
    'government',
    'geography',
    'civicEducation',
    'history',
    'crs',
    'irk',
    // Mathematics extension
    'furtherMathematics',
    // Technology / ICT
    'computerStudies',
    'dataProcessing',
    // Agriculture
    'agriculturalScience',
    'animalHusbandry',
    // Nigerian languages
    'hausa',
    'igbo',
    'yoruba',
    // Foreign languages
    'french',
    'arabic',
    // Business / vocational
    'marketing',
    'insurance',
    'officePractice',
    'cateringCraftPractice',
    // Home / other electives
    'homeEconomics',
    'physicalEducation',
    'fineArts',
    'music'
  ];

  const PRIORITY_INDEX = (function() {
    const map = {};
    SUBJECT_PRIORITY.forEach(function(key, i) { map[key] = i; });
    return map;
  })();

  // Sort subjects: priority order first, unknown keys alphabetically after
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
    const shuffled = shuffleArray(q.options);
    let correctIndex = shuffled.indexOf(q.options[q.correct]);
    if (correctIndex === -1) correctIndex = 0;
    return Object.assign({}, q, { options: shuffled, correct: correctIndex });
  }

  // Load question bank from JSON file
  async function loadQuestionBank() {
    try {
      const loadingEl = utils.$('subjectLoading');
      if (loadingEl) loadingEl.style.display = 'block';
      
      const response = await fetch('question-bank.json');
      if (!response.ok) throw new Error('Failed to load question bank');
      
      const bank = await response.json();
      state.setQuestionBank(bank);
      state.setSubjectsLoaded(true);
      
      console.log('Question bank loaded. Subjects:', Object.keys(bank).length);
      renderSubjectGrid();
      
      if (loadingEl) loadingEl.style.display = 'none';
      return bank;
    } catch (error) {
      console.error('Failed to load question bank:', error);
      const loadingEl = utils.$('subjectLoading');
      if (loadingEl) {
        loadingEl.textContent = 'Failed to load questions. Please refresh.';
        loadingEl.style.display = 'block';
      }
      utils.showToast('Could not load quiz data', 'red');
      return null;
    }
  }

  // Render the subject grid UI
  function renderSubjectGrid() {
    const grid = utils.$('subjectGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const questionBank = state.getQuestionBank();
    if (!questionBank) return;
    
    const subjects = sortSubjectsByImportance(Object.keys(questionBank));
    const showMore = state.getShowMoreSubjects();
    const visibleSubjects = showMore ? subjects : subjects.slice(0, 12);
    
    visibleSubjects.forEach(function(key) {
      const displayName = getSubjectName(key);
      const iconClass = getSubjectIcon(key);
      
      const item = document.createElement('div');
      item.className = 'subject-item';
      item.setAttribute('data-subject-key', key);
      item.setAttribute('data-subject-name', displayName);
      item.innerHTML = '<i class="' + iconClass + '"></i> ' + displayName;
      
      // Show a star on subjects you've played before
      if (history) {
        const best = history.getBest(key);
        if (best) {
          const star = document.createElement('span');
          star.className = 'best-star';
          star.innerHTML = '&#9733; ' + best.best + '%';
          item.appendChild(star);
        }
      }

      item.addEventListener('click', function() {
        toggleSubjectSelection(key, displayName, item);
      });
      
      grid.appendChild(item);
    });
    
    // Update show more button
    const showMoreBtn = utils.$('showMoreSubjectsBtn');
    if (showMoreBtn) {
      showMoreBtn.style.display = subjects.length > 12 ? 'block' : 'none';
      showMoreBtn.innerHTML = showMore 
        ? '<i class="fas fa-minus"></i> Show less subjects' 
        : '<i class="fas fa-plus"></i> Show more subjects';
    }
  }

  // Toggle subject selection
  function toggleSubjectSelection(key, displayName, item) {
    // Allow subject selection even when locked - unlock is only required at quiz start
    const selected = state.getSelectedSubjects();
    
    if (selected.includes(key)) {
      state.removeSelectedSubject(key);
      if (item) item.classList.remove('selected');
    } else {
      if (selected.length >= QUIZ_CONFIG.MAX_SUBJECTS) {
        utils.showToast('Max ' + QUIZ_CONFIG.MAX_SUBJECTS + ' subjects', 'red');
        return;
      }
      state.addSelectedSubject(key);
      if (item) item.classList.add('selected');
    }
    
        updateSubjectUI();
    updateStartButtonState();
  }

  // Select a subject (wrapper for toggle)
  function selectSubject(key, displayName) {
    const item = document.querySelector('.subject-item[data-subject-key="' + key + '"]');
    toggleSubjectSelection(key, displayName, item);
  }

  // Update subject selection UI
  function updateSubjectUI() {
    const countEl = utils.$('selectedCount');
    const costEl = utils.$('quizCost');

    if (countEl) countEl.textContent = state.getSelectedSubjectCount();
    if (costEl) costEl.textContent = state.getSelectedSubjectCount() * POINTS_CONFIG.QUIZ_COST;

    // Show best scores for selected subjects
    const infoEl = utils.$('bestScoresInfo');
    if (infoEl && history) {
      const selected = state.getSelectedSubjects();
      if (selected.length > 0) {
        const parts = selected.map(function(key) {
          const best = history.getBest(key);
          const name = getSubjectName(key).split(' ')[0];
          return best ? name + ' ' + best.best + '%' : name + ' -';
        });
        infoEl.innerHTML = '<i class="fas fa-trophy"></i> Your best: ' + parts.join(' &middot; ');
      } else {
        infoEl.innerHTML = '';
      }
    }

    updateStartButtonState();
  }

        // Update start quiz button state
  function updateStartButtonState() {
    const btn = utils.$('startQuizBtn');
    if (!btn) return;

    const selectedCount = state.getSelectedSubjectCount();

    if (selectedCount === 0) {
      // Disabled when no subjects selected, still calls onStartQuiz which opens modal
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-play"></i> Select subjects';
    } else {
      // Enabled when subjects are selected, just opens modal
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-play"></i> Start Quiz';
    }
  }

  // Generate quiz questions from selected subjects
  function generateQuizQuestions(subjectKeys) {
    const questionBank = state.getQuestionBank();
    if (!questionBank) return [];
    
    const pool = [];
    subjectKeys.forEach(function(key) {
      const subjectData = questionBank[key];
      if (subjectData && subjectData.questions && subjectData.questions.length) {
        const shuffled = shuffleArray(subjectData.questions.slice());
        const subjectName = subjectData.name || key;
        shuffled.forEach(function(q) {
          pool.push(Object.assign({}, q, { _subject: subjectName }));
        });
      }
    });
    
    if (pool.length === 0) return [];
    
    const selected = [];
    const targetCount = Math.min(QUIZ_CONFIG.LENGTH, pool.length);
    for (let i = 0; i < targetCount; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      selected.push(pool.splice(idx, 1)[0]);
    }
    
    return shuffleArray(selected).map(shuffleQuestion);
  }

  // Show more/less subjects toggle
  function toggleShowMoreSubjects() {
    state.setShowMoreSubjects(!state.getShowMoreSubjects());
    renderSubjectGrid();
  }

  // Return public API
  // ============================================
  // QUIZ ENGINE
  // ============================================

  // Import history (loaded via separate script tag)
  const history = (typeof JAMB_HISTORY !== 'undefined') ? JAMB_HISTORY : null;

  let currentQuestions = [];
  let currentIndex = 0;
  let userAnswers = [];
  let timeLeft = 0;
  let timerInterval = null;

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
    if (subjectNameEl) subjectNameEl.innerHTML = '<i class="fas fa-book"></i> ' + subjects.join(' \u00b7 ');

    const scoreLbl = utils.$('scoreLbl');
    if (scoreLbl) scoreLbl.textContent = 'out of ' + currentQuestions.length;

    window.scrollTo(0, 0);
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
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeStr = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    const timerEl = utils.$('timerDisplay');
    if (timerEl) {
      timerEl.innerHTML = '<i class="fas fa-clock"></i> ' + timeStr;
      timerEl.classList.toggle('warning', timeLeft <= 60);
    }
  }

  function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    const paddedM = String(m).padStart(2, '0');
    const paddedS = String(s).padStart(2, '0');
    return paddedM + ':' + paddedS;
  }

  function renderQuestion() {
    if (currentIndex >= currentQuestions.length) {
      finishQuiz();
      return;
    }
    const q = currentQuestions[currentIndex];

    const counterEl = utils.$('questionCounter');
    if (counterEl) {
      counterEl.textContent = 'Question ' + (currentIndex + 1) + ' of ' + currentQuestions.length + '  \u00b7  ' + (q._subject || '');
    }

    const questionEl = utils.$('questionText');
    if (questionEl) questionEl.textContent = q.question;

    const progressFill = utils.$('progressFill');
    if (progressFill) {
      progressFill.style.width = ((currentIndex + 1) / currentQuestions.length) * 100 + '%';
    }

    const container = utils.$('optionsContainer');
    if (container) {
      container.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D', 'E'];
      q.options.forEach(function(opt, i) {
        const div = document.createElement('div');
        div.className = 'option' + (userAnswers[currentIndex] === i ? ' selected' : '');
        div.innerHTML = '<span class="letter">' + letters[i] + '</span><span>' + opt + '</span>';
        div.addEventListener('click', function() { selectOption(i); });
        container.appendChild(div);
      });
    }

    const prevBtn = utils.$('prevBtn');
    const nextBtn = utils.$('nextBtn');
    const submitBtn = utils.$('submitBtn');

    if (prevBtn) prevBtn.style.display = currentIndex > 0 ? 'block' : 'none';
    if (currentIndex === currentQuestions.length - 1) {
      if (nextBtn) nextBtn.style.display = 'none';
      if (submitBtn) submitBtn.style.display = 'block';
    } else {
      if (nextBtn) nextBtn.style.display = 'block';
      if (submitBtn) submitBtn.style.display = 'none';
    }
  }

  function selectOption(index) {
    if (index < 0 || index >= (currentQuestions[currentIndex] || { options: [] }).options.length) return;
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
    clearInterval(timerInterval);
    const resultScreen = utils.$('resultScreen');
    const quizScreen = utils.$('quizScreen');
    if (quizScreen) quizScreen.style.display = 'none';
    if (resultScreen) resultScreen.style.display = 'block';
    showResults();
    window.scrollTo(0, 0);
  }

  function calculateScore() {
    let correct = 0, wrong = 0, unanswered = 0;
    currentQuestions.forEach(function(q, i) {
      if (userAnswers[i] === null) {
        unanswered++;
      } else if (userAnswers[i] === q.correct) {
        correct++;
      } else {
        wrong++;
      }
    });

    let pointsEarned = 0;
    pointsEarned += correct * POINTS_CONFIG.CORRECT_BONUS;
    pointsEarned += wrong * POINTS_CONFIG.WRONG_PENALTY;

    if (unanswered === 0 && currentQuestions.length > 0) {
      pointsEarned += POINTS_CONFIG.ATTEND_ALL_BONUS;
    }
    if (wrong === 0 && correct === currentQuestions.length && currentQuestions.length > 0) {
      pointsEarned += POINTS_CONFIG.PERFECT_BONUS;
    }

    const percentage = currentQuestions.length > 0
      ? Math.round((correct / currentQuestions.length) * 100)
      : 0;

    return {
      total: currentQuestions.length, correct: correct, wrong: wrong,
      unanswered: unanswered, percentage: percentage, pointsEarned: pointsEarned
    };
  }

  function showResults() {
    const score = calculateScore();
    const letters = ['A', 'B', 'C', 'D', 'E'];

    // Use the actual IDs from index.html result screen
    const correctEl = utils.$('resultCorrect');
    const wrongEl = utils.$('resultWrong');
    const unansEl = utils.$('resultUnanswered');
    const pctEl = utils.$('resultPercentage');
    const ptsEl = utils.$('resultPoints');

    if (correctEl) correctEl.textContent = score.correct;
    if (wrongEl) wrongEl.textContent = score.wrong;
    if (unansEl) unansEl.textContent = score.unanswered;
    if (pctEl) pctEl.textContent = score.percentage + '%';
    if (ptsEl) ptsEl.textContent = '+' + score.pointsEarned;

    const accordion = utils.$('reviewAccordion');
    if (accordion) {
      accordion.innerHTML = currentQuestions.map(function(q, overallIndex) {
        const ok = userAnswers[overallIndex] !== null && userAnswers[overallIndex] === q.correct;
        const ua = userAnswers[overallIndex] !== null
          ? letters[userAnswers[overallIndex]] + '. ' + q.options[userAnswers[overallIndex]]
          : '<em>Not answered</em>';
        const ca = letters[q.correct] + '. ' + q.options[q.correct];
        return '<div class="review-item ' + (ok ? 'correct' : 'wrong') + '">' +
          '<div class="q">' + (overallIndex + 1) + '. ' + q.question +
          ' <span style="color:#0284c7;font-size:0.75rem;">[' + (q._subject || '') + ']</span></div>' +
          '<div class="ans">Your answer: ' +
          (ok ? '<span class="correct-ans">' + ua + '</span>' : '<span class="user-wrong">' + ua + '</span>') +
          '</div>' + (!ok ? '<div class="ans">Correct: <span class="correct-ans">' + ca + '</span></div>' : '') +
          '</div>';
      }).join('');

      accordion.querySelectorAll('.review-item').forEach(function(item, i) {
        item.style.display = i < 5 ? 'block' : 'none';
      });
    }

    const moreBtn = utils.$('showMoreQuestions');
    if (moreBtn && accordion) {
      let expanded = false;
      moreBtn.addEventListener('click', function() {
        expanded = !expanded;
        const items = accordion.querySelectorAll('.review-item');
        items.forEach(function(item, i) {
          item.style.display = (expanded || i < 5) ? 'block' : 'none';
        });
        moreBtn.innerHTML = expanded ? '<i class="fas fa-minus"></i> Show less questions' : '<i class="fas fa-plus"></i> Show more questions';
      });
    }

    points.addPoints(score.pointsEarned);

    // Record best score per subject and show badge if new record
    if (history) {
      const quiz = state.getCurrentQuiz();
      const subjects = quiz ? quiz.subjectKeys : [];
      const newBests = history.recordQuiz(subjects, score);
      const badge = utils.$('bestBadge');
      if (badge) {
        if (newBests.length > 0) {
          badge.classList.add('show');
          utils.showToast('New personal best in ' + newBests.map(function(s){ return getSubjectName(s); }).join(', ') + '!', 'green');
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
    utils.getAll('.subject-item').forEach(function(el) { el.classList.remove('selected'); });
    updateSubjectUI();
    updateStartButtonState();

    if (typeof JAMB_DAILY !== 'undefined' && JAMB_DAILY.dailyTopUp) {
      JAMB_DAILY.dailyTopUp();
    }
    window.scrollTo(0, 0);
  }

  // ============================================
  // EXPOSE PUBLIC API
  // ============================================

  return {
    // Subject helpers
    getSubjectName: getSubjectName,
    getSubjectIcon: getSubjectIcon,

    // Question bank
    loadQuestionBank: loadQuestionBank,

    // Subject UI
    renderSubjectGrid: renderSubjectGrid,
    selectSubject: selectSubject,
    toggleSubjectSelection: toggleSubjectSelection,
    toggleShowMoreSubjects: toggleShowMoreSubjects,
    updateSubjectUI: updateSubjectUI,
    updateStartButtonState: updateStartButtonState,

    // Question generation
    generateQuizQuestions: generateQuizQuestions,

    // Quiz engine
    startQuiz: startQuiz,
    beginQuiz: beginQuiz,
    startTimer: startTimer,
    updateTimerDisplay: updateTimerDisplay,
    formatTime: formatTime,
    renderQuestion: renderQuestion,
    selectOption: selectOption,
    nextQuestion: nextQuestion,
    prevQuestion: prevQuestion,
    finishQuiz: finishQuiz,
    calculateScore: calculateScore,
    showResults: showResults,
    restartQuiz: restartQuiz,
    getCurrentQuestions: function() { return currentQuestions; },
    getCurrentIndex: function() { return currentIndex; },
    getUserAnswers: function() { return userAnswers; },
    getTimeLeft: function() { return timeLeft; },

    // Utilities
    shuffleArray: shuffleArray,
    shuffleQuestion: shuffleQuestion
  };
})();
