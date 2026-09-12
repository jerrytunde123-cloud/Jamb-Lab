const JAMB_APP = (function() {
  'use strict';

  const state = JAMB_STATE;
  const utils = JAMB_UTILS;
  const points = JAMB_POINTS;
  const referrals = JAMB_REFERRALS;
  const unlock = JAMB_UNLOCK;
  const daily = JAMB_DAILY;
  const questionsModule = JAMB_QUESTIONS;

  function init() {
    console.log('Initializing JAMB Quiz App...');
    referrals.getUserId();
    referrals.handleIncomingReferral();
    awardReferralToCurrent();
    referrals.setupReferralUI();
    const refCountEl = utils.$('refCount');
    if (refCountEl) refCountEl.textContent = localStorage.getItem('jamb_ref_count') || '0';
    points.updateUI();
    unlock.checkUnlock();
    daily.refreshDailyTasks();
    questionsModule.updateSubjectUI();
    daily.dailyTopUp();
    questionsModule.loadQuestionBank();
    console.log('JAMB Quiz app ready');
  }

  function awardReferralToCurrent() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && ref !== referrals.getUserId() && state.getReferralUsed() !== ref) {
      if (localStorage.getItem('jamb_earned_ref_' + ref) !== 'yes') {
        localStorage.setItem('jamb_earned_ref_' + ref, 'yes');
        points.addPoints(state.getConfig().POINTS.REFERRAL_REWARD);
        utils.showToast('+10 points for using a referral link!', 'green');
      }
    }
  }

  function setupEventListeners() {
    const startQuizBtn = utils.$('startQuizBtn');
    if (startQuizBtn) startQuizBtn.addEventListener('click', onStartQuiz);
    const showMoreBtn = utils.$('showMoreSubjectsBtn');
    if (showMoreBtn) showMoreBtn.addEventListener('click', function() { questionsModule.toggleShowMoreSubjects(); });
    const prevBtn = utils.$('prevBtn');
    if (prevBtn) prevBtn.addEventListener('click', function() { questionsModule.prevQuestion(); });
    const nextBtn = utils.$('nextBtn');
    if (nextBtn) nextBtn.addEventListener('click', function() { questionsModule.nextQuestion(); });
    const submitBtn = utils.$('submitBtn');
    if (submitBtn) submitBtn.addEventListener('click', function() { questionsModule.finishQuiz(); });
    const restartBtn = utils.$('restartBtn');
    if (restartBtn) restartBtn.addEventListener('click', function() { questionsModule.restartQuiz(); });
    setupChannelButtons();
    setupShareButtons();
    wireModalButtons();
    console.log('Event listeners registered');
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
    // Unlock box buttons (WhatsApp channels 1 & 2)
    wireSimpleUnlock('channel1Btn', 'jamb_wa');
    wireSimpleUnlock('channel2Btn', 'jamb_wa');
    // Bonus channel card buttons
    wireChannelBonus('tgChannelBtn', 'bonusRowTg', 'tg_channel', 'jamb_tg');
    wireChannelBonus('waecChannelBtn', 'bonusRowWaec', 'waec_tutorial', 'jamb_wa');
    wireChannelBonus('jambTutChannelBtn', 'bonusRowJambTut', 'jamb_tutorial', 'jamb_wa');
    wireChannelBonus('fbPageBtn', 'bonusRowFb', 'fb_page');
  }

  function wireSimpleUnlock(btnId, flag) {
    const btn = utils.$(btnId);
    if (!btn) return;
    btn.addEventListener('click', function() {
      localStorage.setItem(flag, 'yes');
      unlock.checkUnlock();
      utils.showToast('Channel joined! Keep going...', 'green');
    });
  }

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
    row.innerHTML += ' <span style="margin-left:auto;">\u2713</span>';
  }

  function setupShareButtons() {
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
        utils.showToast('Share reward claimed! +' + state.getConfig().POINTS.SHARE_REWARD + ' pts', 'green');
      });
    });
  }

  // ===== UNLOCK MODAL =====
  var modalChannel1Joined = false;
  var modalChannel2Joined = false;

  function showUnlockModal() {
    modalChannel1Joined = localStorage.getItem('jamb_modal_ch1') === 'yes';
    modalChannel2Joined = localStorage.getItem('jamb_modal_ch2') === 'yes';
    updateModalProgress();
    var modal = utils.$('unlockModal');
    if (modal) modal.classList.add('show');
  }

  function hideUnlockModal() {
    var modal = utils.$('unlockModal');
    if (modal) modal.classList.remove('show');
  }

  function updateModalProgress() {
    var count = (modalChannel1Joined ? 1 : 0) + (modalChannel2Joined ? 1 : 0);
    var prog = utils.$('modalUnlockProgress');
    if (!prog) return;
    if (count === 2) {
      prog.innerHTML = '\u2705 Both channels joined - you are unlocked!';
      prog.classList.add('done');
      localStorage.setItem('jamb_wa', 'yes');
      localStorage.setItem('jamb_tg', 'yes');
      unlock.checkUnlock();
      setTimeout(function() {
        hideUnlockModal();
        utils.showToast('Quizzes unlocked! Starting your quiz...', 'green');
        startQuizAfterUnlock();
      }, 900);
    } else {
      prog.innerHTML = 'Joined: ' + count + ' / 2 channels';
      prog.classList.remove('done');
    }
  }

  function startQuizAfterUnlock() {
    if (!state.getQuestionBank()) {
      utils.showToast('Question bank not loaded', 'red');
      return;
    }
    var selected = state.getSelectedSubjects();
    if (selected.length === 0) {
      utils.showToast('Select at least 1 subject', 'red');
      return;
    }
    var cost = selected.length * state.getConfig().POINTS.QUIZ_COST;
    if (!points.deductPoints(cost)) {
      utils.showToast('Not enough points', 'red');
      return;
    }
    utils.showToast('Good luck!', 'green');
    var quizQuestions = questionsModule.generateQuizQuestions(selected);
    if (quizQuestions.length === 0) {
      utils.showToast('No questions available', 'red');
      points.addPoints(cost);
      return;
    }
    var displayNames = selected.map(function(key) { return questionsModule.getSubjectName(key); });
    questionsModule.startQuiz(selected);
    questionsModule.beginQuiz(displayNames);
  }

  function wireModalButtons() {
    var ch1 = utils.$('modalChannel1Btn');
    var ch2 = utils.$('modalChannel2Btn');
    var closeBtn = utils.$('modalCloseBtn');
    if (ch1) {
      ch1.addEventListener('click', function() {
        localStorage.setItem('jamb_modal_ch1', 'yes');
        modalChannel1Joined = true;
        setTimeout(updateModalProgress, 500);
      });
    }
    if (ch2) {
      ch2.addEventListener('click', function() {
        localStorage.setItem('jamb_modal_ch2', 'yes');
        modalChannel2Joined = true;
        setTimeout(updateModalProgress, 500);
      });
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', hideUnlockModal);
    }
  }

  function onStartQuiz() {
    if (!state.isUnlocked()) {
      showUnlockModal();
      return;
    }
    if (!state.getQuestionBank()) {
      utils.showToast('Question bank not loaded', 'red');
      return;
    }
    var selected = state.getSelectedSubjects();
    if (selected.length === 0) {
      utils.showToast('Select at least 1 subject', 'red');
      return;
    }
    var cost = selected.length * state.getConfig().POINTS.QUIZ_COST;
    if (!points.deductPoints(cost)) {
      utils.showToast('Not enough points', 'red');
      return;
    }
    utils.showToast('Good luck!', 'green');
    var quizQuestions = questionsModule.generateQuizQuestions(selected);
    if (quizQuestions.length === 0) {
      utils.showToast('No questions available', 'red');
      points.addPoints(cost);
      return;
    }
    var displayNames = selected.map(function(key) { return questionsModule.getSubjectName(key); });
    questionsModule.startQuiz(selected);
    questionsModule.beginQuiz(displayNames);
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
