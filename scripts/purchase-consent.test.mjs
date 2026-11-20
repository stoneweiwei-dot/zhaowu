import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { startReportCheckout } from "../src/lib/report-access.ts";
import {
  PURCHASE_CONSENT_VERSION,
  clearPurchaseConsent,
  hasPurchaseConsent,
  recordPurchaseConsent,
} from "../src/lib/purchase-consent.ts";

const load = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

function browserFixture() {
  const data = new Map([["zhaowu.report-access-key.v1", "12345678-1234-4234-8234-123456789abc"]]);
  let redirect = "";
  const old = { window: globalThis.window, localStorage: globalThis.localStorage };
  globalThis.localStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => { data.set(key, value); },
    removeItem: (key) => { data.delete(key); },
  };
  globalThis.window = { location: { search: "", assign(url) { redirect = url; } } };
  return {
    data,
    redirected: () => redirect,
    restore() {
      for (const key of ["window", "localStorage"]) {
        if (old[key] === undefined) delete globalThis[key];
        else globalThis[key] = old[key];
      }
    },
  };
}

test("checkout is refused until the buyer has consented to the current Terms/Privacy version", async () => {
  const browser = browserFixture();
  try {
    clearPurchaseConsent();
    assert.equal(hasPurchaseConsent(), false);
    await assert.rejects(startReportCheckout("system", "ziwei"), /CONSENT_REQUIRED/);
    assert.equal(browser.redirected(), "", "no redirect to Stripe without consent");

    recordPurchaseConsent();
    assert.equal(hasPurchaseConsent(), true);
    const stored = JSON.parse(browser.data.get("zhaowu.purchase-consent.v1"));
    assert.equal(stored.version, PURCHASE_CONSENT_VERSION);
    assert.match(stored.at, /^\d{4}-\d{2}-\d{2}T/);
    await startReportCheckout("system", "ziwei");
    assert.equal(new URL(browser.redirected()).origin, "https://buy.stripe.com");

    clearPurchaseConsent();
    assert.equal(hasPurchaseConsent(), false, "unticking withdraws consent");
  } finally { clearPurchaseConsent(); browser.restore(); }
});

test("consent given for an older document version does not carry over", () => {
  const browser = browserFixture();
  try {
    clearPurchaseConsent();
    browser.data.set("zhaowu.purchase-consent.v1", JSON.stringify({ version: "2000-01-01", at: "2000-01-01T00:00:00Z" }));
    assert.equal(hasPurchaseConsent(), false);
  } finally { clearPurchaseConsent(); browser.restore(); }
});

test("both purchase entry points render the consent box and check it before checkout", async () => {
  const [gate, resultView] = await Promise.all([
    load("src/components/report-access-gate.tsx"),
    load("src/components/result-view.tsx"),
  ]);
  for (const [name, source, fn] of [["ReportAccessGate", gate, "async function purchase("], ["ResultView", resultView, "async function handleUnlock("]]) {
    assert.match(source, /<PurchaseConsent /, `${name} renders the consent checkbox`);
    const body = source.slice(source.indexOf(fn));
    assert.ok(body.indexOf("consent.require()") >= 0 && body.indexOf("consent.require()") < body.indexOf("startReportCheckout("), `${name} requires consent before startReportCheckout`);
  }
  const component = await load("src/components/purchase-consent.tsx");
  assert.match(component, /href="\/terms"/);
  assert.match(component, /href="\/privacy"/);
  for (const lang of ["zh-Hant", "zh-Hans", "en"]) assert.match(component, new RegExp(`"?${lang}"?: \\{`));
});
