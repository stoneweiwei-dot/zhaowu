import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolveReportAccess, startReportCheckout } from "../src/lib/report-access.ts";

const load = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [client, resultView, webhook, shell] = await Promise.all([
  load("src/lib/report-access.ts"),
  load("src/components/result-view.tsx"),
  load("supabase/functions/stripe-webhook/index.ts"),
  load("src/components/site-shell.tsx"),
]);

function browserFixture(verification) {
  const data = new Map([
    ["zhaowu.report-access-key.v1", "12345678-1234-4234-8234-123456789abc"],
    ["zhaowu.report-access-sessions.v1", JSON.stringify(["cs_live_1234567890abcdef"])],
  ]);
  let redirect = "";
  const old = { window: globalThis.window, localStorage: globalThis.localStorage, fetch: globalThis.fetch };
  globalThis.localStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => { data.set(key, value); },
    removeItem: (key) => { data.delete(key); },
  };
  globalThis.window = { location: { search: "", assign(url) { redirect = url; } } };
  globalThis.fetch = async (url) => {
    if (url === "/api/owner-session") return Response.json({ authenticated: false });
    if (String(url).includes("/functions/v1/stripe-checkout")) return Response.json({ ok: true, paid: true, ...verification });
    throw Error("unexpected request: " + url);
  };
  return {
    data,
    redirected: () => redirect,
    restore: () => {
      for (const key of ["window", "localStorage", "fetch"]) {
        if (old[key] === undefined) delete globalThis[key];
        else globalThis[key] = old[key];
      }
    },
  };
}

test("six-system bundle cannot unlock separate BaZi, but unlocks all six specialists", async () => {
  const browser = browserFixture({ product: "bundle", system: null });
  try {
    assert.equal((await resolveReportAccess("bazi")).level, "quick");
    for (const system of ["ziwei", "qizheng", "western", "indian", "palm", "numerology"]) {
      assert.equal((await resolveReportAccess(system)).level, "bundle", system);
    }
  } finally { browser.restore(); }
});

test("BaZi payment unlocks BaZi alone, never Zi Wei", async () => {
  const browser = browserFixture({ product: "system", system: "bazi" });
  try {
    assert.equal((await resolveReportAccess("bazi")).level, "system");
    assert.equal((await resolveReportAccess("ziwei")).level, "quick");
  } finally { browser.restore(); }
});

test("BaZi checkout preserves report ID and passes only opaque reference to Stripe", async () => {
  const browser = browserFixture({ product: "system", system: "bazi" });
  try {
    const id = "11111111-1111-4111-8111-111111111111";
    await startReportCheckout("system", "bazi", id);
    const checkoutUrl = new URL(browser.redirected());
    assert.equal(checkoutUrl.origin, "https://buy.stripe.com");
    assert.equal(checkoutUrl.searchParams.get("client_reference_id"), "12345678-1234-4234-8234-123456789abc");
    assert.equal(browser.data.get("zhaowu.pending-bazi-report.v1"), id);
    assert.ok(browser.redirected().includes("8x2eVda51eHD7Sb4142sM0l"));
    await assert.rejects(startReportCheckout("bundle", "bazi"), /PAYMENT_LINK_MISSING/);
  } finally { browser.restore(); }
});

test("USD prices and webhook entitlement agree with new Stripe link", () => {
  assert.match(client, /system: \{ amountCents: 499, price: "US\$4\.99" \}/);
  assert.match(client, /bundle: \{ amountCents: 999, price: "US\$9\.99" \}/);
  assert.match(webhook, /plink_1UP3HWFAzopdCCaxkt9pGy9Z: \{ product: "system", system: "bazi", amount: 499 \}/);
  assert.match(resultView, /resolveReportAccess\("bazi"\)/);
  assert.match(resultView, /startReportCheckout\(product, product === "bundle" \? "ziwei" : "bazi", result\.id\)/);
  assert.match(resultView, /六個專門系統完整深讀（不含本頁八字命書）/);
  assert.match(shell, /pending-bazi-report\.v1/);
  assert.doesNotMatch(resultView, /Zi Wei Full Reading|紫微斗數完整深批/);
});
