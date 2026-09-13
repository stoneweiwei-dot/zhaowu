import { createHash, timingSafeEqual } from "node:crypto";

export const OWNER_COOKIE = "zhaowu_owner_session";
const OWNER_PASSWORD_SHA256 = "09c4406d450d7c55976bf2f3563a46edf6fae3b1a47c565fa7c734073e8c2e28";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function hash(value: string) {
  return createHash("sha256").update(value, "utf8").digest();
}

export function isValidOwnerSecret(value: string | null | undefined) {
  if (!value) return false;
  const expected = Buffer.from(OWNER_PASSWORD_SHA256, "hex");
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
