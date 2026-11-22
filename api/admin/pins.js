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

function getHeader(req, name) {
  const v = req.headers && req.headers[name];
  if (Array.isArray(v)) return v[0] || '';
  return v == null ? '' : String(v);
}

function isAuthorized(req) {
  const secret = process.env.PIN_ADMIN_SECRET;
  if (!secret) return { ok: false, reason: 'not_configured' };
  const hdr = getHeader(req, 'x-pin-admin-secret').trim();
  const auth = getHeader(req, 'authorization');
  const bearer = auth.toLower().startsWith('bearer ') ? auth.slice(7).trim() : '';
  if (hdr === secret || bearer === secret) return { ok: true };
  return { ok: false, reason: 'unauthorized' };
}

module.exports = async function handler(req, res) {
  const authz = isAuthorized(req);
  if (!authz.ok) {
    if (authz.reason === 'not_configured') {
      return res.status(500).json({ success: false, message: 'PIN admin secret not configured' });
    }
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
