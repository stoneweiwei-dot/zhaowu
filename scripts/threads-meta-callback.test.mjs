import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { handleThreadsMetaCallback, verifyThreadsSignedRequest } from "../lib/threads-meta-callback.js";

const secret = "threads-test-secret-not-production";
const env = { THREADS_APP_SECRET: secret, SUPABASE_SERVICE_ROLE_KEY: "fake-test-service-key", SUPABASE_URL: "https://example.supabase.co", PUBLIC_SITE_ORIGIN: "https://zhao-wu.com" };
function signed(userId = "123456789", at = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ algorithm: "HMAC-SHA256", user_id: userId, issued_at: Math.floor(at / 1000) })).toString("base64url");
  return createHmac("sha256", secret).update(payload).digest("base64url") + "." + payload;
}
function request(action, input, method = "POST") {
  return { method, url: "/api/owner-session?action=threads." + action, body: { signed_request: input } };
}

test("reject forged or stale signed_request before any deletion", async () => {
  assert.equal(verifyThreadsSignedRequest(signed(), secret)?.userId, "123456789");
  assert.equal(verifyThreadsSignedRequest(signed(), "wrong-key"), null);
  assert.equal(verifyThreadsSignedRequest(signed("123456789", Date.now() - 8 * 86400000), secret), null);
  let calls = 0;
  const res = await handleThreadsMetaCallback(request("data-deletion", signed().slice(1)), null, env, async () => { calls++; throw Error("must not call"); });
  assert.equal(res.status, 403);
  assert.equal(calls, 0);
});

test("deauthorize deletes only a signed matching Threads account", async () => {
  const calls = [];
  const response = await handleThreadsMetaCallback(request("deauthorize", signed()), null, env, async (url, init) => {
    calls.push({ url, method: init.method, body: init.body });
    return new Response(null, { status: 204 });
  });
  assert.equal(response.status, 200);
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /threads_user_id=eq.123456789/);
  assert.equal(calls[0].method, "DELETE");
});

test("data deletion records completed status only after success and provides status URL", async () => {
  const calls = [];
  const response = await handleThreadsMetaCallback(request("data-deletion", signed()), null, env, async (url, init) => {
    calls.push({ url, method: init.method });
    return new Response(null, { status: 204 });
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.match(body.url, /^https:\/\/zhao-wu.com\/api\/owner-session\?action=threads\.deletion-status&code=[a-f0-9]{48}$/);
  assert.match(body.confirmation_code, /^[a-f0-9]{48}$/);
  assert.equal(calls[0].method, "DELETE");
  assert.equal(calls[1].method, "POST");
});

test("upstream delete failures never emit false completed status", async () => {
  const response = await handleThreadsMetaCallback(request("data-deletion", signed()), null, env, async () => new Response(null, { status: 503 }));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, "DELETION_UNAVAILABLE");
});

test("GET health check cannot erase any account", async () => {
  const response = await handleThreadsMetaCallback({ method: "GET", url: "/api/owner-session?action=threads.deauthorize" }, null, env, async () => { throw Error("should not call"); });
  assert.equal(response.status, 200);
});
