import test from "node:test";
import assert from "node:assert/strict";
import checkout from "../api/stripe-checkout.js";
import status from "../api/stripe-status.js";

function res() { const r = { h: {}, setHeader(k, v) { r.h[k] = v; }, status(c) { r.code = c; return r; }, json(b) { r.body = b; return r; } }; return r; }

test("checkout refuses non-POST and is inert without a secret key", async () => {
  delete process.env.STRIPE_SECRET_KEY;
  let r = res(); await checkout({ method: "GET" }, r); assert.equal(r.code, 405);
  r = res(); await checkout({ method: "POST", body: {} }, r); assert.equal(r.code, 503);
});

test("checkout posts a US$9.99 one-time session and returns the hosted URL", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_x";
  const orig = globalThis.fetch; let seen;
  globalThis.fetch = async (u, o) => { seen = { u, o }; return { ok: true, json: async () => ({ url: "https://checkout.stripe.com/c/pay/cs_test_abc", id: "cs_test_abc" }) }; };
  try {
    const r = res(); await checkout({ method: "POST", body: { reportId: "abc-123" } }, r);
    assert.equal(r.code, 200); assert.equal(r.body.url.startsWith("https://checkout.stripe.com/"), true);
    const f = new URLSearchParams(seen.o.body);
    assert.equal(f.get("line_items[0][price_data][unit_amount]"), "999");
    assert.equal(f.get("line_items[0][price_data][currency]"), "usd");
    assert.equal(f.get("mode"), "payment");
    assert.match(f.get("success_url"), /^https:\/\/stone-zhaowu-official\.vercel\.app\/account/);
    assert.equal(seen.o.headers.Authorization, "Bearer sk_test_x");
  } finally { globalThis.fetch = orig; delete process.env.STRIPE_SECRET_KEY; }
});

test("status only reports paid for a fully paid 999 USD session and rejects bad ids", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_x";
  const orig = globalThis.fetch;
  try {
    let r = res(); await status({ method: "GET", query: { session_id: "nope" } }, r); assert.equal(r.code, 400);
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ payment_status: "paid", amount_total: 999, currency: "usd", client_reference_id: "abc" }) });
    r = res(); await status({ method: "GET", query: { session_id: "cs_live_a1B2c3D4e5F6" } }, r); assert.equal(r.body.paid, true);
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ payment_status: "unpaid", amount_total: 999, currency: "usd" }) });
    r = res(); await status({ method: "GET", query: { session_id: "cs_live_a1B2c3D4e5F6" } }, r); assert.equal(r.body.paid, false);
  } finally { globalThis.fetch = orig; delete process.env.STRIPE_SECRET_KEY; }
});
