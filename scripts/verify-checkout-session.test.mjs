import assert from "node:assert/strict";
import test from "node:test";
import handler from "../api/verify-checkout-session.js";

process.env.STRIPE_SECRET_KEY = "sk_test_mock_for_ci_test";

function createMockRes() {
  return {
    statusCode: null,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, val) {
      this.headers[name] = val;
    },
    json(data) {
      this.body = data;
      return this;
    },
    end(data) {
      if (data && !this.body) {
        try { this.body = JSON.parse(data); } catch { this.body = data; }
      }
      return this;
    }
  };
}

test("verify-checkout-session: 405 for non-POST", async () => {
  const req = { method: "GET" };
  const res = createMockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.body.ok, false);
  assert.equal(res.body.error.code, "METHOD_NOT_ALLOWED");
});

test("verify-checkout-session: 400 for invalid session id", async () => {
  const req = {
    method: "POST",
    body: { sessionId: "not_a_stripe_session_id", chartHash: "hash_abc" }
  };
  const res = createMockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error.code, "INVALID_SESSION_ID");
});

test("verify-checkout-session: 400 for missing chartHash", async () => {
  const req = {
    method: "POST",
    body: { sessionId: "cs_test_1234567890abcdef", chartHash: "" }
  };
  const res = createMockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error.code, "MISSING_CHART_HASH");
});

test("verify-checkout-session: handles Stripe session not found (404)", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 404,
    json: async () => ({
      error: { code: "resource_missing", message: "No such checkout.session" }
    })
  });
  try {
    const req = {
      method: "POST",
      body: { sessionId: "cs_test_missing_session", chartHash: "hash_abc" }
    };
    const res = createMockRes();
    await handler(req, res);
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.ok, false);
    assert.equal(res.body.error.code, "resource_missing");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verify-checkout-session: handles Stripe upstream API error (500)", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 500,
    json: async () => ({
      error: { code: "api_error", message: "Stripe internal error" }
    })
  });
  try {
    const req = {
      method: "POST",
      body: { sessionId: "cs_test_stripe_error", chartHash: "hash_abc" }
    };
    const res = createMockRes();
    await handler(req, res);
    assert.equal(res.statusCode, 500);
    assert.equal(res.body.ok, false);
    assert.equal(res.body.error.code, "api_error");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verify-checkout-session: unpaids session returns verified: false (NOT_PAID)", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      id: "cs_test_not_paid",
      payment_status: "unpaid",
      amount_total: 999,
      currency: "usd",
      metadata: { chart_hash: "hash_123" }
    })
  });
  try {
    const req = {
      method: "POST",
      body: { sessionId: "cs_test_not_paid", chartHash: "hash_123" }
    };
    const res = createMockRes();
    await handler(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.verified, false);
    assert.equal(res.body.reason, "NOT_PAID");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verify-checkout-session: amount mismatch returns verified: false (AMOUNT_MISMATCH)", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      id: "cs_test_wrong_amount",
      payment_status: "paid",
      amount_total: 100, // Should be 999
      currency: "usd",
      metadata: { chart_hash: "hash_123" }
    })
  });
  try {
    const req = {
      method: "POST",
      body: { sessionId: "cs_test_wrong_amount", chartHash: "hash_123" }
    };
    const res = createMockRes();
    await handler(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.verified, false);
    assert.equal(res.body.reason, "AMOUNT_MISMATCH");
    assert.equal(res.body.amount_total, 100);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verify-checkout-session: currency mismatch returns verified: false (CURRENCY_MISMATCH)", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      id: "cs_test_wrong_curr",
      payment_status: "paid",
      amount_total: 999,
      currency: "eur", // Should be usd
      metadata: { chart_hash: "hash_123" }
    })
  });
  try {
    const req = {
      method: "POST",
      body: { sessionId: "cs_test_wrong_curr", chartHash: "hash_123" }
    };
    const res = createMockRes();
    await handler(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.verified, false);
    assert.equal(res.body.reason, "CURRENCY_MISMATCH");
    assert.equal(res.body.currency, "eur");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verify-checkout-session: chart_hash mismatch returns verified: false (CHART_HASH_MISMATCH)", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      id: "cs_test_chart_mismatch",
      payment_status: "paid",
      amount_total: 999,
      currency: "usd",
      metadata: { chart_hash: "chart_A" }
    })
  });
  try {
    const req = {
      method: "POST",
      body: { sessionId: "cs_test_chart_mismatch", chartHash: "chart_B" }
    };
    const res = createMockRes();
    await handler(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.verified, false);
    assert.equal(res.body.reason, "CHART_HASH_MISMATCH");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verify-checkout-session: successfully verifies matching paid session", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    assert.match(url, /cs_live_exact_match_12345/);
    assert.equal(opts.headers.Authorization, "Bearer sk_test_mock_for_ci_test");
    return {
      ok: true,
      json: async () => ({
        id: "cs_live_exact_match_12345",
        payment_status: "paid",
        amount_total: 999,
        currency: "usd",
        payment_intent: "pi_3MtwLwLkdIwHu7ix28a3tqPa",
        metadata: {
          chart_hash: "target_bazi_hash_888",
          service: "zhaowu_deep_analysis"
        }
      })
    };
  };
  try {
    const req = {
      method: "POST",
      body: { sessionId: "cs_live_exact_match_12345", chartHash: "target_bazi_hash_888" }
    };
    const res = createMockRes();
    await handler(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.verified, true);
    assert.equal(res.body.payment_intent, "pi_3MtwLwLkdIwHu7ix28a3tqPa");
    assert.equal(res.body.service, "zhaowu_deep_analysis");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
