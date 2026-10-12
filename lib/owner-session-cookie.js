import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes, timingSafeEqual } from "node:crypto";

export const OWNER_COOKIE = "__Host-zhaowu_owner_session";
export const OWNER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const OWNER_KEY_SHA256 = "6236d83b2be351c9c80cd4ed07e8cadac684ab8d5a659096eb26b2e984a33c07";
const SEALED_PREFIX = "v1.";

export function isValidOwnerSecret(value) {
  if (!value || value.length < 8 || value.length > 256) return false;
  const expected = Buffer.from(OWNER_KEY_SHA256, "hex");
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

/** Value to put in the cookie. Falls back to the legacy plain value only when no server key is configured. */
export function ownerCookieValue(secret, { env = process.env, now = Date.now() } = {}) {
  const key = sessionKey(env);
  return key ? seal(secret, key, now) : secret;
}

export function ownerSetCookie(secret, options) {
  return `${OWNER_COOKIE}=${encodeURIComponent(ownerCookieValue(secret, options))}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${OWNER_SESSION_MAX_AGE_SECONDS}`;
}

export function ownerClearCookie() {
  return `${OWNER_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

/** Returns the owner secret for a cookie value, or "" when invalid/expired. Legacy plain cookies stay valid until they expire. */
// `isValid` exists so tests can run without knowing the real owner password; production callers never pass it.
export function ownerSecretFromCookieValue(value, { env = process.env, now = Date.now(), isValid = isValidOwnerSecret } = {}) {
  if (!value) return "";
  if (value.startsWith(SEALED_PREFIX)) {
    const key = sessionKey(env);
    return key ? unseal(value, key, now, isValid) : "";
  }
  return isValid(value) ? value : "";
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
