import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const client = await readFile(new URL("../src/lib/report-access.ts", import.meta.url), "utf8");
const checkout = await readFile(new URL("../supabase/functions/stripe-checkout/index.ts", import.meta.url), "utf8");
const webhook = await readFile(new URL("../supabase/functions/stripe-webhook/index.ts", import.meta.url), "utf8");
const migration = await readFile(new URL("../supabase/migrations/20261003170000_report_purchase_entitlements.sql", import.meta.url), "utf8");
const repriceMigration = await readFile(new URL("../supabase/migrations/20261013025000_reprice_report_entitlements.sql", import.meta.url), "utf8");

// 2026-10-10: quick is now a free new-user welcome gift (client-side
// display only — see REPORT_ACCESS_PRODUCTS in report-access.ts). The
// server-side webhook accepts new US$9.90/US$19.99 Payment Links and
// preserves legacy links only for already-open or completed checkout recovery.

test("the public paid catalogue shows quick as free and new live prices", () => {
  assert.match(client, /quick: \{ amountCents: 0, price: "\$0" \}/);
  assert.match(client, /system: \{ amountCents: 990, price: "US\$9\.90" \}/);
  assert.match(client, /bundle: \{ amountCents: 1999, price: "US\$19\.99" \}/);
});

test("the webhook accepts new prices and preserves legacy checkout recovery", () => {
  assert.match(webhook, /product: "system".*amount: 990/);
  assert.match(webhook, /product: "bundle".*amount: 1999/);
  assert.match(webhook, /product: "quick".*amount: 199/);
});

test("BaZi and all six specialist systems use the new live Stripe Payment Links", () => {
  for (const system of ["bazi", "ziwei", "qizheng", "western", "indian", "palm", "numerology"]) {
    assert.match(client, new RegExp(`${system}: \\{`));
  }
  assert.equal((client.match(/https:\/\/buy\.stripe\.com\//g) || []).length, 13);
  assert.match(client, /url\.searchParams\.set\("client_reference_id", accessKey\)/);
  assert.doesNotMatch(client, /method:\s*"POST"/);
  assert.doesNotMatch(client, /STRIPE_(?:SECRET|RESTRICTED)_KEY/);
});

test("the browser can only query server-side entitlements; it cannot create payment sessions", () => {
  assert.match(checkout, /req\.method !== "GET"/);
  assert.match(checkout, /PAYMENT_LINKS_ONLY/);
  assert.match(checkout, /report_purchase_entitlements/);
  assert.match(checkout, /\.eq\("checkout_session_id", sessionId\)/);
  assert.doesNotMatch(checkout, /\.eq\("access_key", accessKey\)/);
  assert.doesNotMatch(client, /searchParams\.set\("access_key"/);
  assert.doesNotMatch(checkout, /npm:stripe|STRIPE_(?:SECRET|RESTRICTED)_KEY|checkout\.sessions\.create/);
});

test("the webhook authenticates with a one-way token hash and trusts only known live Payment Links", () => {
  assert.match(webhook, /WEBHOOK_TOKEN_SHA256 = "[a-f0-9]{64}"/);
  assert.match(webhook, /sha256Hex\(token\)/);
  assert.match(webhook, /INVALID_WEBHOOK_TOKEN/);
  assert.match(webhook, /event\.livemode !== true/);
  assert.match(webhook, /PAYMENT_LINKS\[linkId\]/);
  assert.equal((webhook.match(/plink_/g) || []).length, 32);
  assert.doesNotMatch(webhook, /whsec_|STRIPE_WEBHOOK_SECRET|STRIPE_SECRET_KEY/);
});

test("only paid Stripe events grant paid access and stale failure cannot downgrade it", () => {
  assert.match(webhook, /checkout\.session\.completed/);
  assert.match(webhook, /checkout\.session\.async_payment_succeeded/);
  assert.match(webhook, /checkout\.session\.async_payment_failed/);
  assert.match(webhook, /session\.payment_status === "paid"/);
  assert.match(webhook, /existing\?\.status === "paid" && nextStatus !== "paid"/);
  assert.match(webhook, /product_id: definition\.product/);
  assert.match(webhook, /amount_cents: definition\.amount/);
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
});
