/**
 * JAMB Quiz - Buy Points (PIN activation) + 10% bonus
 */

const JAMB_PURCHASE = (function() {
  'use strict';

  const state = typeof JAMB_STATE !== 'undefined' ? JAMB_STATE : require('./state.js');
  const utils = typeof JAMB_UTILS !== 'undefined' ? JAMB_UTILS : require('./utils.js');
  const points = typeof JAMB_POINTS !== 'undefined' ? JAMB_POINTS : require('./points.js');

  function getPaymentConfig() {
    const cfg = state.getConfig();
    return cfg.PAYMENT || {};
  }

  function getAdminWhatsApp() {
    return getPaymentConfig().ADMIN_WHATSAPP || '';
  }

  function getPins() {
    return getPaymentConfig().ACTIVATION_PINS || {};
  }

  function setupBuyPointsUI() {
    // Show user ID
    const uidEl = utils.$('uidDisplay');
    if (uidEl) uidEl.textContent = localStorage.getItem('jamb_uid') || '------';

    // Copy user ID
    const copyUid = utils.$('copyUidBtn');
    if (copyUid) {
      copyUid.addEventListener('click', function() {
        const uid = localStorage.getItem('jamb_uid') || '';
        try {
          navigator.clipboard.writeText(uid);
          utils.showToast('User ID copied!', 'green');
        } catch (e) {
          utils.showToast('User ID: ' + uid, 'green');
        }
      });
    }

    // Package items
    const packages = utils.getAll('.package-item');
    packages.forEach(function(item) {
      item.addEventListener('click', function() {
        const basePts = parseInt(item.dataset.pts, 10);
        const price = parseInt(item.dataset.price, 10);
        const calc = points.calcPurchaseTotal(basePts);
        requestPoints(basePts, price, calc.total);
      });
    });

    // Custom amount live preview
    const customInput = utils.$('customPtsInput');
    const customNote = utils.$('customBonusNote');
    if (customInput && customNote) {
      customInput.addEventListener('input', function() {
        const raw = parseInt(customInput.value, 10);
        if (!raw || raw < 1) {
          customNote.classList.remove('show');
          return;
        }
        const calc = points.calcPurchaseTotal(raw);
        const price = raw * 10;
        customNote.textContent = "You'll get " + calc.total +
          " points (" + raw + " + " + calc.bonus + " bonus) for ₦" +
          price.toLocaleString();
        customNote.classList.add('show');
      });
    }

    // Custom request button
    const customBtn = utils.$('customBuyBtn');
    if (customBtn && customInput) {
      customBtn.addEventListener('click', function() {
        const raw = parseInt(customInput.value, 10);
        if (!raw || raw < 1) {
          utils.showToast('Enter a valid points amount', 'red');
          return;
        }
        const calc = points.calcPurchaseTotal(raw);
        const price = raw * 10;
        requestPoints(raw, price, calc.total);
      });
    }

    // PIN activation
    const activateBtn = utils.$('activatePinBtn');
    const pinInput = utils.$('pinInput');
    if (activateBtn && pinInput) {
      activateBtn.addEventListener('click', function() { redeemPin(pinInput.value); });
      pinInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') redeemPin(pinInput.value);
      });
    }
  }

  function requestPoints(basePts, price, totalPts) {
    const uid = localStorage.getItem('jamb_uid') || '------';
    const msg =
      'I want to purchase ' + basePts + ' points on JAMBLab.\n\n' +
      'With +10% bonus → ' + totalPts + ' points\n\n' +
      'User ID: ' + uid + '\n\n' +
      'Please send me the activation PIN.';
    const url = 'https://wa.me/' + getAdminWhatsApp() + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
  }

  function redeemPin(rawPin) {
    const pin = (rawPin || '').trim().toUpperCase();
    if (!pin) { utils.showToast('Enter a PIN', 'red'); return; }

    if (localStorage.getItem('jamb_used_pin_' + pin) === 'yes') {
      utils.showToast('This PIN has already been used', 'red');
      return;
    }

    const pins = getPins();
    const pts = pins[pin];
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

  return {
    setupBuyPointsUI: setupBuyPointsUI,
    requestPoints: requestPoints,
    redeemPin: redeemPin
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = JAMB_PURCHASE;
}
