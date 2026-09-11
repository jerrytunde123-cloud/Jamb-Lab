/**
 * JAMB Quiz - Main Application Entry Point
 * Initializes all modules and sets up event listeners
 */

const JAMB_APP = (function() {
  'use strict';

  const state = JAMB_STATE;
  const utils = JAMB_UTILS;
  const points = JAMB_POINTS;
  const referrals = JAMB_REFERRALS;
  const unlock = JAMB_UNLOCK;
  const daily = JAMB_DAILY;
  const questions = JAMB_QUESTIONS;

  function init() {
    console.log('🚀 Initializing JAMB Quiz App...');
    referrals.getUserId();
    referrals.handleIncomingReferral();
    awardReferralToCurrent();
    const refCountEl = utils.$('refCount');
    if (refCountEl) refCountEl.textContent = localStorage.getItem('jamb_ref_count') || '0';
    points.updateUI();
    unlock.checkUnlock();
    daily.refreshDailyTasks();
    updateSubjectUI();
    daily.dailyTopUp();
    questions.loadQuestionBank();
    console.log('✅ JAMB Quiz app ready');
  }

  function awardReferralToCurrent() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && ref !== referrals.getUserId() && state.getReferralUsed() !== ref) {
      if (localStorage.getItem('jamb_earned_ref_' + ref) !== 'yes') {
        localStorage.setItem('jamb_earned_ref_' + ref, 'yes');
        points.addPoints(state.getConfig().POINTS.REFERRAL_REWARD);
        utils.showToast('🎁 +10 points for using a referral link!', 'green');
      }
    }
  }

  function updateSubjectUI() {
    questions.updateSubjectUI();
  }

  function setupEventListeners() {
    const startQuizBtn = utils.$('startQuizBtn');
    if (startQuizBtn) startQuizBtn.addEventListener('click', onStartQuiz);
    const showMoreBtn = utils.$('showMoreSubjectsBtn');
    if (showMoreBtn) showMoreBtn.addEventListener('click', function() { questions.toggleShowMoreSubjects(); });
    const prevBtn = utils.$('prevBtn');
    if (prevBtn) prevBtn.addEventListener('click', function() { questions.prevQuestion(); });
    const nextBtn = utils.$('nextBtn');
    if (nextBtn) nextBtn.addEventListener('click', function() { questions.nextQuestion(); });
    const submitBtn = utils.$('submitBtn');
    if (submitBtn) submitBtn.addEventListener('click', function() { questions.finishQuiz(); });
    const restartBtn = utils.$('restartBtn');
    if (restartBtn) restartBtn.addEventListener('click', function() { questions.restartQuiz(); });
    setupChannelButtons();
    setupShareButtons();
    console.log('📡 Event listeners registered');
  }

  function setupChannelButtons() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tg') === 'joined') {
      unlock.markTelegramJoined();
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('wa') === 'joined') {
      unlock.markWhatsAppJoined();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  function setupShareButtons() {
    const waShareBtn = utils.$('shareWhatsApp');
    if (waShareBtn) {
      waShareBtn.addEventListener('click', function() {
        if (utils.isToday('share')) {
          utils.showToast('Already shared today', 'orange');
          return;
        }
        const url = referrals.buildReferralLink();
        const text = 'Join me on JAMB Quiz App! ' + url;
        window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
        setTimeout(function() {
          points.addPoints(state.getConfig().POINTS.SHARE_REWARD);
          utils.markToday('share');
          daily.refreshDailyTasks();
          utils.showToast('📱 Share reward claimed! +' + state.getConfig().POINTS.SHARE_REWARD + ' pts', 'green');
        }, 3000);
      });
    }
    const fbShareBtn = utils.$('shareFacebook');
    if (fbShareBtn) {
      fbShareBtn.addEventListener('click', function() {
        if (utils.isToday('facebook')) {
          utils.showToast('Already followed today', 'orange');
          return;
        }
        const url = referrals.buildReferralLink();
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank');
        setTimeout(function() {
          points.addPoints(state.getConfig().POINTS.FACEBOOK_BONUS);
          utils.markToday('facebook');
          daily.refreshDailyTasks();
          utils.showToast('👍 Facebook follow reward! +' + state.getConfig().POINTS.FACEBOOK_BONUS + ' pts', 'green');
        }, 3000);
      });
    }
  }

  function onStartQuiz() {
    if (!state.isUnlocked()) {
      utils.showToast('🔒 Join both WhatsApp channels first', 'red');
      return;
    }
    if (!state.getQuestionBank()) {
      utils.showToast('❌ Question bank not loaded', 'red');
      return;
    }
    const subjectsSelected = state.getSelectedSubjects();
    if (subjectsSelected.length === 0) {
      utils.showToast('⚠️ Select at least 1 subject', 'red');
      return;
    }
    const cost = subjectsSelected.length * state.getConfig().POINTS.QUIZ_COST;
    if (!points.deductPoints(cost)) {
      utils.showToast('❌ Not enough points', 'red');
      return;
    }
    utils.showToast('✅ −' + cost + ' points. Good luck!', 'green');
    const quizQuestions = questions.generateQuizQuestions(subjectsSelected);
    if (quizQuestions.length === 0) {
      utils.showToast('📚 No questions available', 'red');
      points.addPoints(cost);
      return;
    }
    const displayNames = subjectsSelected.map(function(key) { return questions.getSubjectName(key); });
    questions.startQuiz(subjectsSelected);
    questions.beginQuiz(displayNames);
  }

  return {
    init: init,
    setupEventListeners: setupEventListeners
  };
})();

document.addEventListener('DOMContentLoaded', function() {
  JAMB_APP.init();
  JAMB_APP.setupEventListeners();
});
