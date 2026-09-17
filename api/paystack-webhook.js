/**
 * Vercel Serverless Function: Paystack Webhook Handler
 * POST /api/paystack-webhook
 *
 * Uses native crypto (built into Node) — no external dependencies.
 */

const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error('PAYSTACK_SECRET_KEY not configured');
    return res.status(500).json({ success: false });
  }

  const signature = req.headers['x-paystack-signature'];
  if (!signature) {
    return res.status(400).json({ success: false, message: 'Missing signature' });
  }

  // Re-stringify the parsed body for signature verification
  const rawBody = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('Invalid webhook signature');
    return res.status(401).json({ success: false, message: 'Invalid signature' });
  }

  const event = req.body;

  if (event.event === 'charge.success') {
    const tx = event.data;
    const metadata = tx.metadata || {};

    console.log('✅ Webhook: payment successful', {
      reference: tx.reference,
      amount: tx.amount / 100,
      user_id: metadata.user_id,
      base_points: metadata.base_points,
      total_points: metadata.total_points
    });
  }

  // Always respond 200 so Paystack stops retrying
  return res.status(200).json({ success: true });
};
