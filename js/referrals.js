/**
 * JAMB Quiz - Referral System
 * Handles user IDs, referral links, and referral rewards
 */

const JAMB_REFERRALS = (function() {
  'use strict';

  const state = JAMB_STATE;
  const utils = JAMB_UTILS;
  const points = JAMB_POINTS;

  // ============================================
  // USER ID MANAGEMENT
  // ============================================
  function generateUserId() {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem('jamb_uid', id);
    return id;
  }

  function getUserId() {
    let id = localStorage.getItem('jamb_uid');
    if (!id) {
      id = generateUserId();
    }
    state.setUserId(id);
    return id;
  }

  function buildReferralLink() {
    const base = window.location.origin + window.location.pathname;
    return base + '?ref=' + getUserId();
  }

  // ============================================
  // INCOMING REFERRAL HANDLING
  // ============================================
  function handleIncomingReferral() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    
    // Validate referral
    if (!ref || ref === getUserId() || state.getReferralUsed() === ref) {
      return;
    }
    
    // Mark as used
    state.setReferralUsed(ref);
    localStorage.setItem('jamb_ref_used', ref);
    
    // Update count
    const count = state.getReferralCount() + 1;
    state.setReferralCount(count);
    localStorage.setItem('jamb_ref_count', String(count));
    
    const refCountEl = utils.$('refCount');
    if (refCountEl) refCountEl.textContent = count;
    
    // Newbie bonus (one time)
    if (!state.isNewbieBonusClaimed()) {
      state.setNewbieBonusClaimed(true);
      localStorage.setItem('jamb_newbie_bonus', 'yes');
      points.addPoints(5);
      utils.showToast('🎉 Welcome! +5 bonus points', 'green');
    }
    
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
  }

  // ============================================
  // REFERRAL REWARD (for the referrer)
  // ============================================
  function awardReferralReward(ref) {
    if (!ref || ref === getUserId()) return;
    if (localStorage.getItem('jamb_earned_ref_' + ref) === 'yes') return;
    
    localStorage.setItem('jamb_earned_ref_' + ref, 'yes');
    points.addPoints(state.getConfig().POINTS.REFERRAL_REWARD);
    utils.showToast('🎁 +10 points for using a referral link!', 'green');
  }

  // ============================================
  // REFERRAL SHARE UI
  // ============================================
  function setupReferralUI() {
    const link = buildReferralLink();

    // Fill the readonly input with the user's referral link
    const input = utils.$('referralLink');
    if (input) input.value = link;

    // Copy button
    const copyBtn = utils.$('copyRefBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        copyLink(link);
      });
    }

    // WhatsApp share button
    const shareBtn = utils.$('shareRefBtn');
    if (shareBtn) {
      shareBtn.href = 'https://wa.me/?text=' + encodeURIComponent(
        '🎓 Practice JAMB questions with me on JAMB Lab! ' + link
      );
    }
  }

  function copyLink(link) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(function() {
        utils.showToast('📋 Referral link copied!', 'green');
      }).catch(function() {
        fallbackCopy(link);
      });
    } else {
      fallbackCopy(link);
    }
  }

  function fallbackCopy(link) {
    const input = utils.$('referralLink');
    if (!input) return;
    input.removeAttribute('readonly');
    input.select();
    try {
      document.execCommand('copy');
      utils.showToast('📋 Referral link copied!', 'green');
    } catch (e) {
      utils.showToast('Could not copy - please copy manually', 'orange');
    }
    input.setAttribute('readonly', '');
    window.getSelection().removeAllRanges();
  }

  // ============================================
  // PUBLIC API
  // ============================================
  return {
    getUserId: getUserId,
    generateUserId: generateUserId,
    buildReferralLink: buildReferralLink,
    handleIncomingReferral: handleIncomingReferral,
    awardReferralReward: awardReferralReward,
    setupReferralUI: setupReferralUI
  };
})();