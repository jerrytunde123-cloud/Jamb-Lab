/**
 * JAMB Quiz - Referral System
 * - New user gets +10 pts welcome bonus (once)
 * - Referrer gets +10 pts per referral (auto-credited on next app open)
 * - Referral count tracked in Vercel KV
 */

const JAMB_REFERRALS = (function() {
  'use strict';

  const state = typeof JAMB_STATE !== 'undefined' ? JAMB_STATE : require('./state.js');
  const utils = typeof JAMB_UTILS !== 'undefined' ? JAMB_UTILS : require('./utils.js');
  const points = typeof JAMB_POINTS !== 'undefined' ? JAMB_POINTS : require('./points.js');

  const WELCOME_BONUS = 10;
  const REFERRER_REWARD = 10;

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

  // ============ INCOMING REFERRAL (?ref=XXXXX) ============
  function handleIncomingReferral() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (!ref) return;

    const myId = getUserId();

    // Can't refer yourself
    if (ref === myId) {
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    // Already got welcome bonus before? Don't give again
    if (localStorage.getItem('jamb_newbie_bonus') === 'yes') {
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    localStorage.setItem('jamb_newbie_bonus', 'yes');
    localStorage.setItem('jamb_ref_used', ref);
    state.setReferralUsed(ref);
    state.setNewbieBonusClaimed(true);

    // +10 pts welcome bonus to new user
    points.addPoints(WELCOME_BONUS);
    utils.showToast('🎉 Welcome! +' + WELCOME_BONUS + ' points bonus', 'green');

    // Notify server: referrer gets +10
    fetch('/api/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        referrerId: ref,
        newUserId: myId
      })
    })
    .then(function(r) { return r.json(); })
    .then(function(result) {
      if (result && result.success) {
        console.log('✅ Referral registered. Referrer count:', result.count);
      }
    })
    .catch(function(err) {
      console.warn('Referral registration failed:', err.message);
    });

    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
  }

  // ============ REFERRAL UI ============
  function setupReferralUI() {
    const link = buildReferralLink();
    const input = utils.$('referralLink');
    if (input) input.value = link;

    // ---- Copy button ----
    const copyBtn = utils.$('copyRefBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        copyLink(link);
      });
    }

    // ---- WhatsApp share button ----
    const shareBtn = utils.$('shareRefBtn');
    if (shareBtn) {
      const message =
        '🎓 Join me on JAMB Quiz builder! Earn points, take quizzes and pass JAMB!\n\n' +
        link + '\n\n' +
        'You get a *+10 points* welcome bonus when you join!';

      // Use whatsapp:// protocol to open the app directly on mobile
      // Falls back to wa.me for desktop
      const encoded = encodeURIComponent(message);
      shareBtn.href = 'https://api.whatsapp.com/send?text=' + encoded;
      shareBtn.setAttribute('target', '_blank');
      shareBtn.setAttribute('rel', 'noopener noreferrer');

      // On mobile, try to force WhatsApp app open
      shareBtn.addEventListener('click', function(e) {
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          // Let the default href work — it opens the app via universal link
          // (WhatsApp intercepts api.whatsapp.com/send links)
        }
      });
    }

    // ---- Load referral count ----
    loadReferralCount();
    autoCreditReferrer();
  }

  // ============ REFERRAL COUNT (from KV) ============
  function loadReferralCount() {
    const myId = getUserId();
    const el = utils.$('refCount');
    if (!el) return;

    // Show cached value first
    const cached = localStorage.getItem('jamb_ref_count') || '0';
    el.textContent = cached;

    // Fetch fresh count from server
    fetch('/api/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get', userId: myId })
    })
    .then(function(r) { return r.json(); })
    .then(function(result) {
      if (result && result.success) {
        el.textContent = String(result.count || 0);
        localStorage.setItem('jamb_ref_count', String(result.count || 0));
      }
    })
    .catch(function(err) {
      console.warn('Could not fetch referral count:', err.message);
    });
  }

  // ============ AUTO-CREDIT REFERRER'S PENDING POINTS ============
  function autoCreditReferrer() {
    const myId = getUserId();

    fetch('/api/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'claim_due', userId: myId })
    })
    .then(function(r) { return r.json(); })
    .then(function(result) {
      if (result && result.success && result.points > 0) {
        points.addPoints(result.points);
        const friendCount = Math.floor(result.points / REFERRER_REWARD);
        utils.showToast(
          '🎉 +' + result.points + ' pts from ' + friendCount +
          ' new referral' + (friendCount > 1 ? 's' : '') + '!',
          'green'
        );
      }
    })
    .catch(function(err) {
      console.warn('Could not claim referral pts:', err.message);
    });
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
