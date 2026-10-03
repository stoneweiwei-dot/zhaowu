import { jsonResponse } from "../lib/mingshu-client.js";

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

    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "zhaowu.soul-terminal.com";
    const origin = (body.origin || ).replace(/\/+$/, "");

    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("payment_method_types[0]", "card");
    params.append("line_items[0][price_data][currency]", "usd");
    params.append("line_items[0][price_data][unit_amount]", "999");
    params.append("line_items[0][price_data][product_data][name]", "昭梧命理 · 深度推演与大师解惑");
    params.append("line_items[0][price_data][product_data][description]", "子平八字深度命局推演、大运流年转运分析与现实避坑指南");
    params.append("success_url", );
    params.append("cancel_url", );
    params.append("metadata[service]", "zhaowu_deep_analysis");
    if (body.chartHash) {
      params.append("metadata[chart_hash]", String(body.chartHash).slice(0, 100));
    }

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: ,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok) {
      return jsonResponse(res, stripeRes.status || 500, {
        ok: false,
        error: {
          code: session.error?.code || "STRIPE_API_ERROR",
          message: session.error?.message || "Failed to create Stripe Checkout session."
        }
      });
    }

    return jsonResponse(res, 200, {
      ok: true,
      id: session.id,
      url: session.url
    });
  } catch (error) {
    return jsonResponse(res, 500, {
      ok: false,
      error: { code: "INTERNAL_ERROR", message: error instanceof Error ? error.message : "Unknown error" }
    });
  }
}
