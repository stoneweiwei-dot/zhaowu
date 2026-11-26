import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const OWNER_COOKIE = "__Host-zhaowu_owner_session";
export const OWNER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const SEALED_PREFIX = "v3.";

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
  // Pages Functions does not reliably run hkdfSync; derive the 32-byte key
  // with SHA-256 (createHash works in this runtime) instead.
  return createHash("sha256").update(`zhaowu-owner-session-v1:cookie-aes-256-gcm:${base}`, "utf8").digest();
}

// The owner-data bridge needs the original credential. Only the server can open this envelope.
function seal(secret, key, nowMs) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const expires = Math.floor(nowMs / 1000) + OWNER_SESSION_MAX_AGE_SECONDS;
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify({ s: secret, exp: expires }), "utf8"), cipher.final()]);
  return SEALED_PREFIX + Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64url");
}

function unseal(value, key, nowMs, isValid) {
  try {
    const bytes = Buffer.from(value.slice(SEALED_PREFIX.length), "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key, bytes.subarray(0, 12));
    decipher.setAuthTag(bytes.subarray(12, 28));
    const plain = Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]);
    const payload = JSON.parse(plain.toString("utf8"));
    return Number.isFinite(payload.exp) && payload.exp * 1000 > nowMs && isValid(payload.s) ? payload.s : "";
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

// SameSite=Lax, not Strict. Strict withheld this cookie on every cross-site top-level navigation,
// so arriving from an external link (Threads/Instagram/Messages/mail, a QR scan, an in-app browser
// handoff) rendered the site signed-out even though the session was still valid; `ownerProofValue`
// in lib/owner-auth.js exists only to work around that for OAuth returns. CSRF does not rest on this
// attribute: every owner mutation endpoint independently enforces same-origin
// (api/owner-login.js, api/owner-logout.js, api/owner-session.js, api/owner-data.js,
// api/owner-music-write.js), and Lax still withholds the cookie from cross-site POST/fetch.
export function ownerSetCookie(secret, options) {
  return `${OWNER_COOKIE}=${encodeURIComponent(ownerCookieValue(secret, options))}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${OWNER_SESSION_MAX_AGE_SECONDS}`;
}

export function ownerClearCookie() {
  return `${OWNER_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

/** Only authenticated, unexpired sealed cookies may recover the owner secret. */
// `isValid` exists so tests can run without knowing the real owner password; production callers never pass it.
export function ownerSecretFromCookieValue(value, { env = process.env, now = Date.now(), isValid = (secret) => isValidOwnerSecret(secret, env) } = {}) {
  if (!value) return "";
  if (value.startsWith(SEALED_PREFIX)) {
    const key = sessionKey(env);
    return key ? unseal(value, key, now, isValid) : "";
  }
  // Anything that is not a sealed password cookie (device sessions, purpose-bound payloads, legacy plain values) is never an owner secret.
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
// The purpose is mixed into the HMAC input, so a value sealed for one purpose never opens as another.

const PAYLOAD_PREFIX = "p1.";
const DEVICE_PREFIX = "d1.";
export const OWNER_DEVICE_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function payloadKey(env) {
  const base = String(env?.ZHAOWU_OWNER_BRIDGE_SECRET ?? "").trim();
  if (base.length < 16) return null;
  return createHash("sha256").update(`zhaowu-owner-session-v1:payload-aes-256-gcm:${base}`, "utf8").digest();
}

/** Seals a JSON payload for `purpose`. Returns "" when no server key is configured (callers must fail closed). */
export function sealPayload(purpose, payload, { env = process.env, now = Date.now(), ttlSeconds = 300, prefix = PAYLOAD_PREFIX } = {}) {
  const key = payloadKey(env);
  if (!key) return "";
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(now / 1000) + ttlSeconds }), "utf8").toString("base64url");
  const tag = createHmac("sha256", key).update(`${purpose}.${body}`, "utf8").digest().toString("base64url");
  return prefix + body + "." + tag;
}

/** Opens a payload sealed for `purpose`; returns null when invalid, expired, tampered or sealed for another purpose. */
export function openPayload(purpose, value, { env = process.env, now = Date.now(), prefix = PAYLOAD_PREFIX } = {}) {
  const key = payloadKey(env);
  if (!key || typeof value !== "string" || !value.startsWith(prefix)) return null;
  try {
    const body = value.slice(prefix.length);
    const dot = body.lastIndexOf(".");
    if (dot < 1) return null;
    const payloadB64 = body.slice(0, dot);
    const tagB64 = body.slice(dot + 1);
    const expected = createHmac("sha256", key).update(`${purpose}.${payloadB64}`, "utf8").digest();
    const actual = Buffer.from(tagB64, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
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
  return `${OWNER_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${OWNER_DEVICE_SESSION_MAX_AGE_SECONDS}`;
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
