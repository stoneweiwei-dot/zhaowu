import {
  OWNER_COOKIE,
  ownerAuthFromRequest,
  ownerCookieValue,
  ownerDeviceCookieValue,
} from "./owner-session-cookie.js";

import { ownerSupabaseUrl } from "./owner-supabase-origin.js";
const DEVICE_CHECK_TTL_MS = 60_000;

function envValue(env, key) {
  return String(env?.[key] ?? "").trim();
}

/** Headers that prove the owner to the owner-data Edge Function: the password for secret sessions, the device id for Passkey sessions. */
export function ownerAuthHeaders(auth) {
  if (auth?.kind === "device") return { "X-Zhaowu-Owner-Device": auth.deviceId };
  if (auth?.kind === "secret") return { "X-Zhaowu-Owner-Secret": auth.secret };
  return {};
}

/**
 * Calls the owner-data Edge Function.
 * `auth` null is for the few bridge-only actions (credential lookup during Passkey sign-in).
 */
export async function ownerEdgeRequest(action, payload, auth, env = process.env, fetchImpl = fetch) {
  const base = ownerSupabaseUrl(env);
  const bridgeSecret = envValue(env, "ZHAOWU_OWNER_BRIDGE_SECRET");
  if (!bridgeSecret) throw new Error("OWNER_EDGE_NOT_CONFIGURED");
  const response = await fetchImpl(`${base}/functions/v1/zhaowu-owner-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Zhaowu-Bridge-Secret": bridgeSecret,
      "X-Zhaowu-Server-Bridge": "r162",
      ...ownerAuthHeaders(auth),
    },
    body: JSON.stringify({ action, ...payload }),
    signal: AbortSignal.timeout(20_000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.ok === false) throw new Error(String(body?.error || `OWNER_EDGE_HTTP_${response.status}`));
  return body;
}

// Per-instance cache so a burst of owner requests costs one revocation lookup per minute.
// Worst case a revoked phone keeps working for DEVICE_CHECK_TTL_MS on instances that already cached it.
const deviceCache = new Map();

export function clearOwnerDeviceCache() {
  deviceCache.clear();
}

async function deviceIsActive(deviceId, { env, fetchImpl, now }) {
  const cached = deviceCache.get(deviceId);
  if (cached && cached.until > now) return cached.active;
  let active = false;
  try {
    const body = await ownerEdgeRequest("owner.device.check", { deviceId }, null, env, fetchImpl);
    active = body?.active === true;
  } catch {
    return false; // fail closed: if revocation cannot be checked the device is not trusted
  }
  deviceCache.set(deviceId, { active, until: now + DEVICE_CHECK_TTL_MS });
  return active;
}

/**
 * A cookie-shaped proof of the current owner, for flows that leave the site and come back (OAuth redirects)
 * where the SameSite=Strict session cookie is not sent. It is sealed with the server key, never the raw password.
 */
export function ownerProofValue(auth, options) {
  if (auth?.kind === "secret") return ownerCookieValue(auth.secret, options);
  if (auth?.kind === "device") return ownerDeviceCookieValue(auth.deviceId, options);
  return "";
}

/** Re-checks a proof produced by ownerProofValue, including device revocation. */
export function authenticateOwnerProof(proof, deps) {
  if (!proof) return Promise.resolve(null);
  return authenticateOwner({ headers: { cookie: `${OWNER_COOKIE}=${encodeURIComponent(proof)}` } }, deps);
}

/**
 * Resolves the owner behind a request.
 * Returns { kind: "secret", secret } | { kind: "device", deviceId } | null.
 */
export async function authenticateOwner(req, { env = process.env, fetchImpl = fetch, now = Date.now(), cookieOptions } = {}) {
  const auth = ownerAuthFromRequest(req, { env, now, ...cookieOptions });
  if (!auth) return null;
  if (auth.kind === "secret") return auth;
  return (await deviceIsActive(auth.deviceId, { env, fetchImpl, now })) ? auth : null;
}
