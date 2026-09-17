/**
 * Vercel Serverless Function: Verify Paystack Payment
 * POST /api/verify-payment
 * Body: { reference: "JAMBLAB-XXX-1234567890", userId: "ABC123", basePoints: 100 }
 */

const PaystackClient = require('paystack-sdk-node').default;

export default async function handler(req, res) {
  // Only allow POST
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
    // Initialize Paystack client
    const client = new PaystackClient({ apiKey: secretKey });

    // Verify the transaction with Paystack
    const result = await client.transactions.verify(reference);

    // Check if payment was successful
    if (!result || result.status !== true || !result.data) {
      return res.status(400).json({
        success: false,
        message: 'Transaction verification failed'
      });
    }

    const tx = result.data;

    // Double-check transaction status
    if (tx.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment not successful. Status: ' + tx.status
      });
    }

    // Verify the amount matches what we expected
    // Amount is in kobo (smallest unit), so multiply expected Naira by 100
    const expectedAmountKobo = basePoints * 10 * 100; // basePoints × ₦10/pt × 100 kobo
    if (tx.amount < expectedAmountKobo) {
      return res.status(400).json({
        success: false,
        message: 'Amount mismatch. Expected: ' + expectedAmountKobo + ', Got: ' + tx.amount
      });
    }

    // Calculate points with 10% bonus
    const bonus = Math.floor(basePoints * 0.10);
    const totalPoints = basePoints + bonus;

    // Return success - frontend will credit the points
    return res.status(200).json({
      success: true,
      message: 'Payment verified',
      data: {
        reference: reference,
        amountPaid: tx.amount / 100, // convert back to Naira
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
}
