import { jsonResponse } from "../lib/mingshu-client.js";

// Server-side check that a Checkout Session was really paid. Never trust the client redirect alone.
export default async function handler(req, res) {
  if ((req.method || "GET") !== "GET") return jsonResponse(res, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return jsonResponse(res, 503, { ok: false, error: { code: "PAYMENT_NOT_CONFIGURED" } });
  const url = new URL(req.url || "/", "https://x.invalid");
  const id = String(req.query?.session_id ?? url.searchParams.get("session_id") ?? "");
  if (!/^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(id)) return jsonResponse(res, 400, { ok: false, error: { code: "BAD_SESSION" } });
  try {
    const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${id}`, { headers: { Authorization: `Bearer ${key}` } });
    const s = await r.json();
    if (!r.ok) return jsonResponse(res, 502, { ok: false, error: { code: "STRIPE_ERROR" } });
    const paid = s.payment_status === "paid" && s.amount_total === 999 && s.currency === "usd";
    return jsonResponse(res, 200, { ok: true, paid, reportId: s.client_reference_id ?? null });
  } catch {
    return jsonResponse(res, 502, { ok: false, error: { code: "STRIPE_UNREACHABLE" } });
  }
}
