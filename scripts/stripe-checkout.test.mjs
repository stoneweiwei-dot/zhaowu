import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const client = await readFile(new URL("../src/lib/report-access.ts", import.meta.url), "utf8");
const checkout = await readFile(new URL("../supabase/functions/stripe-checkout/index.ts", import.meta.url), "utf8");
const webhook = await readFile(new URL("../supabase/functions/stripe-webhook/index.ts", import.meta.url), "utf8");
const migration = await readFile(new URL("../supabase/migrations/20261003170000_report_purchase_entitlements.sql", import.meta.url), "utf8");

test("the public paid catalogue stays fixed at USD 1.99, 4.99 and 9.99", () => {
  assert.match(client, /quick: \{ amountCents: 199, price: "\$1\.99" \}/);
  assert.match(client, /system: \{ amountCents: 499, price: "\$4\.99" \}/);
  assert.match(client, /bundle: \{ amountCents: 999, price: "\$9\.99" \}/);
});

test("all six systems use live Stripe Payment Links and preserve the browser access key", () => {
  for (const system of ["ziwei", "qizheng", "western", "indian", "palm", "numerology"]) {
    assert.match(client, new RegExp(`${system}: \\{`));
  }
  assert.equal((client.match(/https:\/\/buy\.stripe\.com\//g) || []).length, 18);
  assert.match(client, /url\.searchParams\.set\("client_reference_id", accessKey\)/);
  assert.doesNotMatch(client, /method:\s*"POST"/);
  assert.doesNotMatch(client, /STRIPE_(?:SECRET|RESTRICTED)_KEY/);
});

test("the browser can only query server-side entitlements; it cannot create payment sessions", () => {
  assert.match(checkout, /req\.method !== "GET"/);
  assert.match(checkout, /PAYMENT_LINKS_ONLY/);
  assert.match(checkout, /report_purchase_entitlements/);
  assert.match(checkout, /\.eq\("checkout_session_id", sessionId\)/);
  assert.match(checkout, /\.eq\("access_key", accessKey\)/);
  assert.doesNotMatch(checkout, /npm:stripe|STRIPE_(?:SECRET|RESTRICTED)_KEY|checkout\.sessions\.create/);
});

test("the webhook authenticates with a one-way token hash and trusts only known live Payment Links", () => {
  assert.match(webhook, /WEBHOOK_TOKEN_SHA256 = "[a-f0-9]{64}"/);
  assert.match(webhook, /sha256Hex\(token\)/);
  assert.match(webhook, /INVALID_WEBHOOK_TOKEN/);
  assert.match(webhook, /event\.livemode !== true/);
  assert.match(webhook, /PAYMENT_LINKS\[linkId\]/);
  assert.equal((webhook.match(/plink_1UN/g) || []).length, 18);
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
});
