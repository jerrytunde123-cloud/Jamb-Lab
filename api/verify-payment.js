/**
 * Vercel Serverless Function: Verify Paystack Payment
 * POST /api/verify-payment
 * Body: { reference, userId, basePoints }
 *
 * Uses native fetch (Node 18+ on Vercel) — no external dependencies.
 */

module.exports = async function handler(req, res) {
  // CORS (so it works from any origin while testing)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { reference, userId, basePoints } = req.body || {};

  if (!reference || !userId || !basePoints) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.error('PAYSTACK_SECRET_KEY not configured');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  try {
    // Call Paystack Verify API directly
    const response = await fetch(
      'https://api.paystack.co/transaction/verify/' + encodeURIComponent(reference),
      {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + secretKey,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = await response.json();

    if (!result || result.status !== true || !result.data) {
      return res.status(400).json({
        success: false,
        message: 'Transaction verification failed'
      });
    }

    const tx = result.data;

    if (tx.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment not successful. Status: ' + tx.status
      });
    }

    // Verify the amount matches (₦10/pt × basePoints × 100 kobo)
    const expectedAmountKobo = basePoints * 10 * 100;
    if (tx.amount < expectedAmountKobo) {
      return res.status(400).json({
        success: false,
        message: 'Amount mismatch. Expected: ' + expectedAmountKobo + ', Got: ' + tx.amount
      });
    }

    const bonus = Math.floor(basePoints * 0.10);
    const totalPoints = basePoints + bonus;

    return res.status(200).json({
      success: true,
      message: 'Payment verified',
      data: {
        reference: reference,
        amountPaid: tx.amount / 100,
        basePoints: basePoints,
        bonusPoints: bonus,
        totalPoints: totalPoints,
        userId: userId,
        paidAt: tx.paid_at,
        channel: tx.channel
      }
    });

  } catch (error) {
    console.error('Paystack verification error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Verification failed: ' + error.message
    });
  }
};
