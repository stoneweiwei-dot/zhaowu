import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  clientPromoRejection,
  isCustomerPromoCode,
  promoRejectLog,
  promoRejectReason,
} from "../supabase/functions/promo-code/redeem-policy.mjs";
import { redeemPromoCode } from "../src/lib/report-access.ts";
import { clearPurchaseConsent, recordPurchaseConsent } from "../src/lib/purchase-consent.ts";

const REASONS = ["not_found", "inactive", "expired", "wrong_system", "wrong_product", "exhausted", "slot_lost"];

test("not-found and expired share one status and one body", async () => {
  const wires = REASONS.map((reason) => {
    const rejection = clientPromoRejection(reason);
    return { status: rejection.status, body: JSON.parse(JSON.stringify(rejection.body)), reason: rejection.reason };
  });
  for (const wire of wires) {
    assert.equal(wire.status, 404);
    assert.deepEqual(wire.body, wires[0].body);
  }
  assert.deepEqual(wires.find((wire) => wire.reason === "expired").body, wires[0].body);
  assert.deepEqual(wires[0].body, {
    ok: false,
    error: { code: "PROMO_INVALID", message: "This code cannot be used." },
  });
  assert.notEqual(wires.find((wire) => wire.reason === "not_found").reason, "expired");

  const now = new Date("2026-10-30T00:00:00.000Z");
  const usable = { active: true, expires_at: null, system_id: "bazi", product_id: "system" };
  assert.equal(promoRejectReason(null, "bazi", now), "not_found");
  assert.equal(promoRejectReason({ ...usable, active: false }, "bazi", now), "inactive");
  assert.equal(promoRejectReason({ ...usable, expires_at: "2020-01-01T00:00:00.000Z" }, "bazi", now), "expired");
  assert.equal(promoRejectReason({ ...usable, system_id: "ziwei" }, "bazi", now), "wrong_system");
  assert.equal(promoRejectReason({ ...usable, product_id: "gift" }, "bazi", now), "wrong_product");
  assert.equal(promoRejectReason(usable, "bazi", now), null);

  const missing = await promoRejectLog("not_found", "ZW-SECRET-2345");
  const expired = await promoRejectLog("expired", "ZW-SECRET-2345");
  assert.equal(missing.event, "promo_redeem_rejected");
  assert.equal(missing.code_hash, expired.code_hash);
  assert.equal(missing.code_hash.length, 12);
  assert.notEqual(missing.reason, expired.reason);
  const encoded = JSON.stringify(missing) + JSON.stringify(expired);
  assert.equal(encoded.includes("SECRET"), false);
  assert.equal(encoded.includes("ZW-"), false);

  const src = readFileSync(new URL("../supabase/functions/promo-code/index.ts", import.meta.url), "utf8");
  assert.doesNotMatch(src, /PROMO_NOT_FOUND|PROMO_EXPIRED|PROMO_EXHAUSTED|PROMO_WRONG_SYSTEM|\b410\b/);
  assert.match(src, /rejectPromo/);
  assert.equal(isCustomerPromoCode("ZW-ABCD-2345"), true);
});

test("redemption UI uses one neutral message for every invalid code", async () => {
  const gate = readFileSync(new URL("../src/components/report-access-gate.tsx", import.meta.url), "utf8");
  assert.match(gate, /PROMO_INVALID: "That code can't be used\."/);
  assert.match(gate, /PROMO_INVALID: "这个代码无法使用。"/);
  assert.match(gate, /PROMO_INVALID: "這個代碼無法使用。"/);
  assert.doesNotMatch(gate, /PROMO_NOT_FOUND|PROMO_EXPIRED|PROMO_EXHAUSTED|PROMO_WRONG_SYSTEM/);

  const data = new Map([["zhaowu.report-access-key.v1", "12345678-1234-4234-8234-123456789abc"]]);
  const previous = { window: globalThis.window, localStorage: globalThis.localStorage, fetch: globalThis.fetch };
  globalThis.localStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => { data.set(key, value); },
    removeItem: (key) => { data.delete(key); },
  };
  globalThis.window = { location: { href: "/" } };
  recordPurchaseConsent();
  try {
    for (const [status, body] of [
      [404, { ok: false, error: { code: "PROMO_INVALID", message: "This code cannot be used." } }],
      [404, { ok: false, error: { code: "PROMO_NOT_FOUND" } }],
      [410, { ok: false, error: { code: "PROMO_EXPIRED" } }],
      [410, { ok: false, error: { code: "PROMO_EXHAUSTED" } }],
      [409, { ok: false, error: { code: "PROMO_WRONG_SYSTEM" } }],
    ]) {
      globalThis.fetch = async () => ({ ok: false, status, json: async () => body });
      await assert.rejects(redeemPromoCode("ZW-SECRET-2345", "bazi"), { message: "PROMO_INVALID" });
    }
  } finally {
    clearPurchaseConsent();
    for (const key of ["window", "localStorage", "fetch"]) {
      if (previous[key] === undefined) delete globalThis[key];
      else globalThis[key] = previous[key];
    }
  }
});
