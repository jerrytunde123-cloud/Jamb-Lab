const crypto = require('crypto');
const kv = require('./kv');

const PIN_PREFIX = 'jamb:pin:';

const LEGACY_PINS = {
  'JAMB-A1B2-55': 55,
  'JAMB-C3D4-110': 110,
  'JAMB-E5F6-550': 550
};

function normalizeCode(code) {
  return String(code || '').trim().toUpperCase();
}

function pinKey(code) {
  return PIN_PREFIX + code;
}

function safePoints(value) {
  const n = parseInt(value, 10);
  return (!n || isNaN(n) || n < 1) ? 0 : n;
}

async function ensureLegacyPins() {
  // Seed legacy static pins if missing so existing distributed codes keep working.
  for (const [code, points] of Object.entries(LEGACY_PINS)) {
    const key = pinKey(code);
    const existing = await kv.getJSON(key);
    if (!existing) {
      await kv.setJSON(key, {
        code,
        points: safePoints(points),
        used: false,
        usedBy: null,
        usedAt: null,
        createdAt: Date.now(),
        source: 'legacy-seed'
      });
    }
  }
}

async function listPins() {
  await ensureLegacyPins();
  const keys = await kv.keys(PIN_PREFIX + '*') || [];
  if (!Array.isArray(keys) || keys.length === 0) return {};
  const raw = await kv.mget(keys);
  const pins = {};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const code = String(key).slice(PIN_PREFIX.length);
    let obj = raw ? raw[i] : null;
    if (typeof obj === 'string') {
      try { obj = JSON.parse(obj); } catch (e) { obj = null; }
    }
    if (obj && typeof obj === 'object') {
      // Normalize shape
      pins[code] = {
        points: safePoints(obj.points),
        used: !!obj.used,
        usedBy: obj.usedBy || null,
        usedAt: obj.usedAt || null,
        createdAt: obj.createdAt || null
      };
    }
  }
  return pins;
}

async function getPin(code) {
  const c = normalizeCode(code);
  if (!c) return null;
  await ensureLegacyPins();
  const obj = await kv.getJSON(pinKey(c));
  if (!obj || typeof obj !== 'object') return null;
  return {
    points: safePoints(obj.points),
    used: !!obj.used,
    usedBy: obj.usedBy || null,
    usedAt: obj.usedAt || null,
    createdAt: obj.createdAt || null
  };
}

function randomSegment(len) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

async function generatePins({ points, count, prefix }) {
  const pts = safePoints(points);
  let qty = parseInt(count, 10);
  if (!pts) throw new Error('Invalid points');
  if (!qty || qty < 1) throw new Error('Invalid quantity');
  if (qty > 500) qty = 500;
  const pre = String(prefix || 'JAMB').trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || 'JAMB';

  const created = [];
  let attempts = 0;
  while (created.length < qty && attempts < qty * 20) {
    attempts++;
    const code = pre + '-' + randomSegment(5) + '-' + pts;
    const key = pinKey(code);
    const existing = await kv.getJSON(key);
    if (existing) continue;
    const payload = {
      code,
      points: pts,
      used: false,
      usedBy: null,
      usedAt: null,
      createdAt: Date.now()
    };
    // Best-effort uniqueness: only set if absent
    const res = await kv.kvCmd(['SET', key, JSON.stringify(payload), 'NX']);
    if (res === 'OK' || res === true) {
      created.push(code);
    }
  }
  if (!created.length) throw new Error('Could not generate unique PINs');
  return created;
}

async function resetPin(code) {
  const c = normalizeCode(code);
  if (!c) throw new Error('Invalid code');
  await ensureLegacyPins();
  const key = pinKey(c);
  const obj = await kv.getJSON(key);
  if (!obj || typeof obj !== 'object') throw new Error('PIN not found');
  obj.used = false;
  obj.usedBy = null;
  obj.usedAt = null;
  await kv.setJSON(key, obj);
  return true;
}

async function deletePin(code) {
  const c = normalizeCode(code);
  if (!c) throw new Error('Invalid code');
  await kv.del(pinKey(c));
  return true;
}

async function redeemPin({ code, userId }) {
  const c = normalizeCode(code);
  if (!c) return { ok: false, status: 400, message: 'Enter a PIN' };
  await ensureLegacyPins();
  const key = pinKey(c);
  const uid = String(userId || 'anon').slice(0, 64);
  const now = Date.now();

  // Attempt atomic redeem via Lua to prevent double-use races.
  const script = "local v=redis.call('GET',KEYS[1]); if not v then return cjson.encode({err='NOT_FOUND'}); end; local obj=cjson.decode(v); if obj.used then return cjson.encode({err='USED'}); end; obj.used=true; obj.usedBy=ARGV[1]; obj.usedAt=tonumber(ARGV[2]); redis.call('SET',KEYS[1],cjson.encode(obj)); return cjson.encode({ok=true,points=obj.points});";
  try {
    const raw = await kv.kvCmd(['EVAL', script, '1', key, uid, String(now)]);
    let parsed = raw;
    if (typeof raw === 'string') {
      try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
    }
    if (parsed && parsed.ok) {
      return { ok: true, points: safePoints(parsed.points), code: c };
    }
    if (parsed && parsed.err === 'USED') {
      return { ok: false, status: 409, message: 'This PIN has already been used' };
    }
    if (parsed && parsed.err === 'NOT_FOUND') {
      return { ok: false, status: 404, message: 'Invalid PIN' };
    }
    // fall through to non-Lua path if unexpected
  } catch (e) {
    // fall through to read-modify-write fallback
  }

  // Fallback (non-atomic) if EVAL unavailable
  const obj = await kv.getJSON(key);
  if (!obj || typeof obj !== 'object') {
    return { ok: false, status: 404, message: 'Invalid PIN' };
  }
  if (obj.used) {
    return { ok: false, status: 409, message: 'This PIN has already been used' };
  }
  obj.used = true;
  obj.usedBy = uid;
  obj.usedAt = now;
  await kv.setJSON(key, obj);
  return { ok: true, points: safePoints(obj.points), code: c };
}

module.exports = {
  normalizeCode,
  listPins,
  getPin,
  generatePins,
  resetPin,
  deletePin,
  redeemPin
};
