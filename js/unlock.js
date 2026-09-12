/**
 * JAMB Quiz - Unlock System
 * Quizzes unlock after both required WhatsApp channels are joined.
 */

const JAMB_UNLOCK = (function() {
  'use strict';

  const state = typeof JAMB_STATE !== 'undefined' ? JAMB_STATE : require('./state.js');
  const utils = typeof JAMB_UTILS !== 'undefined' ? JAMB_UTILS : require('./utils.js');
  const points = typeof JAMB_POINTS !== 'undefined' ? JAMB_POINTS : require('./points.js');

  function isChannel1Joined() {
    return localStorage.getItem('jamb_ch1') === 'yes';
  }

  function isChannel2Joined() {
    return localStorage.getItem('jamb_ch2') === 'yes';
  }

  function isLegacyUnlocked() {
    return localStorage.getItem('jamb_tg') === 'yes' && localStorage.getItem('jamb_wa') === 'yes';
  }

  function joinedCount() {
    return (isChannel1Joined() ? 1 : 0) + (isChannel2Joined() ? 1 : 0);
  }

  function isFullyUnlocked() {
    return (isChannel1Joined() && isChannel2Joined()) || isLegacyUnlocked();
  }

  function awardUnlockBonusOnce() {
    if (localStorage.getItem('jamb_unlock_bonus') === 'yes') return;
    localStorage.setItem('jamb_unlock_bonus', 'yes');
    // Already unlocked under the old Telegram + WhatsApp flags — don't pay twice.
    if (isLegacyUnlocked() && localStorage.getItem('jamb_ch1') !== 'yes') return;
    points.addPoints(state.getConfig().POINTS.UNLOCK_BONUS);
    utils.showToast('Quizzes unlocked! +' + state.getConfig().POINTS.UNLOCK_BONUS + ' points', 'green');
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
    if (which === 1) localStorage.setItem('jamb_ch1', 'yes');
    if (which === 2) localStorage.setItem('jamb_ch2', 'yes');
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
      progress.textContent = 'Both channels joined';
      progress.classList.add('done');
      proceedBtn.disabled = false;
      proceedBtn.textContent = 'Proceed to Quiz';
    } else {
      progress.textContent = 'Joined: ' + count + ' / 2 channels';
      progress.classList.remove('done');
      proceedBtn.disabled = true;
      proceedBtn.textContent = 'Join both channels to proceed';
    }
  }

  return {
    checkUnlock: checkUnlock,
    updateUnlockUI: updateUnlockUI,
    markChannelJoined: markChannelJoined,
    isChannel1Joined: isChannel1Joined,
    isChannel2Joined: isChannel2Joined,
    showUnlockModal: showUnlockModal,
    hideUnlockModal: hideUnlockModal,
    updateModalUI: updateModalUI
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = JAMB_UNLOCK;
}
