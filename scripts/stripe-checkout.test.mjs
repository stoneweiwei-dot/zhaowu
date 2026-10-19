import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const client = await readFile(new URL("../src/lib/report-access.ts", import.meta.url), "utf8");
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
  assert.match(client, /usd: \{ amountCents: 2690, price: "US\$26\.90" \}/);
  assert.match(client, /aud: \{ amountCents: 1490, price: "A\$14\.90" \}/);
  assert.match(client, /cny: \{ amountCents: 16800, price: "¥168" \}/);
});

test("the webhook accepts exact fixed local amounts and preserves legacy checkout recovery", () => {
  assert.match(webhook, /amounts: \{ usd: 990, aud: 1490, cny: 6800 \}/);
  assert.match(webhook, /amounts: \{ usd: 1690, aud: 2490, cny: 10800 \}/);
  assert.match(webhook, /amounts: \{ usd: 2690, aud: 3990, cny: 16800 \}/);
  assert.match(webhook, /plink_1URIwkFAzopdCCax8ZVKkNPH: \{ product: "system", system: "bazi", amount: 1999 \}/);
  assert.match(webhook, /plink_1UP3ohFAzopdCCaxFknNaARY: \{ product: "bundle", system: "ziwei", amount: 1999 \}/);
  assert.match(webhook, /definition\.amounts\?\.\[currency\]/);
  assert.match(webhook, /allowedAmounts\.includes\(amount\)/);
  assert.match(webhook, /amount_cents: amount/);
  assert.match(webhook, /currency,/);
  assert.match(webhook, /product: "quick".*amount: 199/);
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
    assert.match(client, new RegExp(`${system}: \\{`));
  }
  assert.equal((client.match(/https:\/\/buy\.stripe\.com\//g) || []).length, 13);
  assert.match(client, /9B600ja510QNgoH5582sM0C/);
  assert.match(client, /9B69AT0urbvr6O77dg2sM0B/);
  assert.match(client, /9B6bJ16SP42Z8WfdBE2sM0I/);
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
  assert.doesNotMatch(checkout, /\.eq\("access_key", accessKey\)/);
  assert.doesNotMatch(startCheckoutFn, /searchParams\.set\("access_key"/);
  assert.doesNotMatch(checkout, /npm:stripe|STRIPE_(?:SECRET|RESTRICTED)_KEY|checkout\.sessions\.create/);
});

test("the webhook authenticates with a one-way token hash and trusts only known live Payment Links", () => {
  assert.match(webhook, /WEBHOOK_TOKEN_SHA256 = "[a-f0-9]{64}"/);
  assert.match(webhook, /sha256Hex\(token\)/);
  assert.match(webhook, /INVALID_WEBHOOK_TOKEN/);
  assert.match(webhook, /event\.livemode !== true/);
  assert.match(webhook, /PAYMENT_LINKS\[linkId\]/);
  assert.equal((webhook.match(/plink_/g) || []).length, 42);
  assert.doesNotMatch(webhook, /whsec_|STRIPE_WEBHOOK_SECRET|STRIPE_SECRET_KEY/);
});

test("only paid Stripe events grant paid access and stale failure cannot downgrade it", () => {
  assert.match(webhook, /checkout\.session\.completed/);
  assert.match(webhook, /checkout\.session\.async_payment_succeeded/);
  assert.match(webhook, /checkout\.session\.async_payment_failed/);
  assert.match(webhook, /session\.payment_status === "paid"/);
  assert.match(webhook, /existing\?\.status === "paid" && nextStatus !== "paid"/);
  assert.match(webhook, /product_id: definition\.product/);
  assert.match(webhook, /amount_cents: amount/);
  assert.match(webhook, /currency,/);
  assert.match(webhook, /system_id: definition\.product === "bundle" \? null : definition\.system/);
});

test("entitlements remain server-only, constrained and protected by RLS", () => {
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /product_id in \('quick', 'system', 'bundle'\)/i);
  assert.match(migration, /amount_cents in \(199, 499, 999\)/i);
  assert.match(migration, /revoke all on table public\.report_purchase_entitlements from public, anon, authenticated/i);
  assert.match(migration, /checkout_session_id text not null unique/i);
  assert.match(repriceMigration, /amount_cents in \(199, 499, 990, 999, 1999\)/i);
  assert.match(repriceMigration, /product_id = 'system' and amount_cents in \(499, 990\)/i);
  assert.match(repriceMigration, /product_id = 'bundle' and amount_cents in \(999, 1999\)/i);
  // 2026-10-16: BaZi / Zi Wei single-system readings are USD 19.99; the constraint must accept it additively.
  assert.match(system1999Migration, /product_id = 'system' and amount_cents in \(499, 990, 1999\)/i);
  assert.match(system1999Migration, /product_id = 'bundle' and amount_cents in \(999, 1999\)/i);
  assert.doesNotMatch(system1999Migration, /delete\s+from|truncate|drop\s+table/i);
  assert.match(localizedMigration, /currency in \('usd', 'aud', 'cny'\)/i);
  assert.match(localizedMigration, /currency = 'aud' and amount_cents in \(1490, 2490\)/i);
  assert.match(localizedMigration, /currency = 'cny' and amount_cents in \(6800, 10800\)/i);
  assert.match(localizedMigration, /currency = 'aud' and amount_cents = 3990/i);
  assert.match(localizedMigration, /currency = 'cny' and amount_cents = 16800/i);
  assert.doesNotMatch(localizedMigration, /delete\s+from|truncate|drop\s+table/i);
});
