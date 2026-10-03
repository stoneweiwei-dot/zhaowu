import { jsonResponse } from "../lib/mingshu-client.js";

// One-time US$9.99 Checkout. Secret key lives only in Vercel env STRIPE_SECRET_KEY.
// Uses the Stripe REST API directly (no SDK dependency, no new runtime SaaS beyond Stripe).
const ORIGIN = "https://stone-zhaowu-official.vercel.app";
const AMOUNT_CENTS = 999;
const CURRENCY = "usd";
const PRODUCT_NAME = "昭梧命理 · 深度推演與大師解惑";

async function body(req) {
  if (typeof req?.json === "function") { try { return await req.json(); } catch { return {}; } }
  if (req?.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  try { return JSON.parse(String(req?.body ?? "{}")); } catch { return {}; }
}

export default async function handler(req, res) {
  if ((req.method || "GET") !== "POST") return jsonResponse(res, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return jsonResponse(res, 503, { ok: false, error: { code: "PAYMENT_NOT_CONFIGURED" } });
  const input = await body(req);
  const reportId = String(input?.reportId ?? "").slice(0, 80).replace(/[^\w-]/g, "");
  const form = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": CURRENCY,
    "line_items[0][price_data][unit_amount]": String(AMOUNT_CENTS),
    "line_items[0][price_data][product_data][name]": PRODUCT_NAME,
    success_url: `${ORIGIN}/account?paid=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${ORIGIN}/account?paid=0`,
  });
  if (reportId) { form.set("client_reference_id", reportId); form.set("metadata[report_id]", reportId); }
  try {
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const data = await r.json();
    if (!r.ok || !data?.url) return jsonResponse(res, 502, { ok: false, error: { code: "STRIPE_ERROR" } });
    return jsonResponse(res, 200, { ok: true, url: data.url, id: data.id });
  } catch {
    return jsonResponse(res, 502, { ok: false, error: { code: "STRIPE_UNREACHABLE" } });
  }
}
