/**
 * JAMB Quiz - Unlock System
 * Quizzes unlock after both WhatsApp channels are joined.
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

    // Channels are compulsory EVERY DAY to unlock quizzes,
  // but the +15 pts bonus is only awarded ONCE EVER.
  function awardUnlockBonusOnce() {
    if (localStorage.getItem('jamb_unlock_bonus') === 'yes') return;
    localStorage.setItem('jamb_unlock_bonus', 'yes');
    const reward = state.getConfig().POINTS.UNLOCK_BONUS;
    points.addPoints(reward);
    utils.showToast('+' + reward + ' points for joining both channels!', 'green');
  }

  function checkUnlock() {
    // Today-based flags for the two compulsory channels
    const c1Today = utils.isToday('ch1');
    const c2Today = utils.isToday('ch2');
    const unlocked = c1Today && c2Today;

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

    const c1Today = utils.isToday('ch1');
    const c2Today = utils.isToday('ch2');
    const count = (c1Today ? 1 : 0) + (c2Today ? 1 : 0);

    const status = utils.$('unlockStatus');
    const row = utils.$('bonusRowUnlock');
    const caption = utils.$('unlockCaption');

    if (status) {
      if (count === 2) {
        status.innerHTML = '<i class="fas fa-check"></i> unlocked today';
        status.style.background = '#25D366';
      } else {
        status.innerHTML = '<i class="fas fa-lock"></i> ' + count + ' / 2 joined today';
        status.style.background = count === 1 ? '#f59e0b' : '#8fabbc';
      }
    }
    if (row) {
      const bonusClaimed = localStorage.getItem('jamb_unlock_bonus') === 'yes';
      if (count > 0) row.classList.add('claimed');
      row.innerHTML = count === 2
        ? '<i class="fas fa-unlock"></i> Quizzes unlocked for today'
        : '<i class="fas fa-unlock"></i> Join both channels daily to unlock';
      if (bonusClaimed) row.innerHTML += '  ✓';
    }
    if (caption) {
      caption.textContent = count === 2
        ? 'Both channels joined — you can start today'
        : 'join both WhatsApp channels daily to start';
    }

    // Reflect "already joined today" opacity on both buttons
    const b1 = utils.$('channel1Btn');
    const b2 = utils.$('channel2Btn');
    if (b1) b1.style.opacity = c1Today ? '0.6' : '1';
    if (b2) b2.style.opacity = c2Today ? '0.6' : '1';
  }

  function markChannelJoined(which) {
    if (which === 1) {
      if (utils.isToday('ch1')) {
        utils.showToast('Already joined today', 'red');
        return;
      }
      utils.markToday('ch1');
      localStorage.setItem('jamb_ch1', 'yes');
      localStorage.setItem('jamb_wa', 'yes');
      utils.showToast('Channel 1 joined. Join Channel 2 to unlock!', 'green');
    }
    if (which === 2) {
      if (utils.isToday('ch2')) {
        utils.showToast('Already joined today', 'red');
        return;
      }
      utils.markToday('ch2');
      localStorage.setItem('jamb_ch2', 'yes');
      localStorage.setItem('jamb_tg', 'yes');
      utils.showToast('Channel 2 joined. Unlocking now…', 'green');
    }
    checkUnlock();
    updateModalUI();
  }

  // Bonus channels (one-time rewards, NOT compulsory for unlock)
  function markBonusChannel(key, amount, label) {
    if (localStorage.getItem('jamb_bonus_' + key) === 'yes') {
      utils.showToast('Already claimed', 'red');
      return false;
    }
    localStorage.setItem('jamb_bonus_' + key, 'yes');
    points.addPoints(amount);
    utils.showToast('+' + amount + ' points for ' + label + '!', 'green');
    return true;
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
    markBonusChannel: markBonusChannel,
    // ... keep the rest as-is
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = JAMB_UNLOCK;
}
