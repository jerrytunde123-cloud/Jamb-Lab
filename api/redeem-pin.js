/**
 * POST /api/redeem-pin
 * Body: { pin, userId }
 * Redeems an activation PIN from Jamb-Lab's PIN store (source of truth).
 */

const pins = require('./_utils/pins');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const result = await pins.redeemPin({
      code: body.pin || body.code,
      userId: body.userId || body.uid || 'anon'
    });

    if (!result.ok) {
      return res.status(result.status || 400).json({
        success: false,
        message: result.message || 'Could not redeem PIN'
      });
    }

    return res.status(200).json({
      success: true,
      points: result.points,
      code: result.code,
      message: '+' + result.points + ' points added!'
    });
  } catch (e) {
    console.error('redeem-pin error:', e && e.message);
    return res.status(500).json({ success: false, message: 'Server error redeeming PIN' });
  }
};
