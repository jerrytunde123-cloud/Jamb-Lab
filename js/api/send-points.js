/**
 * Vercel Serverless Function: Send / Claim Points
 * POST /api/send-points
 *
 * Body actions:
 *   { action: 'create', code, amount, senderId, receiverId }
 *   { action: 'claim',  code, claimerId }
 */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  if (!KV_URL || !KV_TOKEN) {
    return res.status(500).json({ success: false, message: 'KV not configured' });
  }

  const { action, code, amount, senderId, receiverId, claimerId } = req.body || {};

  async function kvGet(key) {
    const r = await fetch(KV_URL + '/get/' + encodeURIComponent(key), {
      headers: { Authorization: 'Bearer ' + KV_TOKEN }
    });
    const j = await r.json();
    return j.result;
  }

  async function kvSet(key, value) {
    await fetch(KV_URL + '/set/' + encodeURIComponent(key), {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + KV_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value: JSON.stringify(value) })
    });
  }

  async function kvDel(key) {
    await fetch(KV_URL + '/del/' + encodeURIComponent(key), {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + KV_TOKEN }
    });
  }

  try {
    if (action === 'create') {
      if (!code || !amount || !senderId) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
      }
      const payload = {
        amount: amount,
        senderId: senderId,
        receiverId: receiverId || 'anyone',
        createdAt: Date.now()
      };
      await kvSet('send:' + code, payload);
      return res.status(200).json({ success: true, message: 'Code stored' });
    }

    if (action === 'claim') {
      if (!code || !claimerId) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
      }
      const stored = await kvGet('send:' + code);
      if (!stored) {
        return res.status(404).json({ success: false, message: 'Invalid or already claimed code' });
      }
      const payload = typeof stored === 'string' ? JSON.parse(stored) : stored;

      if (payload.senderId === claimerId) {
        return res.status(400).json({ success: false, message: 'You cannot claim your own code' });
      }
      // Optional: enforce receiver ID match
      if (payload.receiverId && payload.receiverId !== 'anyone' && payload.receiverId !== claimerId) {
        return res.status(400).json({ success: false, message: 'This code was meant for a different user' });
      }

      // Delete after claim (one-time use)
      await kvDel('send:' + code);
      return res.status(200).json({ success: true, amount: payload.amount });
    }

    return res.status(400).json({ success: false, message: 'Unknown action' });

  } catch (e) {
    console.error('KV error:', e.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
};
