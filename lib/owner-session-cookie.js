import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes, timingSafeEqual } from "node:crypto";

export const OWNER_COOKIE = "__Host-zhaowu_owner_session";
export const OWNER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const SEALED_PREFIX = "v1.";

export function isValidOwnerSecret(value, env = process.env) {
  if (!value || value.length < 8 || value.length > 256) return false;
  const hash = String(env?.ZHAOWU_OWNER_KEY_SHA256 ?? "").trim();
  if (!/^[a-f0-9]{64}$/i.test(hash)) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = createHash("sha256").update(String(value), "utf8").digest();
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Server-only key. Reuses the bridge secret that already exists in Production so no new env var is needed.
function sessionKey(env) {
  const base = String(env?.ZHAOWU_OWNER_BRIDGE_SECRET ?? "").trim();
  if (base.length < 16) return null;
  return Buffer.from(hkdfSync("sha256", base, "zhaowu-owner-session-v1", "cookie-aes-256-gcm", 32));
}

function seal(secret, key, nowMs) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const payload = JSON.stringify({ s: secret, exp: Math.floor(nowMs / 1000) + OWNER_SESSION_MAX_AGE_SECONDS });
  const body = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
  return SEALED_PREFIX + Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}

function unseal(value, key, nowMs, isValid) {
  try {
    const raw = Buffer.from(value.slice(SEALED_PREFIX.length), "base64url");
    if (raw.length < 12 + 16 + 1) return "";
    const decipher = createDecipheriv("aes-256-gcm", key, raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const payload = JSON.parse(Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8"));
    if (!Number.isFinite(payload?.exp) || payload.exp * 1000 <= nowMs) return "";
    return isValid(payload.s) ? payload.s : "";
  } catch {
    return "";
  }
}

/** Never issue a bearer cookie unless it is authenticated and encrypted by the server. */
export function ownerCookieValue(secret, { env = process.env, now = Date.now() } = {}) {
  const key = sessionKey(env);
  if (!key) throw new Error("OWNER_SESSION_NOT_CONFIGURED");
  return seal(secret, key, now);
}

export function ownerSetCookie(secret, options) {
  return `${OWNER_COOKIE}=${encodeURIComponent(ownerCookieValue(secret, options))}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${OWNER_SESSION_MAX_AGE_SECONDS}`;
}

export function ownerClearCookie() {
  return `${OWNER_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

/** Only authenticated, unexpired sealed cookies may recover the owner secret. */
// `isValid` exists so tests can run without knowing the real owner password; production callers never pass it.
export function ownerSecretFromCookieValue(value, { env = process.env, now = Date.now(), isValid = (secret) => isValidOwnerSecret(secret, env) } = {}) {
  if (!value) return "";
  if (value.startsWith(SEALED_PREFIX)) {
    const key = sessionKey(env);
    return key ? unseal(value, key, now, isValid) : "";
  }
  // Anything that is not a sealed v1 cookie (device sessions, purpose-bound payloads, legacy plain values) is never an owner secret.
  return "";
}

function headerValue(req, name) {
  const headers = req?.headers;
  if (!headers) return "";
  if (typeof headers.get === "function") return String(headers.get(name) ?? "");
  const raw = headers[name] ?? headers[name.toLowerCase()];
  return String(Array.isArray(raw) ? raw[0] : raw ?? "");
}

export function readCookie(req, name) {
  for (const part of headerValue(req, "cookie").split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    if (part.slice(0, index).trim() !== name) continue;
    try { return decodeURIComponent(part.slice(index + 1)); } catch { return ""; }
  }
  return "";
}

export function ownerSecretFromRequest(req, options) {
  return ownerSecretFromCookieValue(readCookie(req, OWNER_COOKIE), options);
}

export function requestHasOwnerSession(req, options) {
  return Boolean(ownerSecretFromRequest(req, options));
}

// ---- Purpose-bound sealed payloads (WebAuthn challenges, device sessions) -------------------------------------
// The purpose is mixed into the AES-GCM additional data, so a value sealed for one purpose never opens as another.

const PAYLOAD_PREFIX = "p1.";
const DEVICE_PREFIX = "d1.";
export const OWNER_DEVICE_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function payloadKey(env) {
  const base = String(env?.ZHAOWU_OWNER_BRIDGE_SECRET ?? "").trim();
  if (base.length < 16) return null;
  return Buffer.from(hkdfSync("sha256", base, "zhaowu-owner-session-v1", "payload-aes-256-gcm", 32));
}

/** Seals a JSON payload for `purpose`. Returns "" when no server key is configured (callers must fail closed). */
export function sealPayload(purpose, payload, { env = process.env, now = Date.now(), ttlSeconds = 300, prefix = PAYLOAD_PREFIX } = {}) {
  const key = payloadKey(env);
  if (!key) return "";
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(purpose, "utf8"));
  const body = Buffer.concat([cipher.update(JSON.stringify({ ...payload, exp: Math.floor(now / 1000) + ttlSeconds }), "utf8"), cipher.final()]);
  return prefix + Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}

/** Opens a payload sealed for `purpose`; returns null when invalid, expired, tampered or sealed for another purpose. */
export function openPayload(purpose, value, { env = process.env, now = Date.now(), prefix = PAYLOAD_PREFIX } = {}) {
  const key = payloadKey(env);
  if (!key || typeof value !== "string" || !value.startsWith(prefix)) return null;
  try {
    const raw = Buffer.from(value.slice(prefix.length), "base64url");
    if (raw.length < 12 + 16 + 1) return null;
    const decipher = createDecipheriv("aes-256-gcm", key, raw.subarray(0, 12));
    decipher.setAAD(Buffer.from(purpose, "utf8"));
    decipher.setAuthTag(raw.subarray(12, 28));
    const payload = JSON.parse(Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8"));
    if (!Number.isFinite(payload?.exp) || payload.exp * 1000 <= now) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Cookie value for a trusted device that signed in with a Passkey. It carries no owner secret. */
export function ownerDeviceCookieValue(deviceId, options = {}) {
  if (!UUID.test(String(deviceId))) return "";
  return sealPayload("owner-device-session", { d: String(deviceId).toLowerCase() }, {
    ...options,
    ttlSeconds: OWNER_DEVICE_SESSION_MAX_AGE_SECONDS,
    prefix: DEVICE_PREFIX,
  });
}

export function ownerDeviceSetCookie(deviceId, options) {
  const value = ownerDeviceCookieValue(deviceId, options);
  if (!value) return "";
  return `${OWNER_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${OWNER_DEVICE_SESSION_MAX_AGE_SECONDS}`;
}

/** Who is behind this cookie? { kind: "secret", secret } | { kind: "device", deviceId } | null. Device ids still need a revocation check. */
export function ownerAuthFromCookieValue(value, options = {}) {
  if (!value) return null;
  if (value.startsWith(DEVICE_PREFIX)) {
    const payload = openPayload("owner-device-session", value, { ...options, prefix: DEVICE_PREFIX });
    return payload && UUID.test(String(payload.d)) ? { kind: "device", deviceId: String(payload.d).toLowerCase() } : null;
  }
  const secret = ownerSecretFromCookieValue(value, options);
  return secret ? { kind: "secret", secret } : null;
}

export function ownerAuthFromRequest(req, options) {
  return ownerAuthFromCookieValue(readCookie(req, OWNER_COOKIE), options);
}
