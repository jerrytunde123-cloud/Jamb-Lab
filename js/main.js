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
    referrals.setupReferralUI();
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

    // Channel join buttons -> award daily bonus points
    wireChannelBonus('tgChannelBtn', 'bonusRowTg', 'tg_channel', 'jamb_tg');
    wireChannelBonus('waecChannelBtn', 'bonusRowWaec', 'waec_tutorial');
    wireChannelBonus('jambTutChannelBtn', 'bonusRowJambTut', 'jamb_tutorial');
    wireChannelBonus('fbPageBtn', 'bonusRowFb', 'fb_page');
  }

  // Award daily points when a channel link is clicked; mark row claimed
  function wireChannelBonus(btnId, rowId, taskKey, unlockKey) {
    const btn = utils.$(btnId);
    if (!btn) return;

    btn.addEventListener('click', function() {
      if (utils.isToday(taskKey)) {
        utils.showToast('Already claimed today', 'orange');
        return;
      }
      const cfg = state.getConfig().POINTS;
      const rewards = {
        tg_channel: cfg.TG_CHANNEL_BONUS,
        waec_tutorial: cfg.WAEC_CHANNEL_BONUS,
        jamb_tutorial: cfg.JAMB_TUTORIAL_BONUS,
        fb_page: cfg.FACEBOOK_BONUS
      };
      const pts = rewards[taskKey];
      if (!pts) return;

      if (unlockKey) {
        localStorage.setItem(unlockKey, 'yes');
        unlock.checkUnlock();
      }

      points.addPoints(pts);
      utils.markToday(taskKey);
      markRowClaimed(rowId, pts);
      daily.refreshDailyTasks();
      utils.showToast('+' + pts + ' points earned!', 'green');
    });

    // Show already-claimed state on load
    if (utils.isToday(taskKey)) {
      const cfg = state.getConfig().POINTS;
      const rewards = { tg_channel: cfg.TG_CHANNEL_BONUS, waec_tutorial: cfg.WAEC_CHANNEL_BONUS, jamb_tutorial: cfg.JAMB_TUTORIAL_BONUS, fb_page: cfg.FACEBOOK_BONUS };
      markRowClaimed(rowId, rewards[taskKey] || 0);
    }
  }

  function markRowClaimed(rowId, pts) {
    const row = utils.$(rowId);
    if (!row) return;
    row.classList.add('claimed');
    row.innerHTML += ' <span style="margin-left:auto;">✓</span>';
  }

  function setupShareButtons() {
    // Share section uses data-share attribute buttons
    const shareBtns = document.querySelectorAll('.share-btn[data-share]');
    shareBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (utils.isToday('share')) {
          utils.showToast('Already claimed today', 'orange');
          return;
        }
        points.addPoints(state.getConfig().POINTS.SHARE_REWARD);
        utils.markToday('share');
        daily.refreshDailyTasks();
        utils.showToast('📱 Share reward claimed! +' + state.getConfig().POINTS.SHARE_REWARD + ' pts', 'green');
      });
    });
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
