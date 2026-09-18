/**
 * JAMB Quiz - Application entry point
 */

const JAMB_APP = (function() {
  'use strict';

  const state = typeof JAMB_STATE !== 'undefined' ? JAMB_STATE : require('./state.js');
  const utils = typeof JAMB_UTILS !== 'undefined' ? JAMB_UTILS : require('./utils.js');
  const points = typeof JAMB_POINTS !== 'undefined' ? JAMB_POINTS : require('./points.js');
  const referrals = typeof JAMB_REFERRALS !== 'undefined' ? JAMB_REFERRALS : require('./referrals.js');
  const unlock = typeof JAMB_UNLOCK !== 'undefined' ? JAMB_UNLOCK : require('./unlock.js');
  const questionsModule = typeof JAMB_QUESTIONS !== 'undefined' ? JAMB_QUESTIONS : require('./questions.js');
  const purchase = typeof JAMB_PURCHASE !== 'undefined' ? JAMB_PURCHASE : require('./purchase.js');
  const config = state.getConfig();
  let started = false;

  function init() {
    if (started) return;
    started = true;
    referrals.getUserId();
    referrals.handleIncomingReferral();
    referrals.setupReferralUI();
    points.updateUI();
    unlock.checkUnlock();
    unlock.bindChannelButtons();
    questionsModule.updateSubjectUI();
    points.dailyTopUp();
    questionsModule.loadQuestionBank();
    setupEventListeners();
    purchase.setupBuyPointsUI();
    purchase.setupSendPointsUI();
  }

  function setupEventListeners() {
    const startQuizBtn = utils.$('startQuizBtn');
    if (startQuizBtn) startQuizBtn.addEventListener('click', onStartQuiz);

    const showMoreBtn = utils.$('showMoreSubjectsBtn');
    if (showMoreBtn) {
      showMoreBtn.addEventListener('click', function() {
        questionsModule.toggleShowMoreSubjects();
      });
    }

    const prevBtn = utils.$('prevBtn');
    if (prevBtn) prevBtn.addEventListener('click', function() { questionsModule.prevQuestion(); });
    const nextBtn = utils.$('nextBtn');
    if (nextBtn) nextBtn.addEventListener('click', function() { questionsModule.nextQuestion(); });
    const submitBtn = utils.$('submitBtn');
    if (submitBtn) submitBtn.addEventListener('click', function() { questionsModule.finishQuiz(); });
    const restartBtn = utils.$('restartBtn');
    if (restartBtn) restartBtn.addEventListener('click', function() { questionsModule.restartQuiz(); });

    setupTelegramBonus();
    setupShareButtons();
    setupModal();
  }

  function onStartQuiz() {
    if (state.isUnlocked()) {
      questionsModule.tryStartQuiz();
    } else {
      unlock.showUnlockModal();
    }
  }

  // Telegram is a plain link (no deep-link needed since t.me opens app automatically)
  function setupTelegramBonus() {
    const btn = utils.$('tgChannelBtn');
    const row = utils.$('bonusRowTg');
    if (!btn) return;

    const key = 'tg_channel';
    const amount = config.POINTS.TG_CHANNEL_BONUS;

    if (localStorage.getItem('jamb_perm_' + key) === 'yes') {
      btn.classList.add('claimed');
      if (row) row.classList.add('claimed');
    }

    btn.addEventListener('click', function() {
      if (localStorage.getItem('jamb_perm_' + key) === 'yes') {
        utils.showToast('Already claimed', 'red');
        return;
      }
      localStorage.setItem('jamb_perm_' + key, 'yes');
      btn.classList.add('claimed');
      if (row) row.classList.add('claimed');
      points.addPoints(amount);
      utils.showToast('+' + amount + ' points!', 'green');
    });
  }

  function setupShareButtons() {
    const shares = [
      { id: 'shareFriendsBtn', name: 'friends' },
      { id: 'shareGroupsBtn', name: 'groups' },
      { id: 'shareClassBtn', name: 'class' }
    ];

    shares.forEach(function(item) {
      const btn = utils.$(item.id);
      if (!btn) return;

      if (utils.isToday('share_' + item.name)) {
        btn.classList.add('claimed');
      }

      btn.addEventListener('click', function() {
        if (utils.isToday('share_' + item.name)) {
          utils.showToast('Already claimed today', 'red');
          return;
        }
        utils.markToday('share_' + item.name);
        btn.classList.add('claimed');
        points.addPoints(config.POINTS.SHARE_REWARD);
        utils.showToast('+' + config.POINTS.SHARE_REWARD + ' points for sharing!', 'green');
      });
    });

    const shareRef = utils.$('shareRefBtn');
    if (shareRef) {
      shareRef.addEventListener('click', function() {
        points.addPoints(config.POINTS.SHARE_REWARD);
        utils.showToast('+' + config.POINTS.SHARE_REWARD + ' points for sharing invite link!', 'green');
      });
    }
  }

  function setupModal() {
    const cancelBtn = utils.$('modalCancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', function() {
      unlock.hideUnlockModal();
    });

    const proceedBtn = utils.$('modalProceedBtn');
    if (proceedBtn) {
      proceedBtn.addEventListener('click', function() {
        if (!state.isUnlocked()) {
          unlock.checkUnlock();
        }
        if (!state.isUnlocked()) {
          utils.showToast('Join both channels first', 'red');
          return;
        }
        unlock.hideUnlockModal();
        questionsModule.tryStartQuiz();
      });
    }

    const overlay = utils.$('unlockModal');
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) unlock.hideUnlockModal();
      });
    }
  }

  return {
    init: init
  };
})();

document.addEventListener('DOMContentLoaded', function() {
  JAMB_APP.init();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = JAMB_APP;
}
