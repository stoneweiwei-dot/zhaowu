import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const checkout = await readFile(new URL("../supabase/functions/stripe-checkout/index.ts", import.meta.url), "utf8");
const webhook = await readFile(new URL("../supabase/functions/stripe-webhook/index.ts", import.meta.url), "utf8");
const migration = await readFile(new URL("../supabase/migrations/20261003170000_report_purchase_entitlements.sql", import.meta.url), "utf8");
const client = await readFile(new URL("../src/lib/report-access.ts", import.meta.url), "utf8");

test("checkout exposes only the fixed USD 1.99, 4.99 and 9.99 catalogue", () => {
  assert.match(checkout, /quick:\s*\{ amount: 199/);
  assert.match(checkout, /system:\s*\{ amount: 499/);
  assert.match(checkout, /bundle:\s*\{ amount: 999/);
  assert.match(checkout, /currency:\s*"usd"/);
  assert.match(checkout, /integration_identifier:\s*"zhaowu_report_access_v1"/);
  assert.doesNotMatch(checkout, /payment_method_types/);
});

test("checkout uses a pinned Stripe client and fails closed without server secrets", () => {
  assert.match(checkout, /npm:stripe@22\.6\.0/);
  assert.match(checkout, /2026-08-26\.dahlia/);
  assert.match(checkout, /STRIPE_RESTRICTED_KEY/);
  assert.match(checkout, /PAYMENT_NOT_CONFIGURED/);
  assert.match(checkout, /PAYMENT_STORE_NOT_CONFIGURED/);
  assert.match(checkout, /report_purchase_entitlements/);
  assert.doesNotMatch(client, /STRIPE_(?:SECRET|RESTRICTED)_KEY/);
});

test("checkout creates a server-side pending entitlement before returning a payable URL", () => {
  assert.match(checkout, /checkout_session_id:\s*session\.id/);
  assert.match(checkout, /stripe_event_id:\s*`checkout:init:\$\{session\.id\}`/);
  assert.match(checkout, /status:\s*"pending"/);
  assert.match(checkout, /ENTITLEMENT_INIT_FAILED/);
  assert.match(checkout, /checkout\.sessions\.expire\(session\.id\)/);
});

test("success return verifies the Checkout Session directly with Stripe before unlocking", () => {
  assert.match(checkout, /stripe\.checkout\.sessions\.retrieve\(sessionId\)/);
  assert.match(checkout, /sessionMatchesEntitlement\(session, data\)/);
  assert.match(checkout, /session\.payment_status === "paid"/);
  assert.match(checkout, /status:\s*nextStatus/);
  assert.match(checkout, /stripe_event_id:\s*`checkout:verify:\$\{session\.id\}`/);
  assert.doesNotMatch(client, /paid\s*=\s*true/);
});

test("webhook remains a signed asynchronous fallback, not the only unlock path", () => {
  assert.match(webhook, /constructEventAsync\(await req\.text\(\), signature, webhookSecret\)/);
  assert.match(webhook, /checkout\.session\.completed/);
  assert.match(webhook, /checkout\.session\.async_payment_succeeded/);
  assert.match(webhook, /checkout\.session\.async_payment_failed/);
  assert.match(webhook, /report_purchase_entitlements/);
});

test("entitlements are server-only, constrained and protected by RLS", () => {
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /product_id in \('quick', 'system', 'bundle'\)/i);
  assert.match(migration, /amount_cents in \(199, 499, 999\)/i);
  assert.match(migration, /product_id = 'quick' and amount_cents = 199/i);
  assert.match(migration, /revoke all on table public\.report_purchase_entitlements from public, anon, authenticated/i);
  assert.match(migration, /checkout_session_id text not null unique/i);
});
