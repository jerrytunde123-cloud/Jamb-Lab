/**
 * JAMB Quiz - Unlock System
 * Handles channel verification and app unlocking
 */

const JAMB_UNLOCK = (function() {
  'use strict';

  const state = JAMB_STATE;
  const utils = JAMB_UTILS;

  // ============================================
  // CHECK UNLOCK STATUS
  // ============================================
  function checkUnlock() {
    const tgJoined = localStorage.getItem('jamb_tg') === 'yes';
    const waJoined = localStorage.getItem('jamb_wa') === 'yes';
    const unlocked = tgJoined && waJoined;
    
    state.setUnlocked(unlocked);
    
    // Update UI
    updateUnlockUI();
    JAMB_POINTS.updateStartButtonState();
    
    return unlocked;
  }

  // ============================================
  // UPDATE UNLOCK UI
  // ============================================
  function updateUnlockUI() {
    const box = utils.$('unlockBox');
    
    if (!box) return;
    
    if (state.isUnlocked()) {
      box.style.display = 'none';
    } else {
      box.style.display = 'block';
      box.innerHTML = 
        '<p style="font-size:0.95rem">' +
          '<i class="fas fa-lock"></i> Join <strong>both</strong> Telegram & WhatsApp channels to unlock quizzes' +
        '</p>' +
        '<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;align-items:center">' +
          '<a href="https://t.me/JambNewton" target="_blank" class="btn-whatsapp btn-telegram" style="width:auto;display:inline-flex">' +
            '<i class="fab fa-telegram"></i> Join Telegram' +
          '</a>' +
          '<a href="https://wa.me/2348067034075?text=I%27m%20joining%20the%20JAMB%20Newton%20WhatsApp%20channel" ' +
             'target="_blank" class="btn-whatsapp" style="width:auto;display:inline-flex">' +
            '<i class="fab fa-whatsapp"></i> Join WhatsApp' +
          '</a>' +
        '</div>';
    }
  }

  // ============================================
  // MARK CHANNELS AS JOINED
  // ============================================
  function markTelegramJoined() {
    localStorage.setItem('jamb_tg', 'yes');
    checkUnlock();
    utils.showToast('✅ Telegram channel joined! +15 points', 'green');
    JAMB_POINTS.addPoints(state.getConfig().POINTS.TG_CHANNEL_BONUS);
  }

  function markWhatsAppJoined() {
    localStorage.setItem('jamb_wa', 'yes');
    checkUnlock();
    utils.showToast('✅ WhatsApp channel joined! +10 points', 'green');
    JAMB_POINTS.addPoints(state.getConfig().POINTS.WAEC_CHANNEL_BONUS);
  }

  // ============================================
  // PUBLIC API
  // ============================================
  return {
    checkUnlock: checkUnlock,
    updateUnlockUI: updateUnlockUI,
    markTelegramJoined: markTelegramJoined,
    markWhatsAppJoined: markWhatsAppJoined
  };
})();