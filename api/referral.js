/**
 * Vercel Serverless Function: Referral tracking
 * POST /api/referral
 *
 * Body:
 *   { action: 'register', referrerId, newUserId }
 *   { action: 'get',      userId }
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

  const { action, referrerId, newUserId, userId } = req.body || {};

  async function kvGet(key) {
    const r = await fetch(KV_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + KV_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['GET', key])
    });
    const j = await r.json();
    return (j && 'result' in j) ? j.result : null;
  }

  async function kvSet(key, value) {
    await fetch(KV_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + KV_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['SET', key, value])
    });
  }

  async function kvIncr(key) {
    const r = await fetch(KV_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + KV_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['INCR', key])
    });
    const j = await r.json();
    return (j && 'result' in j) ? j.result : 0;
  }

  try {
    if (action === 'register') {
      if (!referrerId || !newUserId) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
      }
      if (referrerId === newUserId) {
        return res.status(400).json({ success: false, message: 'Cannot refer yourself' });
      }

      // Prevent double-counting: check if this new user was already referred
      const alreadyReferred = await kvGet('referred:' + newUserId);
      if (alreadyReferred === 'yes') {
        return res.status(200).json({ success: true, alreadyCounted: true });
      }

      // Mark as referred
      await kvSet('referred:' + newUserId, 'yes');

      // Increment referrer's count
      const count = await kvIncr('refcount:' + referrerId);

      return res.status(200).json({
        success: true,
        count: Number(count)
      });
    }

    if (action === 'get') {
      if (!userId) {
        return res.status(400).json({ success: false, message: 'Missing userId' });
      }
      const count = await kvGet('refcount:' + userId);
      return res.status(200).json({
        success: true,
        count: Number(count || 0)
      });
    }

    return res.status(400).json({ success: false, message: 'Unknown action' });

  } catch (e) {
    console.error('Referral error:', e.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
};
