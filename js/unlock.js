/**
 * JAMB Quiz - Unlock System
 * Quizzes unlock after WhatsApp and Telegram channels are joined.
 */

const JAMB_UNLOCK = (function() {
  'use strict';

  const state = typeof JAMB_STATE !== 'undefined' ? JAMB_STATE : require('./state.js');
  const utils = typeof JAMB_UTILS !== 'undefined' ? JAMB_UTILS : require('./utils.js');
  const points = typeof JAMB_POINTS !== 'undefined' ? JAMB_POINTS : require('./points.js');

  function isWhatsAppJoined() {
    return localStorage.getItem('jamb_ch1') === 'yes' || localStorage.getItem('jamb_wa') === 'yes';
  }

  function isTelegramJoined() {
    return localStorage.getItem('jamb_ch2') === 'yes' || localStorage.getItem('jamb_tg') === 'yes';
  }

  function joinedCount() {
    return (isWhatsAppJoined() ? 1 : 0) + (isTelegramJoined() ? 1 : 0);
  }

  function isFullyUnlocked() {
    return isWhatsAppJoined() && isTelegramJoined();
  }

  function awardUnlockBonusOnce() {
    if (localStorage.getItem('jamb_unlock_bonus') === 'yes') return;
    localStorage.setItem('jamb_unlock_bonus', 'yes');
    utils.showToast('Quizzes unlocked! Share below to earn points to start.', 'green');
  }

  function checkUnlock() {
    const unlocked = isFullyUnlocked();
    state.setUnlocked(unlocked);
    if (unlocked) awardUnlockBonusOnce();
    updateUnlockUI();
    points.updateStartButtonState();
    return unlocked;
  }

  function updateUnlockUI() {
    const box = utils.$('unlockBox');
    if (!box) return;

    if (state.isUnlocked()) {
      box.style.display = 'none';
      return;
    }

    box.style.display = 'block';
    const status = utils.$('unlockStatus');
    const row = utils.$('bonusRowUnlock');
    const count = joinedCount();

    if (status) {
      status.innerHTML = '<i class="fas fa-lock"></i> ' + count + ' / 2 joined';
      status.style.background = count === 1 ? '#f59e0b' : '#8fabbc';
    }
    if (row && count > 0) row.classList.add('claimed');
  }

  function markChannelJoined(which) {
    if (which === 1) {
      localStorage.setItem('jamb_ch1', 'yes');
      localStorage.setItem('jamb_wa', 'yes');
    }
    if (which === 2) {
      localStorage.setItem('jamb_ch2', 'yes');
      localStorage.setItem('jamb_tg', 'yes');
    }
    checkUnlock();
    updateModalUI();
  }

  function showUnlockModal() {
    const modal = utils.$('unlockModal');
    if (!modal) return;
    updateModalUI();
    modal.classList.add('show');
  }

  function hideUnlockModal() {
    const modal = utils.$('unlockModal');
    if (modal) modal.classList.remove('show');
  }

  function updateModalUI() {
    const progress = utils.$('modalUnlockProgress');
    const proceedBtn = utils.$('modalProceedBtn');
    if (!progress || !proceedBtn) return;

    const count = joinedCount();
    if (isFullyUnlocked() || count === 2) {
      progress.textContent = 'WhatsApp and Telegram joined';
      progress.classList.add('done');
      proceedBtn.disabled = false;
      proceedBtn.innerHTML = '<i class="fas fa-play"></i> Proceed to Quiz';
    } else {
      progress.textContent = 'Joined: ' + count + ' / 2 · WhatsApp + Telegram';
      progress.classList.remove('done');
      proceedBtn.disabled = true;
      proceedBtn.innerHTML = '<i class="fas fa-lock"></i> Join both channels to proceed';
    }
  }

  return {
    checkUnlock: checkUnlock,
    updateUnlockUI: updateUnlockUI,
    markChannelJoined: markChannelJoined,
    isChannel1Joined: isWhatsAppJoined,
    isChannel2Joined: isTelegramJoined,
    showUnlockModal: showUnlockModal,
    hideUnlockModal: hideUnlockModal,
    updateModalUI: updateModalUI
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = JAMB_UNLOCK;
}
