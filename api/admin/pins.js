/**
 * Admin PIN management endpoint (server-to-server, secret-protected).
 * Source of truth for activation PINs.
 *
 * GET  -> { success, pins }
 * POST { action: 'generate', points, count, prefix }
 * POST { action: 'reset', code }
 * POST { action: 'delete', code }
 */

const pinsStore = require('../_utils/pins');

function isAuthorized(req) {
  const secret = process.env.PIN_ADMIN_SECRET;
  if (!secret) return false;
  const hdr = req.headers['x-pin-admin-secret'] || '';
  const auth = req.headers['authorization'] || '';
  const bearer = auth.toLower().startsWith('bearer ') ? auth.slice(7).trim() : '';
  return hdr === secret || bearer === secret;
}

module.exports = async function handler(req, res) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const pins = await pinsStore.listPins();
      return res.status(200).json({ success: true, pins, count: Object.keys(pins).length });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const action = body.action;

      if (action === 'generate') {
        const created = await pinsStore.generatePins({
          points: body.points,
          count: body.count,
          prefix: body.prefix
        });
        const pins = await pinsStore.listPins();
        return res.status(200).json({
          success: true,
          created: created.length,
          codes: created,
          pins,
          count: Object.keys(pins).length
        });
      }

      if (action === 'reset') {
        await pinsStore.resetPin(body.code);
        const pins = await pinsStore.listPins();
        return res.status(200).json({ success: true, pins, count: Object.keys(pins).length });
      }

      if (action === 'delete') {
        await pinsStore.deletePin(body.code);
        const pins = await pinsStore.listPins();
        return res.status(200).json({ success: true, pins, count: Object.keys(pins).length });
      }

      return res.status(400).json({ success: false, message: 'Unknown action' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (e) {
    console.error('admin pins error:', e && e.message);
    return res.status(500).json({ success: false, message: e.message || 'Server error' });
  }
};
