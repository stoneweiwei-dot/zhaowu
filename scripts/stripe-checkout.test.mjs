import test from "node:test";
import assert from "node:assert/strict";
import { handle } from "../supabase/functions/stripe-checkout/index.ts";

const post = (b) => new Request("https://x.test/f", { method: "POST", body: JSON.stringify(b ?? {}) });
const get = (id) => new Request(`https://x.test/f?session_id=${id}`, { method: "GET" });
const ok = (b) => async () => ({ ok: true, json: async () => b });

test("inert without a secret key; rejects other methods", async () => {
  assert.equal((await handle(post(), {})).status, 503);
  assert.equal((await handle(new Request("https://x.test/f", { method: "DELETE" }), { key: "k" })).status, 405);
});

test("POST creates a one-time US$9.99 session and returns the hosted URL", async () => {
  let seen;
  const f = async (u, o) => { seen = { u, o }; return { ok: true, json: async () => ({ url: "https://checkout.stripe.com/c/pay/cs_test_abc", id: "cs_test_abc" }) }; };
  const r = await handle(post({ reportId: "abc-123" }), { key: "sk_test_x" }, f);
  assert.equal(r.status, 200);
  assert.ok((await r.json()).url.startsWith("https://checkout.stripe.com/"));
  const p = new URLSearchParams(seen.o.body);
  assert.equal(p.get("line_items[0][price_data][unit_amount]"), "999");
  assert.equal(p.get("line_items[0][price_data][currency]"), "usd");
  assert.equal(p.get("mode"), "payment");
  assert.equal(p.get("client_reference_id"), "abc-123");
  assert.match(p.get("success_url"), /^https:\/\/stone-zhaowu-official\.vercel\.app\/account/);
  assert.equal(seen.o.headers.Authorization, "Bearer sk_test_x");
});

test("GET reports paid only for a fully paid 999 USD session", async () => {
  assert.equal((await handle(get("nope"), { key: "k" })).status, 400);
  const id = "cs_live_a1B2c3D4e5F6";
  let r = await handle(get(id), { key: "k" }, ok({ payment_status: "paid", amount_total: 999, currency: "usd", client_reference_id: "abc" }));
  assert.equal((await r.json()).paid, true);
  r = await handle(get(id), { key: "k" }, ok({ payment_status: "unpaid", amount_total: 999, currency: "usd" }));
  assert.equal((await r.json()).paid, false);
  r = await handle(get(id), { key: "k" }, ok({ payment_status: "paid", amount_total: 100, currency: "usd" }));
  assert.equal((await r.json()).paid, false);
});
