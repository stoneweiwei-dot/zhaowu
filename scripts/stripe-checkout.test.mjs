import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, rm } from "node:fs/promises";
import { tsImport } from "tsx/esm/api";

const checkoutTestUrl = new URL("./.stripe-checkout-runtime.test.ts", import.meta.url);
let checkoutSource = await readFile(new URL("../supabase/functions/stripe-checkout/index.ts", import.meta.url), "utf8");
checkoutSource = checkoutSource.replace(/^import .*;\n/, "").replace("if (D?.serve) D.serve((req: Request) => handle(req));", "");
checkoutSource = checkoutSource.replace(/const admin = adminClient\(env\);/, "const admin = adminOverride ?? adminClient(env);");
await writeFile(checkoutTestUrl, checkoutSource);
const { handle } = await tsImport(checkoutTestUrl.href, import.meta.url);
await rm(checkoutTestUrl);
let stripeFetchCount = 0;
let activeStripeMock;
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => {
  stripeFetchCount += 1;
  if (activeStripeMock === "throw") throw new Error("mock network failure");
  if (activeStripeMock === "non-ok") return Response.json({ error: "mock failure" }, { status: 503 });
  return Response.json(activeStripeMock || {});
};
test.after(() => { globalThis.fetch = originalFetch; });

function mockAdmin(status) {
  return {
    from(table) {
      assert.equal(table, "report_purchase_entitlements");
      return {
        select() { return this; },
        eq() { return this; },
        async maybeSingle() { return { data: { product_id: "system", system_id: "bazi", status }, error: null }; },
      };
    },
  };
}

async function verifyEntitlement(status, stripeSecretKey, stripeMock) {
  stripeFetchCount = 0;
  activeStripeMock = stripeMock;
  const req = new Request("https://zhao-wu.com/functions/v1/stripe-checkout?session_id=cs_test_mockpaid1234567890");
  const response = await handle(req, {
    supabaseUrl: "https://mock.supabase.co",
    supabaseSecretKey: "service_role_mock_only",
    stripeSecretKey,
  }, mockAdmin(status));
  return { status: response.status, body: await response.json(), count: stripeFetchCount };
}

const client = await readFile(new URL("../src/lib/report-access.ts", import.meta.url), "utf8");
const resultUi = await readFile(new URL("../src/components/result-view.tsx", import.meta.url), "utf8");
const checkout = await readFile(new URL("../supabase/functions/stripe-checkout/index.ts", import.meta.url), "utf8");
const webhook = await readFile(new URL("../supabase/functions/stripe-webhook/index.ts", import.meta.url), "utf8");
const migration = await readFile(new URL("../supabase/migrations/20261003170000_report_purchase_entitlements.sql", import.meta.url), "utf8");
const repriceMigration = await readFile(new URL("../supabase/migrations/20261013025000_reprice_report_entitlements.sql", import.meta.url), "utf8");
const system1999Migration = await readFile(new URL("../supabase/migrations/20261016200000_allow_system_1999_entitlement.sql", import.meta.url), "utf8");
const localizedMigration = await readFile(new URL("../supabase/migrations/20261019080000_fixed_local_report_pricing.sql", import.meta.url), "utf8");

// 2026-10-19: quick is free. Public paid links use manually fixed
// USD/AUD/CNY prices and preserve legacy USD links for checkout recovery.

test("the public paid catalogue shows the new fixed prices", () => {
  assert.match(client, /quick: \{ amountCents: 0, price: "\$0" \}/);
  assert.match(client, /usd: \{ amountCents: 990, price: "US\$9\.90" \}/);
  assert.match(client, /usd: \{ amountCents: 1690, price: "US\$16\.90" \}/);
  assert.match(client, /aud: \{ amountCents: 1490, price: "A\$14\.90" \}/);
});

test("the webhook accepts exact fixed local amounts and preserves legacy checkout recovery", () => {
  assert.match(webhook, /amounts: \{ usd: 990, aud: 1490, cny: 6800 \}/);
  assert.match(webhook, /amounts: \{ usd: 1690, aud: 2490, cny: 10800 \}/);
  assert.match(webhook, /plink_1URIwkFAzopdCCax8ZVKkNPH: \{ product: "system", system: "bazi", amount: 1999 \}/);
  assert.match(webhook, /definition\.amounts\?\.\[currency\]/);
  assert.match(webhook, /allowedAmounts\.includes\(amount\)/);
  assert.match(webhook, /amount_cents: amount/);
  assert.match(webhook, /currency,/);
});

