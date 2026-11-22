/**
 * Shared Vercel KV helpers (Upstash Redis REST API)
 * Used by Jamb-Lab serverless PIN endpoints.
 */

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function kvCmd(cmd) {
  if (!KV_URL || !KV_TOKEN) {
    throw new Error('KV not configured (missing KV_REST_API_URL or KV_REST_API_TOKEN)');
  }
  const r = await fetch(KV_URL, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + KV_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cmd)
  });
  const j = await r.json().catch(function() { return null; });
  if (!r.ok) {
    throw new Error((j && (j.error || j.message)) || ('KV request failed: ' + r.status));
  }
  return (j && 'result' in j) ? j.result : null;
}

async function getJSON(key) {
  const raw = await kvCmd(['GET', key]);
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch (e) { return raw; }
  }
  return raw;
}

async function setJSON(key, value) {
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  return kvCmd(['SET', key, str]);
}

async function del(key) {
  return kvCmd(['DEL', key]);
}

async function keys(pattern) {
  return kvCmd(['KEYS', pattern]);
}

async function mget(keyList) {
  if (!Array.isArray(keyList) || !keyList.length) return [];
  return kvCmd(['MGET'].concat(keyList));
}

module.exports = { kvCmd, getJSON, setJSON, del, keys, mget };
