import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolveReportAccess, startReportCheckout } from "../src/lib/report-access.ts";
import { clearPurchaseConsent, recordPurchaseConsent } from "../src/lib/purchase-consent.ts";

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

test("BaZi payment unlocks BaZi alone, never Zi Wei", async () => {
  const browser = browserFixture({ product: "system", system: "bazi" });
  try {
    assert.equal((await resolveReportAccess("bazi")).level, "system");
    assert.equal((await resolveReportAccess("ziwei")).level, "quick");
  } finally { browser.restore(); }
});

test("a temporary entitlement lookup failure remains unconfirmed rather than granting access", async () => {
  const browser = browserFixture({ product: "system", system: "bazi" });
  try {
    globalThis.fetch = async (url) => {
      if (url === "/api/owner-session") return Response.json({ authenticated: false });
      if (String(url).includes("/functions/v1/stripe-checkout")) throw new Error("network unavailable");
      if (String(url).includes("/functions/v1/promo-code")) return Response.json({ ok: true, paid: false });
      throw new Error("unexpected request");
    };
    const access = await resolveReportAccess("bazi");
    assert.equal(access.level, "quick");
    assert.equal(access.pending, true);
  } finally { browser.restore(); }
});

test("BaZi checkout preserves report ID and passes only opaque reference to Stripe", async () => {
  const browser = browserFixture({ product: "system", system: "bazi" });
  try {
    const id = "11111111-1111-4111-8111-111111111111";
    recordPurchaseConsent();
    await startReportCheckout("system", "bazi", id);
    const checkoutUrl = new URL(browser.redirected());
    assert.equal(checkoutUrl.origin, "https://buy.stripe.com");
    assert.equal(checkoutUrl.searchParams.get("client_reference_id"), "12345678-1234-4234-8234-123456789abc");
    assert.equal(browser.data.get("zhaowu.pending-bazi-report.v1"), id);
    assert.equal(browser.data.get("zhaowu.pending-bazi-return.v1"), "bazi");
    assert.ok(browser.redirected().includes("9B600ja510QNgoH5582sM0C"));
  } finally { clearPurchaseConsent(); browser.restore(); }
});

for (const mode of ["throws", "silent"]) {
  for (const system of ["bazi", "ziwei"]) {
    test(`checkout blocks ${system} when storage ${mode}`, async () => {
      const browser = browserFixture({ product: "system", system });
      try {
        recordPurchaseConsent();
        globalThis.localStorage.setItem = mode === "throws" ? () => { throw new Error("storage blocked"); } : () => {};
        await assert.rejects(startReportCheckout("system", system, "11111111-1111-4111-8111-111111111111"), /CHECKOUT_STORAGE_UNAVAILABLE/);
        assert.equal(browser.redirected(), "");
      } finally { clearPurchaseConsent(); browser.restore(); }
    });
  }
}

test("checkout blocks when the report reference cannot be saved after the storage probe", async () => {
  const browser = browserFixture({ product: "system", system: "bazi" });
  try {
    recordPurchaseConsent();
    const set = globalThis.localStorage.setItem;
    globalThis.localStorage.setItem = (key, value) => {
      if (key === "zhaowu.pending-bazi-report.v1") throw new Error("quota");
      set(key, value);
    };
    await assert.rejects(startReportCheckout("system", "bazi", "11111111-1111-4111-8111-111111111111"), /CHECKOUT_STORAGE_UNAVAILABLE/);
    assert.equal(browser.redirected(), "");
  } finally { clearPurchaseConsent(); browser.restore(); }
});

test("USD prices and webhook entitlement agree with new Stripe link", () => {
  assert.match(client, /system: FIXED_REPORT_PRICES\.standard\.usd/);
  assert.match(webhook, /plink_1URIwkFAzopdCCax8ZVKkNPH: \{ product: "system", system: "bazi", amount: 1999 \}/);
  assert.match(webhook, /plink_1UPlUXFAzopdCCaxV59sdJfq: \{ product: "system", system: "bazi", amount: 990 \}/);
  assert.match(resultView, /resolveReportAccess\("bazi"\)/);
  assert.match(resultView, /startReportCheckout\(product, "bazi", result\.id\)/);
  assert.match(shell, /pending-bazi-report\.v1/);
  assert.match(shell, /url\.hash = "bazi"/);
  assert.doesNotMatch(resultView, /Zi Wei Full Reading|紫微斗數完整深批/);
});

test("free preview never calls the paid report writer or saves paid output", () => {
  const makeReport = resultView.slice(resultView.indexOf("async function ensureFullReport()"), resultView.indexOf("async function ensureSavedReport()"));
  assert.ok(makeReport.indexOf('accessLevel !== "system"') >= 0);
  assert.ok(makeReport.indexOf("return renderFocusedReportText") < makeReport.indexOf("await writeFullReport"));
  const preview = resultView.slice(resultView.indexOf("async function onFull()"), resultView.indexOf("async function onSave()"));
  assert.ok(preview.indexOf('accessLevel !== "system"') < preview.indexOf("await ensureFullReport"));
  assert.match(resultView, /View free 3-part summary/);
});

test("database entitlement constraint accepts the BaZi system id the webhook writes", async () => {
  const sql = await load("supabase/migrations/20261011120000_allow_bazi_entitlement_system.sql");
  assert.match(sql, /system_id in \('bazi', 'ziwei', 'qizheng', 'western', 'indian', 'palm', 'numerology'\)/);
  assert.doesNotMatch(sql, /delete\s+from|truncate|drop\s+table/i);
});