// 2026-10-15: report-access.ts also carries startReportCheckout (the one and only function
// allowed to build a Stripe URL/redirect) and, separately, a same-origin promo-code redemption
// path (verifyPromo/redeemPromoCode) that POSTs to this project's own promo-code Edge Function,
// never to Stripe. The two assertions below are scoped to startReportCheckout's own body so a
// legitimate, unrelated POST or "access_key" query param elsewhere in the file (the promo path)
// cannot be confused with a browser-side Stripe session creation, which remains forbidden.
const startCheckoutFn = client.match(/export async function startReportCheckout[\s\S]*?\n}\n/)?.[0] ?? "";

test("BaZi and all six specialist systems use the new live Stripe Payment Links", () => {
  assert.ok(startCheckoutFn, "startReportCheckout function body not found in report-access.ts");
  for (const system of ["bazi", "ziwei", "qizheng", "western", "indian", "palm", "numerology"]) {
    assert.match(client, new RegExp(`${system}:`));
  }
  assert.equal((client.match(/https:\/\/buy\.stripe\.com\//g) || []).length, 7);
  assert.match(client, /9B600ja510QNgoH5582sM0C/);
  assert.match(client, /9B69AT0urbvr6O77dg2sM0B/);
  assert.match(client, /dRm00jgtpgPL1tN2X02sM0w/);
  assert.match(startCheckoutFn, /url\.searchParams\.set\("client_reference_id", accessKey\)/);
  assert.doesNotMatch(startCheckoutFn, /method:\s*"POST"/);
  assert.doesNotMatch(client, /STRIPE_(?:SECRET|RESTRICTED)_KEY/);
});

test("the browser can only query server-side entitlements; it cannot create payment sessions", () => {
  assert.ok(startCheckoutFn, "startReportCheckout function body not found in report-access.ts");
  assert.match(checkout, /req\.method !== "GET"/);
  assert.match(checkout, /PAYMENT_LINKS_ONLY/);
  assert.match(checkout, /report_purchase_entitlements/);
  assert.match(checkout, /\.eq\("checkout_session_id", sessionId\)/);
  assert.match(checkout, /\.eq\("access_key", accessKey\)/);
  assert.doesNotMatch(startCheckoutFn, /searchParams\.set\("access_key"/);
  assert.doesNotMatch(startCheckoutFn, /npm:stripe|STRIPE_(?:SECRET|RESTRICTED)_KEY|checkout\.sessions\.create/);
  assert.doesNotMatch(checkout, /checkout\.sessions\.create/);
});

test("latest access-key entitlement lookup returns only safe entitlement fields", async () => {
  const admin = {
    from(table) {
      assert.equal(table, "report_purchase_entitlements");
      return {
        select(fields) { assert.equal(fields, "product_id,system_id,status,created_at,updated_at"); return this; },
        eq(column, value) { assert.equal(column, "access_key"); assert.equal(value, "12345678-1234-4234-8234-123456789abc"); return this; },
        order() { return this; }, limit() { return this; },
        async then(resolve) { resolve({ data: [{ product_id: "system", system_id: "bazi", status: "refunded" }], error: null }); },
      };
    },
  };
  const response = await handle(new Request("https://zhao-wu.com/functions/v1/stripe-checkout?access_key=12345678-1234-4234-8234-123456789abc"), { supabaseUrl: "https://mock.supabase.co", supabaseSecretKey: "service_role_mock_only" }, admin);
  const body = await response.json();
  assert.equal(body.revoked, true);
  assert.equal(JSON.stringify(body).includes("access_key"), false);
  assert.equal(JSON.stringify(body).includes("session_id"), false);
});

test("paid entitlement checks revalidate Stripe refunds and disputes before returning access", () => {
  assert.match(checkout, /STRIPE_SECRET_KEY/);
  assert.match(checkout, /api\.stripe\.com\/v1\/checkout\/sessions/);
  assert.match(checkout, /charge\?\.refunded/);
  assert.match(checkout, /amount_refunded \?\? 0\) > 0/);
  assert.match(checkout, /charge\?\.disputed/);
  assert.match(checkout, /revoked: true/);
  assert.match(checkout, /data\.status === "refunded"/);
  assert.match(checkout, /paid: data\.status === "paid"/);
  assert.match(client, /if \(verification\.revoked\) revoked = true/);
  assert.match(client, /return \{ level, pending: revoked \? false : pending, owner: false, revoked \}/);
  assert.doesNotMatch(client, /storedSessions\(\)\.filter\(\(sessionId\).*revoked/);
  assert.match(resultUi, /此訂單已退款/);
});

test("paid webhook entitlement unlocks without a Stripe key and skips Stripe", async () => {
  const result = await verifyEntitlement("paid", undefined);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true, paid: true, pending: false, product: "system", system: "bazi" });
  assert.equal(result.count, 0);
});

test("refunded webhook entitlement is revoked without a Stripe key", async () => {
  const result = await verifyEntitlement("refunded", "");
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true, paid: false, revoked: true, reason: "refunded" });
  assert.equal(result.count, 0);
});

