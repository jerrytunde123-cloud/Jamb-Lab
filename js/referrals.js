/**
 * JAMB Quiz - Referral System
 * Static-site referrals can only reward the person who opens the link.
 */

const JAMB_REFERRALS = (function() {
  'use strict';

  const state = typeof JAMB_STATE !== 'undefined' ? JAMB_STATE : require('./state.js');
  const utils = typeof JAMB_UTILS !== 'undefined' ? JAMB_UTILS : require('./utils.js');
  const points = typeof JAMB_POINTS !== 'undefined' ? JAMB_POINTS : require('./points.js');

  function generateUserId() {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem('jamb_uid', id);
    return id;
  }

  function getUserId() {
    let id = localStorage.getItem('jamb_uid');
    if (!id) id = generateUserId();
    state.setUserId(id);
    return id;
  }

  function buildReferralLink() {
    const base = window.location.origin + window.location.pathname;
    return base + '?ref=' + getUserId();
  }

  function handleIncomingReferral() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (!ref || ref === getUserId()) return;

    if (state.isNewbieBonusClaimed() || localStorage.getItem('jamb_newbie_bonus') === 'yes') {
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    state.setReferralUsed(ref);
    localStorage.setItem('jamb_ref_used', ref);
    state.setNewbieBonusClaimed(true);
    localStorage.setItem('jamb_newbie_bonus', 'yes');

    const reward = state.getConfig().POINTS.REFERRAL_REWARD;
    points.addPoints(reward);
    utils.showToast('Welcome! +' + reward + ' bonus points', 'green');
    window.history.replaceState({}, '', window.location.pathname);
  }

  function setupReferralUI() {
    const link = buildReferralLink();
    const input = utils.$('referralLink');
    if (input) input.value = link;

    const copyBtn = utils.$('copyRefBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        copyLink(link);
      });
    }

    const shareBtn = utils.$('shareRefBtn');
    if (shareBtn) {
      shareBtn.href = 'https://wa.me/?text=' + encodeURIComponent(
        'Practice JAMB questions with me on JAMB Lab! ' + link
      );
    }
  }

  function copyLink(link) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(function() {
        utils.showToast('Referral link copied!', 'green');
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
      utils.showToast('Referral link copied!', 'green');
    } catch (e) {
      utils.showToast('Could not copy — please copy manually', 'red');
    }
    input.setAttribute('readonly', '');
    if (window.getSelection) window.getSelection().removeAllRanges();
  }

  return {
    getUserId: getUserId,
    buildReferralLink: buildReferralLink,
    handleIncomingReferral: handleIncomingReferral,
    setupReferralUI: setupReferralUI
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = JAMB_REFERRALS;
}
