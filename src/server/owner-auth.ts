import { createHash, timingSafeEqual } from "node:crypto";

export const OWNER_COOKIE = "__Host-zhaowu_owner_session";
// SHA-256 of the owner passcode. The raw passcode is never committed.
const OWNER_KEY_SHA256 = "cd448e56d6e7ea73ac6ff973646a5e40448df447e2a625f1b782440e0f704270";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function hash(value: string) {
  return createHash("sha256").update(value, "utf8").digest();
}

export function isValidOwnerSecret(value: string | null | undefined) {
  if (!value || value.length < 8 || value.length > 256) return false;
  const expected = Buffer.from(OWNER_KEY_SHA256, "hex");
  const actual = hash(value);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function readCookie(req: any, name: string) {
  const raw = String(req?.headers?.cookie ?? "");
  for (const part of raw.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    if (key !== name) continue;
    try { return decodeURIComponent(part.slice(index + 1)); } catch { return ""; }
  }
  return "";
}

export function ownerCookie(secret: string) {
  return `${OWNER_COOKIE}=${encodeURIComponent(secret)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE_SECONDS}`;
}

export function clearOwnerCookie() {
  return `${OWNER_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export function requestHasOwnerSession(req: any) {
  return isValidOwnerSecret(readCookie(req, OWNER_COOKIE));
}

export function requestIsSameOrigin(req: any) {
  const origin = String(req?.headers?.origin ?? "").trim();
  if (!origin) return true;
  const forwardedHost = String(req?.headers?.["x-forwarded-host"] ?? req?.headers?.host ?? "")
    .split(",")[0]
    .trim();
  if (!forwardedHost) return false;
  try {
    return new URL(origin).host === forwardedHost;
  } catch {
    return false;
  }
}
