/**
 * JAMB Quiz - Unlock System
 *
 * Two types of channel buttons:
 *   1. Compulsory unlock channels (data-channel-num="1|2") → daily join to unlock quiz
 *   2. Bonus channels (data-bonus-key="...") → one-time bonus points
 *
 * Rewards logic:
 *   - First-time both compulsory channels joined → +15 pts (once ever)
 *   - Every NEW DAY both compulsory channels joined → +5 pts daily check-in
 *   - Bonus channels → one-time point rewards
 */

const JAMB_UNLOCK = (function() {
  'use strict';

  const state = typeof JAMB_STATE !== 'undefined' ? JAMB_STATE : require('./state.js');
  const utils = typeof JAMB_UTILS !== 'undefined' ? JAMB_UTILS : require('./utils.js');
  const points = typeof JAMB_POINTS !== 'undefined' ? JAMB_POINTS : require('./points.js');

  const DAILY_CHECKIN_BONUS = 5;

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

  // First-time reward: +15 pts once EVER
  function awardUnlockBonusOnce() {
    if (localStorage.getItem('jamb_unlock_bonus_perm') === 'yes') return;
    localStorage.setItem('jamb_unlock_bonus_perm', 'yes');
    const bonus = state.getConfig().POINTS.UNLOCK_BONUS;
    points.addPoints(bonus);
    utils.showToast('🎉 +' + bonus + ' points for joining both channels for the first time!', 'green');
  }

  // Daily reward: +5 pts EVERY DAY both channels are joined
  function awardDailyCheckin() {
    if (localStorage.getItem('jamb_daily_checkin') === utils.todayKey()) return;
    localStorage.setItem('jamb_daily_checkin', utils.todayKey());
    points.addPoints(DAILY_CHECKIN_BONUS);
    utils.showToast('✅ Daily check-in: +' + DAILY_CHECKIN_BONUS + ' pts!', 'green');
  }

  function checkUnlock() {
    const unlocked = isFullyUnlocked();
    state.setUnlocked(unlocked);
    if (unlocked) {
      awardUnlockBonusOnce();   // once ever
      awardDailyCheckin();      // once per day
    }
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
      row.classList.add('claimed');
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

  function handleBonusChannelClick(btn) {
    if (!btn || btn.dataset.deepLinkBound === 'yes') return;
    btn.dataset.deepLinkBound = 'yes';

    const channelId = btn.getAttribute('data-channel-id');
    const key = btn.getAttribute('data-bonus-key');
    const amount = parseInt(btn.getAttribute('data-bonus-amount'), 10);
    const rowId = btn.getAttribute('data-bonus-row');
    if (!channelId || !key || !amount) return;

    if (localStorage.getItem('jamb_perm_' + key) === 'yes') {
      btn.classList.add('claimed');
      const row = document.getElementById(rowId);
      if (row) row.classList.add('claimed');
    }

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      openWhatsAppChannel(channelId);

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

  function bindChannelButtons() {
    const btns = document.querySelectorAll('.channel-btn');
    btns.forEach(function(btn) {
      const num = btn.getAttribute('data-channel-num');
      const bonusKey = btn.getAttribute('data-bonus-key');

      if (num) {
        handleUnlockChannelClick(btn);
      } else if (bonusKey) {
        handleBonusChannelClick(btn);
      }
    });
  }

  // ============ SHOW MORE CHANNELS ============

  let channelsExpanded = false;

  function setupShowMoreChannels() {
    const btn = utils.$('showMoreChannelsBtn');
    if (!btn) return;

    btn.addEventListener('click', function() {
      channelsExpanded = !channelsExpanded;
      const hidden = document.querySelectorAll('.hidden-channel');
      hidden.forEach(function(el) {
        if (channelsExpanded) el.classList.add('show');
        else el.classList.remove('show');
      });
      btn.innerHTML = channelsExpanded
        ? '<i class="fas fa-minus"></i> Show less channels'
        : '<i class="fas fa-plus"></i> Show more channels';
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
    setupShowMoreChannels: setupShowMoreChannels,
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
