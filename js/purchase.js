/**
 * JAMB Quiz - Buy Points, PIN Activation, Sell Points (coming soon)
 *
 * Manual payment handling:
 *   - User taps a package (or enters a custom amount)
 *   - WhatsApp opens with a prefilled message containing their User ID
 *   - Admin sends back a unique activation PIN
 *   - User enters the PIN → points credited instantly (once per PIN)
 */

const JAMB_PURCHASE = (function() {
  'use strict';

  const state = typeof JAMB_STATE !== 'undefined' ? JAMB_STATE : require('./state.js');
  const utils = typeof JAMB_UTILS !== 'undefined' ? JAMB_UTILS : require('./utils.js');
  const points = typeof JAMB_POINTS !== 'undefined' ? JAMB_POINTS : require('./points.js');
  const referrals = typeof JAMB_REFERRALS !== 'undefined' ? JAMB_REFERRALS : require('./referrals.js');

  // ☎️ Your WhatsApp number in international format (no +, no spaces)
  const ADMIN_WHATSAPP = '2347048135078';

  // 🔐 Preloaded activation PINs.
  // ⚠️ The value must already include the 10% bonus.
  //    E.g. user pays for 50 pts → you send a PIN worth 55.
  const ACTIVATION_PINS = {
    'JAMB-A1B2-55':  55,
    'JAMB-C3D4-110': 110,
    'JAMB-E5F6-550': 550
    // Add more here
  };

  function getBonusPercent() {
    const config = state.getConfig();
    return (config.POINTS && config.POINTS.PURCHASE_BONUS_PERCENT) || 10;
  }

  function computeTotal(basePts) {
    const bonus = Math.floor(basePts * getBonusPercent() / 100);
    return { base: basePts, bonus: bonus, total: basePts + bonus };
  }

  function getUserId() {
    return referrals.getUserId ? referrals.getUserId() : (state.getUserId() || 'GUEST');
  }

  function openWhatsApp(pts, price, totalPts) {
    const uid = getUserId();
    const msg =
      'I want to purchase ' + pts + ' points on JAMBLab.\n\n' +
      'With +' + getBonusPercent() + '% bonus → ' + totalPts + ' points\n\n' +
      'User ID: ' + uid + '\n\n' +
      'Please send me the activation PIN.';
    const url = 'https://wa.me/' + ADMIN_WHATSAPP + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function setupUIDisplay() {
    const uidEl = utils.$('uidDisplay');
    if (uidEl) uidEl.textContent = getUserId();

    const copyBtn = utils.$('copyUidBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        const uid = getUserId();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(uid).then(function() {
            utils.showToast('User ID copied!', 'green');
          }).catch(function() {
            utils.showToast('User ID: ' + uid, 'green');
          });
        } else {
          utils.showToast('User ID: ' + uid, 'green');
        }
      });
    }
  }

  function setupPackages() {
    const items = document.querySelectorAll('.package-item');
    items.forEach(function(item) {
      item.addEventListener('click', function() {
        const base = parseInt(item.getAttribute('data-pts'), 10);
        const price = parseInt(item.getAttribute('data-price'), 10);
        if (!base || !price) return;
        const totals = computeTotal(base);
        openWhatsApp(base, price, totals.total);
      });
    });
  }

  function setupCustomAmount() {
    const input = utils.$('customPtsInput');
    const note = utils.$('customBonusNote');
    const btn = utils.$('customBuyBtn');

    if (input && note) {
      input.addEventListener('input', function() {
        const raw = parseInt(input.value, 10);
        if (!raw || raw < 1) {
          note.classList.remove('show');
          note.textContent = '';
          return;
        }
        const totals = computeTotal(raw);
        const price = raw * 10;
        note.textContent = '💚 You\'ll get ' + totals.total + ' points (' + raw + ' + ' + totals.bonus + ' bonus) for ₦' + price.toLocaleString();
        note.classList.add('show');
      });
    }

    if (btn && input) {
      btn.addEventListener('click', function() {
        const raw = parseInt(input.value, 10);
        if (!raw || raw < 1) {
          utils.showToast('Enter a valid points amount', 'red');
          return;
        }
        const totals = computeTotal(raw);
        const price = raw * 10;
        openWhatsApp(raw, price, totals.total);
      });
    }
  }

  function redeemPin(rawPin) {
    const pin = (rawPin || '').trim().toUpperCase();
    if (!pin) {
      utils.showToast('Enter a PIN', 'red');
      return;
    }
    if (localStorage.getItem('jamb_used_pin_' + pin) === 'yes') {
      utils.showToast('This PIN has already been used', 'red');
      return;
    }
    const pts = ACTIVATION_PINS[pin];
    if (typeof pts === 'undefined') {
      utils.showToast('Invalid PIN', 'red');
      return;
    }
    points.addPoints(pts);
    localStorage.setItem('jamb_used_pin_' + pin, 'yes');
    const input = utils.$('pinInput');
    if (input) input.value = '';
    utils.showToast('+' + pts + ' points added (includes 10% bonus)!', 'green');
  }

  function setupPinInput() {
    const btn = utils.$('activatePinBtn');
    const input = utils.$('pinInput');
    if (btn) {
      btn.addEventListener('click', function() {
        redeemPin(input ? input.value : '');
      });
    }
    if (input) {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') redeemPin(input.value);
      });
    }
  }

  function init() {
    setupUIDisplay();
    setupPackages();
    setupCustomAmount();
    setupPinInput();
  }

  return {
    init: init,
    redeemPin: redeemPin,
    computeTotal: computeTotal,
    getUserId: getUserId
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = JAMB_PURCHASE;
}
