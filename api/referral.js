/**
 * Vercel Serverless Function: Referral tracking
 * POST /api/referral
 *
 * Actions:
 *   { action: 'register', referrerId, newUserId }
 *   { action: 'get',      userId }
 *   { action: 'claim_due', userId }   → returns pending pts and marks as claimed
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

  // ---- KV helpers using Upstash pipeline format ----
  async function kvCmd(cmd) {
    const r = await fetch(KV_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + KV_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cmd)
    });
    const j = await r.json();
    return (j && 'result' in j) ? j.result : null;
  }

  async function kvGet(key) { return kvCmd(['GET', key]); }
  async function kvSet(key, value) { return kvCmd(['SET', key, value]); }
  async function kvIncr(key) { return kvCmd(['INCR', key]); }
  async function kvIncrBy(key, n) { return kvCmd(['INCRBY', key, n]); }

  try {
    // ============ REGISTER ============
    if (action === 'register') {
      if (!referrerId || !newUserId) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
      }
      if (referrerId === newUserId) {
        return res.status(400).json({ success: false, message: 'Cannot refer yourself' });
      }

      // Already referred?
      const already = await kvGet('referred:' + newUserId);
      if (already === 'yes') {
        const curCount = Number(await kvGet('refcount:' + referrerId) || 0);
        return res.status(200).json({ success: true, alreadyCounted: true, count: curCount });
      }

      // Mark new user as referred
      await kvSet('referred:' + newUserId, 'yes');

      // Increment referrer's count
      const count = await kvIncr('refcount:' + referrerId);

      // Add pending pts for referrer (+10 per referral)
      await kvIncrBy('pending_pts:' + referrerId, 10);

      console.log('Referral registered:', referrerId, '<-', newUserId, 'count:', count);

      return res.status(200).json({
        success: true,
        count: Number(count)
      });
    }

    // ============ GET COUNT ============
    if (action === 'get') {
      if (!userId) {
        return res.status(400).json({ success: false, message: 'Missing userId' });
      }
      const rawCount = await kvGet('refcount:' + userId);
      const count = Number(rawCount || 0);
      return res.status(200).json({ success: true, count: count });
    }

    // ============ CLAIM DUE POINTS ============
    if (action === 'claim_due') {
      if (!userId) {
        return res.status(400).json({ success: false, message: 'Missing userId' });
      }
      const rawPending = await kvGet('pending_pts:' + userId);
      const pending = Number(rawPending || 0);
      if (pending > 0) {
        await kvSet('pending_pts:' + userId, '0');
      }
      return res.status(200).json({ success: true, points: pending });
    }

    return res.status(400).json({ success: false, message: 'Unknown action' });

  } catch (e) {
    console.error('Referral error:', e.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
};
