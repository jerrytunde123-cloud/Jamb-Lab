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
  // PUBLIC API
  // ============================================
  return {
    getUserId: getUserId,
    generateUserId: generateUserId,
    buildReferralLink: buildReferralLink,
    handleIncomingReferral: handleIncomingReferral,
    awardReferralReward: awardReferralReward
  };
})();