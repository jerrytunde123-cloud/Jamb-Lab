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
    questionsModule.updateSubjectUI();
    points.dailyTopUp();
    questionsModule.loadQuestionBank();
    setupEventListeners();
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

    setupUnlockButtons();
    setupBonusChannels();
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

  function setupUnlockButtons() {
    function wire(id, channel) {
      const btn = utils.$(id);
      if (!btn) return;
      btn.addEventListener('click', function() {
        unlock.markChannelJoined(channel);
      });
    }
    wire('channel1Btn', 1);
    wire('channel2Btn', 2);
    wire('modalChannel1Btn', 1);
    wire('modalChannel2Btn', 2);
  }

  function setupBonusChannels() {
    const bonuses = [
      { btn: 'tgChannelBtn', row: 'bonusRowTg', key: 'tg_channel', amount: config.POINTS.TG_CHANNEL_BONUS },
      { btn: 'waecChannelBtn', row: 'bonusRowWaec', key: 'waec_tutorial', amount: config.POINTS.WAEC_CHANNEL_BONUS },
      { btn: 'jambTutChannelBtn', row: 'bonusRowJambTut', key: 'jamb_tutorial', amount: config.POINTS.JAMB_TUTORIAL_BONUS },
      { btn: 'fbPageBtn', row: 'bonusRowFb', key: 'fb_page', amount: config.POINTS.FACEBOOK_BONUS }
    ];

    bonuses.forEach(function(item) {
      const btn = utils.$(item.btn);
      const row = utils.$(item.row);
      if (!btn) return;

      if (localStorage.getItem(item.key) === 'yes') {
        markClaimed(btn, row);
        return;
      }

      btn.addEventListener('click', function onClaim() {
        if (localStorage.getItem(item.key) === 'yes') return;
        localStorage.setItem(item.key, 'yes');
        markClaimed(btn, row);
        points.addPoints(item.amount);
        utils.showToast('+' + item.amount + ' points!', 'green');
      });
    });
  }

  function markClaimed(btn, row) {
    btn.classList.add('claimed');
    if (row) row.classList.add('claimed');
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

      btn.addEventListener('click', function() {
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
