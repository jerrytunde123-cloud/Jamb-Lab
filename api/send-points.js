/**
 * Vercel Serverless Function: Send / Claim Points
 * POST /api/send-points
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
      message: 'KV not configured'
    });
  }

  const { action, code, amount, senderId, receiverId, claimerId } = req.body || {};

  // --- KV helpers using Vercel REST API ---
  // We store plain JSON strings and let Redis handle them as raw strings.

  async function kvSet(key, valueString) {
    // Vercel REST: POST /set/{key} with body { value: "<string>" }
    const r = await fetch(KV_URL + '/set/' + encodeURIComponent(key), {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + KV_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value: valueString })
    });
    return r.json();
  }

  async function kvGetRaw(key) {
    const r = await fetch(KV_URL + '/get/' + encodeURIComponent(key), {
      headers: { Authorization: 'Bearer ' + KV_TOKEN }
    });
    const j = await r.json();
    return j.result; // could be string, object, or null
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

      // Store as a plain JSON string
      await kvSet('send:' + code, JSON.stringify(payload));

      return res.status(200).json({ success: true, message: 'Code stored' });
    }

    if (action === 'claim') {
      if (!code || !claimerId) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
      }

      const raw = await kvGetRaw('send:' + code);
      console.log('KV raw value:', raw, 'type:', typeof raw);

      if (raw === null || raw === undefined || raw === '') {
        return res.status(404).json({
          success: false,
          message: 'Invalid or already claimed code'
        });
      }

      // Handle both cases: raw is a string OR already-parsed object
      let payload = null;
      if (typeof raw === 'string') {
        try {
          payload = JSON.parse(raw);
        } catch (e) {
          return res.status(500).json({
            success: false,
            message: 'Stored data corrupted'
          });
        }
      } else if (typeof raw === 'object') {
        payload = raw;
      }

      if (!payload || typeof payload.amount === 'undefined') {
        return res.status(500).json({
          success: false,
          message: 'Stored data missing amount'
        });
      }

      if (String(payload.senderId) === String(claimerId)) {
        return res.status(400).json({
          success: false,
          message: 'You cannot claim your own code'
        });
      }

      if (payload.receiverId && payload.receiverId !== 'anyone' &&
          String(payload.receiverId) !== String(claimerId)) {
        return res.status(400).json({
          success: false,
          message: 'This code was meant for a different user'
        });
      }

      // Delete after claim
      await kvDel('send:' + code);

      const amt = Number(payload.amount);
      return res.status(200).json({
        success: true,
        amount: amt
      });
    }

    return res.status(400).json({ success: false, message: 'Unknown action' });

  } catch (e) {
    console.error('KV error:', e.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
};
