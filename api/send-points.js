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
    return res.status(500).json({
      success: false,
      message: 'KV not configured. Enable Vercel KV in Storage tab.'
    });
  }

  const { action, code, amount, senderId, receiverId, claimerId } = req.body || {};

  // Send raw JSON string as the value
  async function kvSet(key, obj) {
    const r = await fetch(KV_URL + '/set/' + encodeURIComponent(key), {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + KV_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value: JSON.stringify(obj) })
    });
    return r.json();
  }

  async function kvGet(key) {
    const r = await fetch(KV_URL + '/get/' + encodeURIComponent(key), {
      headers: { Authorization: 'Bearer ' + KV_TOKEN }
    });
    const j = await r.json();
    if (!j || j.result === null || j.result === undefined) return null;
    const raw = j.result;
    // Redis returns a string; parse it
    if (typeof raw === 'string') {
      try { return JSON.parse(raw); } catch (e) { return null; }
    }
    // If somehow it was already an object
    if (typeof raw === 'object') return raw;
    return null;
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
        amount: Number(amount),
        senderId: String(senderId),
        receiverId: String(receiverId || 'anyone'),
        createdAt: Date.now()
      };
      await kvSet('send:' + code, payload);
      return res.status(200).json({ success: true, message: 'Code stored' });
    }

    if (action === 'claim') {
      if (!code || !claimerId) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
      }
      const payload = await kvGet('send:' + code);
      if (!payload) {
        return res.status(404).json({
          success: false,
          message: 'Invalid or already claimed code'
        });
      }

      if (String(payload.senderId) === String(claimerId)) {
        return res.status(400).json({
          success: false,
          message: 'You cannot claim your own code'
        });
      }
      if (payload.receiverId && payload.receiverId !== 'anyone' && String(payload.receiverId) !== String(claimerId)) {
        return res.status(400).json({
          success: false,
          message: 'This code was meant for a different user'
        });
      }

      // Delete after claim (single use)
      await kvDel('send:' + code);

      // ✅ Return amount as a number
      return res.status(200).json({
        success: true,
        amount: Number(payload.amount)
      });
    }

    return res.status(400).json({ success: false, message: 'Unknown action' });

  } catch (e) {
    console.error('KV error:', e.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
};
