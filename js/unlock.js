/**
 * JAMB Quiz - Unlock System
 * Daily reset: must join both WhatsApp channels every day to unlock quizzes.
 * +15 points bonus is granted ONCE EVER when both are joined for the first time.
 */

const JAMB_UNLOCK = (function() {
  'use strict';

  const state = typeof JAMB_STATE !== 'undefined' ? JAMB_STATE : require('./state.js');
  const utils = typeof JAMB_UTILS !== 'undefined' ? JAMB_UTILS : require('./utils.js');
  const points = typeof JAMB_POINTS !== 'undefined' ? JAMB_POINTS : require('./points.js');

  function isWhatsAppJoinedToday() {
    return utils.isToday('ch1');
  }

  function isTelegramJoinedToday() {
    return utils.isToday('ch2');
  }

  function joinedCount() {
    return (isWhatsAppJoinedToday() ? 1 : 0) + (isTelegramJoinedToday() ? 1 : 0);
  }

  function isFullyUnlocked() {
    return isWhatsAppJoinedToday() && isTelegramJoinedToday();
  }

  function awardUnlockBonusOnce() {
    if (localStorage.getItem('jamb_unlock_bonus_perm') === 'yes') return;
    localStorage.setItem('jamb_unlock_bonus_perm', 'yes');
    const bonus = state.getConfig().POINTS.UNLOCK_BONUS;
    points.addPoints(bonus);
    utils.showToast('+' + bonus + ' points for joining both channels!', 'green');
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

    box.style.display = 'block';

    const unlocked = isFullyUnlocked();
    const status = utils.$('unlockStatus');
    const row = utils.$('bonusRowUnlock');
    const caption = utils.$('unlockCaption');
    const count = joinedCount();

    if (status) {
      if (unlocked) {
        status.innerHTML = '<i class="fas fa-check"></i> unlocked';
        status.style.background = '#25D366';
      } else {
        status.innerHTML = '<i class="fas fa-lock"></i> ' + count + ' / 2 joined';
        status.style.background = count === 1 ? '#f59e0b' : '#8fabbc';
      }
    }

    // Bonus row reflects permanent state
    if (row) {
      if (localStorage.getItem('jamb_unlock_bonus_perm') === 'yes') {
        row.classList.add('claimed');
      } else {
        row.classList.remove('claimed');
      }
    }

    if (caption) {
      caption.textContent = unlocked
        ? 'Both WhatsApp channels joined today'
        : 'join both WhatsApp channels daily to start';
    }
  }

  function markChannelJoined(which) {
    if (which === 1) {
      utils.markToday('ch1');
      utils.showToast('Channel 1 joined. Join Channel 2 to unlock!', 'green');
    }
    if (which === 2) {
      utils.markToday('ch2');
      utils.showToast('Channel 2 joined. Unlocking now…', 'green');
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
      progress.textContent = 'Both WhatsApp channels joined';
      progress.classList.add('done');
      proceedBtn.disabled = false;
      proceedBtn.innerHTML = '<i class="fas fa-play"></i> Proceed to Quiz';
    } else {
      progress.textContent = 'Joined: ' + count + ' / 2 WhatsApp channels';
      progress.classList.remove('done');
      proceedBtn.disabled = true;
      proceedBtn.innerHTML = '<i class="fas fa-lock"></i> Join both channels to proceed';
    }
  }

  return {
    checkUnlock: checkUnlock,
    updateUnlockUI: updateUnlockUI,
    markChannelJoined: markChannelJoined,
    isChannel1Joined: isWhatsAppJoinedToday,
    isChannel2Joined: isTelegramJoinedToday,
    showUnlockModal: showUnlockModal,
    hideUnlockModal: hideUnlockModal,
    updateModalUI: updateModalUI
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = JAMB_UNLOCK;
}
