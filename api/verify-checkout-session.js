import { jsonResponse } from "../lib/mingshu-client.js";

// A Stripe Checkout session id looks like cs_test_... or cs_live_...
const CHECKOUT_SESSION_ID_PATTERN = /^cs_(test|live)_[A-Za-z0-9]+$/;
const EXPECTED_AMOUNT_TOTAL = 999; // $9.99 USD
const EXPECTED_CURRENCY = "usd";

export default async function handler(req, res) {
  try {
    if ((req.method || "GET") !== "POST") {
      return jsonResponse(res, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED", message: "POST method required." } });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return jsonResponse(res, 500, {
        ok: false,
        error: { code: "CONFIG_ERROR", message: "STRIPE_SECRET_KEY is not configured on the server." }
      });
    }

    let body = {};
    if (typeof req.body === "string") {
      try { body = JSON.parse(req.body); } catch { body = {}; }
    } else if (req.body && typeof req.body === "object") {
      body = req.body;
    }

    const sessionId = String(body.sessionId || "").trim();
    const chartHash = String(body.chartHash || "").trim();

    if (!sessionId || !CHECKOUT_SESSION_ID_PATTERN.test(sessionId)) {
      return jsonResponse(res, 400, {
        ok: false,
        error: { code: "INVALID_SESSION_ID", message: "A valid Stripe Checkout session id is required." }
      });
    }
    if (!chartHash) {
      return jsonResponse(res, 400, {
        ok: false,
        error: { code: "MISSING_CHART_HASH", message: "chartHash is required to verify the session." }
      });
    }

    // Server-to-server lookup: never trust the success page alone.
    const stripeRes = await fetch(
      "https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(sessionId),
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + secretKey
        }
      }
    );

    const session = await stripeRes.json();
    if (!stripeRes.ok) {
      const code = session.error?.code || "STRIPE_API_ERROR";
      const status = code === "resource_missing" ? 404 : (stripeRes.status || 500);
      return jsonResponse(res, status, {
        ok: false,
        error: {
          code,
          message: code === "resource_missing"
            ? "Checkout session not found."
            : (session.error?.message || "Failed to retrieve Stripe Checkout session.")
        }
      });
    }

    // 1) Payment must actually be settled.
    if (session.payment_status !== "paid") {
      return jsonResponse(res, 200, {
        ok: true,
        verified: false,
        reason: "NOT_PAID",
        payment_status: session.payment_status || null
      });
    }

    // 2) Amount and currency must match the fixed $9.99 USD product.
    if (session.amount_total !== EXPECTED_AMOUNT_TOTAL) {
      return jsonResponse(res, 200, {
        ok: true,
        verified: false,
        reason: "AMOUNT_MISMATCH",
        amount_total: session.amount_total ?? null
      });
    }
    if (String(session.currency || "").toLowerCase() !== EXPECTED_CURRENCY) {
      return jsonResponse(res, 200, {
        ok: true,
        verified: false,
        reason: "CURRENCY_MISMATCH",
        currency: session.currency || null
      });
    }

    // 3) The session must belong to the chart the user is viewing.
    const sessionChartHash = String(session.metadata?.chart_hash || "").trim();
    if (!sessionChartHash || sessionChartHash !== chartHash) {
      return jsonResponse(res, 200, {
        ok: true,
        verified: false,
        reason: "CHART_HASH_MISMATCH"
      });
    }

    return jsonResponse(res, 200, {
      ok: true,
      verified: true,
      service: session.metadata?.service || null,
      payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null
    });
  } catch (error) {
    return jsonResponse(res, 500, {
      ok: false,
      error: { code: "INTERNAL_ERROR", message: error instanceof Error ? error.message : "Unknown error" }
    });
  }
}
