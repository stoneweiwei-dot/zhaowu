import assert from "node:assert/strict";
import test from "node:test";
import { resolveReportAccess } from "../src/lib/report-access.ts";

const paidId = "cs_test_fakepaid1234567890";
const refundedId = "cs_test_fakerefund1234567890";

async function resolve(fixtures) {
  const data = new Map([
    ["zhaowu.report-access-key.v1", "12345678-1234-4234-8234-123456789abc"],
    ["zhaowu.report-access-sessions.v1", JSON.stringify(Object.keys(fixtures))],
  ]);
  const old = { window: globalThis.window, localStorage: globalThis.localStorage, fetch: globalThis.fetch };
  globalThis.localStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
  globalThis.window = { location: { search: "" } };
  globalThis.fetch = async (url) => {
    if (url === "/api/owner-session") return Response.json({ authenticated: false });
    const parsed = new URL(String(url));
    if (parsed.pathname.endsWith("/stripe-checkout")) return Response.json(fixtures[parsed.searchParams.get("session_id")]);
    if (parsed.pathname.endsWith("/promo-code")) return Response.json({ ok: true, paid: false });
    throw new Error("unexpected request");
  };
  try {
    const result = await resolveReportAccess("bazi");
    return { ...result, sessions: JSON.parse(data.get("zhaowu.report-access-sessions.v1")) };
  } finally {
    for (const key of ["window", "localStorage", "fetch"]) {
      if (old[key] === undefined) delete globalThis[key];
      else globalThis[key] = old[key];
    }
  }
}

const paid = (createdAt, extra = {}) => ({ ok: true, paid: true, product: "system", system: "bazi", createdAt, updatedAt: createdAt, ...extra });
const refunded = (createdAt) => ({ ok: true, paid: false, revoked: true, reason: "refunded", createdAt, updatedAt: createdAt });

test("refunded only stays at quick and is revoked", async () => {
  const result = await resolve({ [refundedId]: refunded("2026-11-20T08:24:36Z") });
  assert.equal(result.level, "quick");
  assert.equal(result.revoked, true);
});

test("paid only without live Stripe confirmation remains a legitimate unlock", async () => {
  const result = await resolve({ [paidId]: paid("2026-11-20T08:24:36Z") });
  assert.equal(result.level, "system");
  assert.equal(result.revoked, false);
});

test("later refunded entitlement beats an older paid entitlement", async () => {
  const result = await resolve({
    [paidId]: paid("2026-11-20T08:24:36Z"),
    [refundedId]: refunded("2026-11-20T17:34:58Z"),
  });
  assert.equal(result.level, "quick");
  assert.equal(result.revoked, true);
  assert.equal(result.sessions.length, 2);
});

test("later paid entitlement after a refund unlocks again", async () => {
  const result = await resolve({
    [refundedId]: refunded("2026-11-20T08:24:36Z"),
    [paidId]: paid("2026-11-20T17:34:58Z"),
  });
  assert.equal(result.level, "system");
  assert.equal(result.revoked, false);
});

test("live Stripe confirmed paid session remains authoritative", async () => {
  const result = await resolve({
    [refundedId]: refunded("2026-11-20T17:34:58Z"),
    [paidId]: paid("2026-11-20T08:24:36Z", { live: true }),
  });
  assert.equal(result.level, "system");
  assert.equal(result.revoked, false);
});