test("paid webhook entitlement unlocks if the live Stripe lookup is non-OK or throws", async (t) => {
  for (const [name, stripeFetch] of [
    ["returns non-OK", "non-ok"],
    ["throws", "throw"],
  ]) {
    await t.test(name, async () => {
      const result = await verifyEntitlement("paid", "sk_test_mock_only", stripeFetch);
      assert.equal(result.status, 200);
      assert.deepEqual(result.body, { ok: true, paid: true, pending: false, product: "system", system: "bazi" });
      assert.equal(result.count, 1);
    });
  }
});

test("successful live Stripe lookup still revokes refunded and disputed charges", async (t) => {
  for (const [reason, charge] of [
    ["refunded", { refunded: true }],
    ["refunded", { amount_refunded: 1 }],
    ["disputed", { disputed: true }],
  ]) {
    await t.test(reason, async () => {
      const result = await verifyEntitlement("paid", "sk_test_mock_only", {
        payment_status: "paid", payment_intent: { latest_charge: charge },
      });
      assert.equal(result.status, 200);
      assert.equal(result.body.paid, false);
      assert.equal(result.body.revoked, true);
      assert.equal(result.body.reason, reason);
    });
  }
});

test("success UI state is persisted before checkout query cleanup", async () => {
  const shell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
  assert.ok(shell.indexOf('sessionStorage.setItem("zhaowu.checkout-success-visible.v1"') < shell.indexOf('url.searchParams.delete("checkout")'));
  const result = await readFile(new URL("../src/components/result-view.tsx", import.meta.url), "utf8");
  assert.match(result, /data-checkout-success/);
  assert.match(result, /完整權限已確認／完整報告已經開放／本次為單次解鎖，不是訂閱/);
});

test("the webhook authenticates with a one-way token hash and trusts only known live Payment Links", () => {
  assert.match(webhook, /WEBHOOK_TOKEN_SHA256 = "[a-f0-9]{64}"/);
  assert.match(webhook, /sha256Hex\(token\)/);
  assert.match(webhook, /INVALID_WEBHOOK_TOKEN/);
  assert.match(webhook, /event\.livemode !== true/);
  assert.match(webhook, /PAYMENT_LINKS\[linkId\]/);
  assert.ok((webhook.match(/plink_/g) || []).length >= 7);
  assert.doesNotMatch(webhook, /whsec_|STRIPE_WEBHOOK_SECRET|STRIPE_SECRET_KEY/);
});

test("only paid Stripe events grant paid access and stale failure cannot downgrade it", () => {
  assert.match(webhook, /checkout\.session\.completed/);
  assert.match(webhook, /checkout\.session\.async_payment_succeeded/);
  assert.match(webhook, /checkout\.session\.async_payment_failed/);
  assert.match(webhook, /charge\.refunded/);
  assert.match(webhook, /session\.payment_status === "paid"/);
  assert.match(webhook, /existing\?\.status === "paid" && nextStatus !== "paid"/);
  assert.match(webhook, /product_id: definition\.product/);
  assert.match(webhook, /amount_cents: amount/);
  assert.match(webhook, /currency,/);
});

test("entitlements remain server-only, constrained and protected by RLS", () => {
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /amount_cents in \(199, 499, 999\)/i);
  assert.match(migration, /revoke all on table public\.report_purchase_entitlements from public, anon, authenticated/i);
  assert.match(migration, /checkout_session_id text not null unique/i);
  assert.match(repriceMigration, /amount_cents in \(199, 499, 990, 999, 1999\)/i);
  assert.match(repriceMigration, /product_id = 'system' and amount_cents in \(499, 990\)/i);
  // 2026-10-16: BaZi / Zi Wei single-system readings are USD 19.99; the constraint must accept it additively.
  assert.match(system1999Migration, /product_id = 'system' and amount_cents in \(499, 990, 1999\)/i);
  assert.doesNotMatch(system1999Migration, /delete\s+from|truncate|drop\s+table/i);
  assert.match(localizedMigration, /currency in \('usd', 'aud', 'cny'\)/i);
  assert.match(localizedMigration, /currency = 'aud' and amount_cents in \(1490, 2490\)/i);
  assert.match(localizedMigration, /currency = 'cny' and amount_cents in \(6800, 10800\)/i);
  assert.doesNotMatch(localizedMigration, /delete\s+from|truncate|drop\s+table/i);
});
