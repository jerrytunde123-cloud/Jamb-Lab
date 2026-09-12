const JAMB_APP = (function() {
  'use strict';

  const state = JAMB_STATE;
  const utils = JAMB_UTILS;
  const points = JAMB_POINTS;
  const referrals = JAMB_REFERRALS;
  const unlock = JAMB_UNLOCK;
  const daily = JAMB_DAILY;
  const questionsModule = JAMB_QUESTIONS;

  // Unlocked modal channel state - restored from localStorage on init
  let modalChannel1Joined = false;
  let modalChannel2Joined = false;

  function init() {
    console.log('Initializing JAMB Quiz App...');
    // Restore modal join state from localStorage
    modalChannel1Joined = localStorage.getItem('jamb_modal_ch1') === 'yes';
    modalChannel2Joined = localStorage.getItem('jamb_modal_ch2') === 'yes';
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
    updateStartButtonState();
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
      updateStartButtonState();
      points.updateUI();
      utils.showToast('Joined! You can now start quizzes.', 'green');
    });
  }

  function wireChannelBonus(btnId, rowId, bonusKey, unlockKey) {
    const btn = utils.$(btnId);
    const row = utils.$(rowId);
    if (!btn || !row) return;
    if (localStorage.getItem(bonusKey) === 'yes') {
      row.classList.add('claimed');
      btn.textContent = '✅ Claimed';
      btn.disabled = true;
    } else {
      btn.addEventListener('click', function() {
        localStorage.setItem(bonusKey, 'yes');
        row.classList.add('claimed');
        btn.textContent = '✅ Claimed';
        btn.disabled = true;
        points.addPoints(15);
        points.updateUI();
        utils.showToast('+15 points!', 'green');
        if (unlockKey) {
          localStorage.setItem(unlockKey, 'yes');
          unlock.checkUnlock();
          updateStartButtonState();
        }
      });
    }
  }

  // --- Unlock Modal Functions ---

  function showUnlockModal() {
    const modal = utils.$('unlockModal');
    if (modal) {
      modal.classList.add('active');
      // Restore join state from localStorage
      modalChannel1Joined = localStorage.getItem('jamb_modal_ch1') === 'yes';
      modalChannel2Joined = localStorage.getItem('jamb_modal_ch2') === 'yes';
      updateModalProgress();
    }
  }

  function hideUnlockModal() {
    const modal = utils.$('unlockModal');
    if (modal) modal.classList.remove('active');
  }

  function updateModalProgress() {
    const prog = utils.$('modalProgress');
    if (!prog) return;
    let count = 0;
    if (modalChannel1Joined) count++;
    if (modalChannel2Joined) count++;
    if (count === 2) {
      prog.innerHTML = '✅ Both channels joined - you are unlocked!';
      prog.classList.add('done');
      localStorage.setItem('jamb_wa', 'yes');
      localStorage.setItem('jamb_tg', 'yes');
      unlock.checkUnlock();
      updateStartButtonState();
      points.updateUI();
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
    var quizQuestions = questionsModule.generateQuizQuestions(selected);
    if (quizQuestions.length === 0) {
      utils.showToast('No questions available', 'red');
      points.addPoints(cost);
      return;
    }
    var displayNames = selected.map(function(key) { return questionsModule.getSubjectName(key); });
    utils.showToast('Good luck!', 'green');
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
        points.addPoints(15);
        points.updateUI();
        utils.showToast('+15 points!', 'green');
        setTimeout(updateModalProgress, 500);
      });
    }
    if (ch2) {
      ch2.addEventListener('click', function() {
        localStorage.setItem('jamb_modal_ch2', 'yes');
        modalChannel2Joined = true;
        points.addPoints(15);
        points.updateUI();
        utils.showToast('+15 points!', 'green');
        setTimeout(updateModalProgress, 500);
      });
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', hideUnlockModal);
    }
  }

    function updateStartButtonState() {
    // Button state handled entirely by questions.js
    // This function is kept for backwards compatibility but does nothing -
    // the button is ALWAYS clickable, never disabled
    questionsModule.updateStartButtonState();
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
    var quizQuestions = questionsModule.generateQuizQuestions(selected);
    if (quizQuestions.length === 0) {
      utils.showToast('No questions available', 'red');
      points.addPoints(cost);
      return;
    }
    var displayNames = selected.map(function(key) { return questionsModule.getSubjectName(key); });
    utils.showToast('Good luck!', 'green');
    questionsModule.startQuiz(selected);
    questionsModule.beginQuiz(displayNames);
  }

  function setupShareButtons() {
    const shareButtons = [
      { id: 'shareFriendsBtn', key: 'jamb_share_friends' },
      { id: 'shareGroupsBtn', key: 'jamb_share_groups' },
      { id: 'shareClassBtn', key: 'jamb_share_class' }
    ];
    shareButtons.forEach(function(item) {
      const btn = utils.$(item.id);
      if (!btn) return;
      if (localStorage.getItem(item.key) === 'yes') {
        btn.textContent = '✅ Shared';
        btn.disabled = true;
      } else {
        btn.addEventListener('click', function() {
          localStorage.setItem(item.key, 'yes');
          btn.textContent = '✅ Shared';
          btn.disabled = true;
          points.addPoints(10);
          points.updateUI();
          utils.showToast('+10 points!', 'green');
        });
      }
    });
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
