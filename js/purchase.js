/**
 * JAMB Quiz - Buy Points (Paystack + PIN) + Send Points + 10% bonus
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

  // ==================== BUY POINTS UI ====================

  function setupBuyPointsUI() {
    const uidEl = utils.$('uidDisplay');
    if (uidEl) uidEl.textContent = localStorage.getItem('jamb_uid') || '------';

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

    // Package clicks -> Paystack
    const packages = utils.getAll('.package-item');
    packages.forEach(function(item) {
      item.addEventListener('click', function() {
        const basePts = parseInt(item.dataset.pts, 10);
        const price = parseInt(item.dataset.price, 10);
        const calc = points.calcPurchaseTotal(basePts);
        openPaystack(price, basePts, calc);
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

    // Custom button -> Paystack
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
        openPaystack(price, raw, calc);
      });
    }

    // PIN activation (backup method)
    const activateBtn = utils.$('activatePinBtn');
    const pinInput = utils.$('pinInput');
    if (activateBtn && pinInput) {
      activateBtn.addEventListener('click', function() { redeemPin(pinInput.value); });
      pinInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') redeemPin(pinInput.value);
      });
    }
  }

  // ==================== PAYSTACK FLOW ====================

  function openPaystack(amountNaira, basePts, calc) {
    const key = getPaymentConfig().PAYSTACK_PUBLIC_KEY || '';
    if (!key || key.indexOf('YOUR_PUBLIC_KEY') !== -1) {
      utils.showToast('Paystack not configured yet', 'red');
      return;
    }

    if (typeof window.PaystackPop === 'undefined') {
      utils.showToast('Payment system still loading. Please try again.', 'red');
      return;
    }

    const amountKobo = amountNaira * 100;
    const uid = localStorage.getItem('jamb_uid') || '------';
    const reference = 'JAMBLAB-' + uid + '-' + Date.now();

    const paystack = new window.PaystackPop();
    paystack.newTransaction({
      key: key,
      email: 'user@jamblab.app',
      amount: amountKobo,
      reference: reference,
      metadata: {
        user_id: uid,
        base_points: basePts,
        bonus_points: calc.bonus,
        total_points: calc.total
      },
      onSuccess: function(transaction) {
        utils.showToast('Verifying payment...', 'green');

        fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: transaction.reference,
            userId: uid,
            basePoints: basePts
          })
        })
        .then(function(response) { return response.json(); })
        .then(function(result) {
          if (result.success && result.data) {
            const totalCredited = result.data.totalPoints;
            points.addPoints(totalCredited);

            utils.showToast(
              '🎉 ' + totalCredited + ' points credited! (' +
              result.data.basePoints + ' + ' + result.data.bonusPoints + ' bonus)',
              'green'
            );
          } else {
            utils.showToast('❌ Verification failed: ' + (result.message || 'Unknown'), 'red');

            const msg = 'I paid on JAMBLab but points were not credited.\n\n' +
              'Reference: ' + transaction.reference + '\n' +
              'Amount: ₦' + amountNaira.toLocaleString() + '\n' +
              'My User ID: ' + uid + '\n\n' +
              'Please help me.';
            setTimeout(function() {
              if (confirm('Payment verification failed. Send message to admin on WhatsApp?')) {
                window.open('https://wa.me/' + getAdminWhatsApp() + '?text=' + encodeURIComponent(msg), '_blank');
              }
            }, 1500);
          }
        })
        .catch(function(err) {
          console.error('Verification error:', err);
          utils.showToast('❌ Could not verify payment. Contact support.', 'red');
        });
      },
      onCancel: function() {
        utils.showToast('Payment cancelled', 'red');
      }
    });
  }

  // ==================== PIN ACTIVATION ====================

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

  // ==================== SEND POINTS ====================

  function generateSendCode(amount) {
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    return 'JAMBSEND-' + rand + '-' + amount;
  }

  function setupSendPointsUI() {
    const sendBtn = utils.$('sendPtsBtn');
    const sendInput = utils.$('sendPtsInput');
    const receiverInput = utils.$('sendReceiverInput');
    const sendNote = utils.$('sendNote');
    const claimBtn = utils.$('claimBtn');
    const claimInput = utils.$('claimInput');

    if (sendBtn && sendInput) {
      sendBtn.addEventListener('click', function() {
        const amount = parseInt(sendInput.value, 10);
        if (!amount || amount < 1) {
          utils.showToast('Enter a valid amount', 'red');
          return;
        }
        const balance = points.getPoints();
        if (amount > balance) {
          utils.showToast('You only have ' + balance + ' pts', 'red');
          return;
        }

        if (!points.transferPoints(amount)) {
          utils.showToast('Could not transfer', 'red');
          return;
        }

        const code = generateSendCode(amount);
        const receiver = (receiverInput && receiverInput.value.trim()) || 'anyone';
        const record = {
          amount: amount,
          senderId: localStorage.getItem('jamb_uid') || '------',
          receiver: receiver,
          createdAt: new Date().toISOString()
        };
        const codes = JSON.parse(localStorage.getItem('jamb_send_codes') || '{}');
        codes[code] = record;
        localStorage.setItem('jamb_send_codes', JSON.stringify(codes));

        const shareText = '🎁 *JAMB Points Gift!*\n\nI just sent you ' + amount +
          ' points on JAMBLab.\n\nClaim code: *' + code + '*\n\nOpen the app, paste the code under "Received a code?", and your points will be credited instantly!';
        const waUrl = 'https://wa.me/?text=' + encodeURIComponent(shareText);

        if (sendNote) {
          sendNote.innerHTML =
            '✅ Sent ' + amount + ' pts (balance: ' + points.getPoints() + ' pts)<br><br>' +
            'Your code: <strong>' + code + '</strong><br>' +
            '<a href="' + waUrl + '" target="_blank" rel="noopener noreferrer" ' +
            'style="display:inline-block;margin-top:8px;background:#25D366;color:white;' +
            'padding:0.5rem 1rem;border-radius:30px;text-decoration:none;font-weight:700;font-size:0.8rem;">' +
            '<i class="fab fa-whatsapp"></i> Share code on WhatsApp</a>';
          sendNote.classList.add('show');
        }

        sendInput.value = '';
        if (receiverInput) receiverInput.value = '';

        utils.showToast('Code generated! Share it with your friend.', 'green');
      });
    }

    if (claimBtn && claimInput) {
      claimBtn.addEventListener('click', function() {
        const raw = (claimInput.value || '').trim().toUpperCase();
        if (!raw) { utils.showToast('Enter a claim code', 'red'); return; }

        const codes = JSON.parse(localStorage.getItem('jamb_send_codes') || '{}');
        const record = codes[raw];

        if (!record) {
          utils.showToast('Invalid or already claimed code', 'red');
          return;
        }

        const myId = localStorage.getItem('jamb_uid') || '';
        if (record.senderId === myId) {
          utils.showToast('You cannot claim your own code', 'red');
          return;
        }

        points.addPoints(record.amount);
        delete codes[raw];
        localStorage.setItem('jamb_send_codes', JSON.stringify(codes));

        claimInput.value = '';
        utils.showToast('+' + record.amount + ' points claimed!', 'green');
      });
    }
  }

  return {
    setupBuyPointsUI: setupBuyPointsUI,
    setupSendPointsUI: setupSendPointsUI,
    requestPoints: openPaystack,
    redeemPin: redeemPin
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = JAMB_PURCHASE;
}
