/**
 * JAMB Quiz - Application entry point
 */

import JAMB_STATE from './state.js';
import JAMB_UTILS from './utils.js';
import JAMB_POINTS from './points.js';
import JAMB_REFERRALS from './referrals.js';
import JAMB_UNLOCK from './unlock.js';
import JAMB_QUESTIONS from './questions.js';
import JAMB_PURCHASE from './purchase.js';

const JAMB_APP = (function() {
  'use strict';

  const state = JAMB_STATE;
  const utils = JAMB_UTILS;
  const points = JAMB_POINTS;
  const referrals = JAMB_REFERRALS;
  const unlock = JAMB_UNLOCK;
  const questionsModule = JAMB_QUESTIONS;
  const purchase = JAMB_PURCHASE;
  const config = state.getConfig();
  let started = false;

  function init() {
    if (started) return;
    started = true;
    
      // 🌐 Anonymous ping for admin traffic tracking
  fetch('https://jamb-utme-lab.vercel.app/api/ping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid: localStorage.getItem('jamb_uid') || 'anon' })
  }).catch(function() {});
    
    referrals.getUserId();
    referrals.handleIncomingReferral();
    referrals.setupReferralUI();
    points.updateUI();
    unlock.checkUnlock();
    unlock.bindChannelButtons();
    unlock.setupShowMoreChannels();
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

export default JAMB_APP;
