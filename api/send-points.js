/**
 * Vercel Serverless Function: Send / Claim Points
 * POST /api/send-points
 *
 * Robust KV read/write that handles all response shapes.
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

  // ============================================================
  // KV HELPERS — handles all Vercel KV / Upstash response shapes
  // ============================================================

  // Use Upstash pipeline REST format (works with Vercel KV)
  async function kvSet(key, valueString) {
    // Command as array: ["SET", key, value]
    const r = await fetch(KV_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + KV_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['SET', key, valueString])
    });
    return r.json();
  }

  async function kvGet(key) {
    // Command as array: ["GET", key]
    const r = await fetch(KV_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + KV_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['GET', key])
    });
    const j = await r.json();
    // Upstash returns { result: "value" } or { result: null }
    if (j && typeof j === 'object' && 'result' in j) return j.result;
    return null;
  }

  async function kvDel(key) {
    await fetch(KV_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + KV_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['DEL', key])
    });
  }

  // Parse whatever KV gives us into a real object
  function parseStoredValue(raw) {
    if (raw === null || raw === undefined) return null;

    // Case 1: raw is already a plain object with amount
    if (typeof raw === 'object' && raw !== null && 'amount' in raw) {
      return raw;
    }

    // Case 2: raw is a string — parse it
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        // parsed could still be a string (double-encoded)
        if (typeof parsed === 'string') {
          try { return JSON.parse(parsed); } catch (e) { return null; }
        }
        if (typeof parsed === 'object' && parsed !== null) return parsed;
        return null;
      } catch (e) {
        return null;
      }
    }

    return null;
  }

  // ============================================================
  // ACTIONS
  // ============================================================

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

      const jsonString = JSON.stringify(payload);
      await kvSet('send:' + code, jsonString);

      console.log('Stored code:', code, 'payload:', jsonString);

      return res.status(200).json({ success: true, message: 'Code stored' });
    }

    if (action === 'claim') {
      if (!code || !claimerId) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
      }

      const raw = await kvGet('send:' + code);
      console.log('KV GET raw for', code, '=>', raw, '(', typeof raw, ')');

      const payload = parseStoredValue(raw);

      if (!payload) {
        return res.status(404).json({
          success: false,
          message: 'Invalid or already claimed code'
        });
      }

      if (typeof payload.amount === 'undefined' || payload.amount === null) {
        console.error('Stored payload missing amount:', payload);
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

      await kvDel('send:' + code);

      const amt = Number(payload.amount);
      console.log('Claim successful for', code, 'amount:', amt);

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
