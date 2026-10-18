// Owner bridge authorisation for zhaowu-owner-articles.
// Deliberately a self-contained copy of the check used by zhaowu-owner-data/security.mjs
// (same bridge versions, same ZHAOWU_OWNER_BRIDGE_SECRET, same owner-key SHA-256) so this function
// deploys on its own and never has to import across function directories.
// scripts/owner-promo-admin.test.mjs fails if the two owner-key hashes ever drift apart.
import { createHash, timingSafeEqual } from "node:crypto";

export const OWNER_KEY_SHA256 = "785e70fa759f63896bb714e7440f6d756d5696583fd2864d98a25ff642e840cb";

function text(value) {
  return String(value ?? "").trim();
}

export function isValidOwnerSecret(value, expectedHash = OWNER_KEY_SHA256) {
  const secret = text(value);
  if (secret.length < 8 || secret.length > 256) return false;
  const hash = text(expectedHash).toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(hash)) return false;
  const expected = Uint8Array.from(hash.match(/.{2}/g), (pair) => Number.parseInt(pair, 16));
  const actual = createHash("sha256").update(secret, "utf8").digest();
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function authorizeBridgeHeaders(headers, expectedSecret, expectedOwnerHash = OWNER_KEY_SHA256) {
  const bridgeVersion = text(headers?.get?.("x-zhaowu-server-bridge"));
  if (bridgeVersion !== "r146" && bridgeVersion !== "r161" && bridgeVersion !== "r162") {
    return { ok: false, status: 403, error: "BRIDGE_REQUIRED" };
  }
  const actual = text(headers?.get?.("x-zhaowu-bridge-secret"));
  const expected = text(expectedSecret);
  if (expected.length >= 32) {
    if (actual.length !== expected.length) return { ok: false, status: 401, error: "BRIDGE_UNAUTHORIZED" };
    let diff = 0;
    for (let index = 0; index < actual.length; index += 1) diff |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
    if (diff !== 0) return { ok: false, status: 401, error: "BRIDGE_UNAUTHORIZED" };
  }
  if (!isValidOwnerSecret(headers?.get?.("x-zhaowu-owner-secret"), expectedOwnerHash)) {
    return { ok: false, status: 401, error: "OWNER_UNAUTHORIZED" };
  }
  return { ok: true };
}
