import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { generateCode, normalizeCreate, normalizeUpdate, promoStatus, toPublicRow, SYSTEM_IDS } from "../supabase/functions/zhaowu-owner-promo/logic.mjs";
import { authorizeBridgeHeaders } from "../supabase/functions/zhaowu-owner-promo/auth.mjs";
import { authorizeBridgeHeaders as dataAuthorize } from "../supabase/functions/zhaowu-owner-data/security.mjs";
import { ownerUpstreamFunction } from "../api/owner-data.js";

const NOW = new Date("2026-10-17T00:00:00.000Z");
const rnd = (n) => Uint8Array.from({ length: n }, (_, i) => i * 7 + 3);
const future = (days) => new Date(NOW.getTime() + days * 86_400_000).toISOString();

test("generated codes use the unambiguous ZW-XXXX-XXXX shape", () => {
  const code = generateCode(rnd);
  assert.match(code, /^ZW-[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$/);
  assert.doesNotMatch(code, /[01OIL]/);
});

test("create: system code, bundle code, and auto code", () => {
  const a = normalizeCreate({ productId: "system", systemId: "bazi", maxRedemptions: 1, expiresAt: future(30), note: " 送人 " }, { now: NOW, randomBytes: rnd });
  assert.equal(a.ok, true);
  assert.equal(a.value.system_id, "bazi");
  assert.equal(a.value.note, "送人");
  assert.equal(a.value.active, true);
  assert.match(a.value.code, /^ZW-/);
  const b = normalizeCreate({ productId: "bundle", code: "VIP-2026" }, { now: NOW, randomBytes: rnd });
  assert.equal(b.ok, true);
  assert.equal(b.value.code, "VIP-2026");
  assert.equal(b.value.max_redemptions, null);
  assert.equal(b.value.expires_at, null);
});

test("create: rejects values the database or the owner would not mean", () => {
  const bad = (payload) => normalizeCreate(payload, { now: NOW, randomBytes: rnd }).error;
  assert.equal(bad({ productId: "gift" }), "BAD_PRODUCT");
  assert.equal(bad({ productId: "bundle", systemId: "bazi" }), "BUNDLE_CANNOT_PIN_SYSTEM");
  assert.equal(bad({ productId: "system", systemId: "tarot" }), "BAD_SYSTEM");
  assert.equal(bad({ productId: "system", maxRedemptions: 0 }), "BAD_MAX_REDEMPTIONS");
  assert.equal(bad({ productId: "system", maxRedemptions: 100001 }), "BAD_MAX_REDEMPTIONS");
  assert.equal(bad({ productId: "system", maxRedemptions: 1.5 }), "BAD_MAX_REDEMPTIONS");
  assert.equal(bad({ productId: "system", expiresAt: future(-1) }), "BAD_EXPIRY");
  assert.equal(bad({ productId: "system", expiresAt: future(365 * 6) }), "BAD_EXPIRY");
  assert.equal(bad({ productId: "system", expiresAt: "not a date" }), "BAD_EXPIRY");
  assert.equal(bad({ productId: "system", note: "x".repeat(201) }), "NOTE_TOO_LONG");
  assert.equal(bad({ productId: "system", code: "bad code!" }), "BAD_CODE");
  assert.equal(bad({ productId: "system", code: "ab" }), "BAD_CODE");
  for (const id of SYSTEM_IDS) assert.equal(normalizeCreate({ productId: "system", systemId: id }, { now: NOW, randomBytes: rnd }).ok, true);
});

test("update: cannot lower the cap below redeemed_count, empty patch refused", () => {
  const current = { redeemed_count: 3 };
  assert.equal(normalizeUpdate({ maxRedemptions: 2 }, current, { now: NOW }).error, "MAX_BELOW_REDEEMED");
  assert.equal(normalizeUpdate({ maxRedemptions: 3 }, current, { now: NOW }).ok, true);
  assert.equal(normalizeUpdate({ maxRedemptions: null }, current, { now: NOW }).value.max_redemptions, null);
  assert.equal(normalizeUpdate({}, current, { now: NOW }).error, "NOTHING_TO_UPDATE");
  assert.equal(normalizeUpdate({ active: "yes" }, current, { now: NOW }).error, "BAD_ACTIVE");
  const patch = normalizeUpdate({ active: false }, current, { now: NOW }).value;
  assert.deepEqual(Object.keys(patch).sort(), ["active", "updated_at"]);
  assert.equal("redeemed_count" in patch, false, "owner console must never write redeemed_count");
});

test("status and public row shape", () => {
  const base = { id: "u", code: "C", product_id: "system", system_id: "bazi", active: true, max_redemptions: 2, redeemed_count: 0, expires_at: future(1), note: null, created_at: NOW.toISOString() };
  assert.equal(promoStatus(base, NOW), "active");
  assert.equal(promoStatus({ ...base, active: false }, NOW), "inactive");
  assert.equal(promoStatus({ ...base, expires_at: future(-1) }, NOW), "expired");
  assert.equal(promoStatus({ ...base, redeemed_count: 2 }, NOW), "exhausted");
  assert.equal(promoStatus({ ...base, max_redemptions: null, redeemed_count: 99 }, NOW), "active");
  const row = toPublicRow(base, NOW);
  assert.equal(row.note, "");
  assert.equal(row.systemId, "bazi");
  assert.equal("system_id" in row, false);
});

test("promo function auth is the same gate as zhaowu-owner-data", () => {
  const ownerKey = "test-owner-key";
  const ownerHash = createHash("sha256").update(ownerKey, "utf8").digest("hex");
  const secret = "s".repeat(40);
  const h = (o) => new Headers(o);
  const good = { "x-zhaowu-server-bridge": "r162", "x-zhaowu-bridge-secret": secret, "x-zhaowu-owner-secret": ownerKey };
  for (const fn of [authorizeBridgeHeaders, dataAuthorize]) {
    assert.equal(fn(h(good), secret, ownerHash).ok, true);
    assert.equal(fn(h({ ...good, "x-zhaowu-server-bridge": "r1" }), secret, ownerHash).error, "BRIDGE_REQUIRED");
    assert.equal(fn(h({ ...good, "x-zhaowu-bridge-secret": "x".repeat(40) }), secret, ownerHash).error, "BRIDGE_UNAUTHORIZED");
    assert.equal(fn(h({ ...good, "x-zhaowu-owner-secret": "nope" }), secret, ownerHash).error, "OWNER_UNAUTHORIZED");
    assert.equal(fn(h({}), secret, ownerHash).ok, false);
  }
});

test("owner-data routes promo.* to the isolated function, everything else unchanged", () => {
  for (const a of ["promo.list", "promo.create", "promo.update", "promo.setActive"]) assert.equal(ownerUpstreamFunction(a), "zhaowu-owner-promo");
  for (const a of ["reports.list", "gallery.list", "autopublish.status"]) assert.equal(ownerUpstreamFunction(a), "zhaowu-owner-data");
});

test("promo function never deletes and never touches redeemed_count or the redeem path", () => {
  const src = readFileSync(new URL("../supabase/functions/zhaowu-owner-promo/index.ts", import.meta.url), "utf8");
  assert.doesNotMatch(src, /\.delete\s*\(/);
  assert.doesNotMatch(src, /redeemed_count\s*:/);
  assert.doesNotMatch(src, /promo_redemptions/);
});
