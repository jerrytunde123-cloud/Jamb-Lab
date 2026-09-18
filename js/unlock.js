/**
 * JAMB Quiz - Unlock System
 *
 * Two types of channel buttons:
 *   1. Compulsory unlock channels (data-channel-num="1|2") → daily join to unlock quiz
 *   2. Bonus channels (data-bonus-key="...") → one-time bonus points
 *
 * Both use WhatsApp deep links to open the app directly.
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
    if (which === 1) utils.markToday('ch1');
    if (which === 2) utils.markToday('ch2');
    checkUnlock();
    updateModalUI();
    utils.showToast('✅ Channel ' + which + ' marked as joined!', 'green');
  }

  // ============ WHATSAPP DEEP-LINK HANDLING ============

  function isMobile() {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  }

  function openWhatsAppChannel(channelId) {
    const appUrl = 'whatsapp://channel/' + channelId;
    const webUrl = 'https://whatsapp.com/channel/' + channelId;

    let opened = false;
    try {
      if (isMobile()) {
        const start = Date.now();
        window.location.href = appUrl;
        setTimeout(function() {
          if (Date.now() - start < 1500) {
            window.open(webUrl, '_blank');
          }
        }, 1200);
        opened = true;
      }
    } catch (err) { /* ignore */ }

    if (!opened) {
      window.open(webUrl, '_blank');
    }
  }

  // Compulsory unlock channel click
  function handleUnlockChannelClick(btn) {
    if (!btn || btn.dataset.deepLinkBound === 'yes') return;
    btn.dataset.deepLinkBound = 'yes';

    const channelId = btn.getAttribute('data-channel-id');
    const channelNum = parseInt(btn.getAttribute('data-channel-num'), 10);
    if (!channelId || !channelNum) return;

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      openWhatsAppChannel(channelId);

      setTimeout(function() {
        markChannelJoined(channelNum);
      }, 2500);
    });
  }

  // Bonus channel click (claim points once)
  function handleBonusChannelClick(btn) {
    if (!btn || btn.dataset.deepLinkBound === 'yes') return;
    btn.dataset.deepLinkBound = 'yes';

    const channelId = btn.getAttribute('data-channel-id');
    const key = btn.getAttribute('data-bonus-key');
    const amount = parseInt(btn.getAttribute('data-bonus-amount'), 10);
    const rowId = btn.getAttribute('data-bonus-row');
    if (!channelId || !key || !amount) return;

    // Reflect claim state on load
    if (localStorage.getItem('jamb_perm_' + key) === 'yes') {
      btn.classList.add('claimed');
      const row = document.getElementById(rowId);
      if (row) row.classList.add('claimed');
    }

    btn.addEventListener('click', function(e) {
      e.preventDefault();

      // Open WhatsApp
      openWhatsAppChannel(channelId);

      // Award once
      if (localStorage.getItem('jamb_perm_' + key) !== 'yes') {
        localStorage.setItem('jamb_perm_' + key, 'yes');
        setTimeout(function() {
          btn.classList.add('claimed');
          const row = document.getElementById(rowId);
          if (row) row.classList.add('claimed');
          points.addPoints(amount);
          utils.showToast('+' + amount + ' points!', 'green');
        }, 2500);
      }
    });
  }

  // Bind every WhatsApp channel button on the page
  function bindChannelButtons() {
    const btns = document.querySelectorAll('.channel-btn');
    btns.forEach(function(btn) {
      const num = btn.getAttribute('data-channel-num');
      const bonusKey = btn.getAttribute('data-bonus-key');

      if (num) {
        // Compulsory unlock channel
        handleUnlockChannelClick(btn);
      } else if (bonusKey) {
        // Bonus channel
        handleBonusChannelClick(btn);
      }
    });
  }

  // ============ MODAL ============

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
    bindChannelButtons: bindChannelButtons,
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
