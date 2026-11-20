import assert from "node:assert/strict";
import test from "node:test";
import { publishSiteSkinFallback } from "../api/owner-data.js";

const env = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "test-only-not-a-real-token",
};

test("site skin fallback rejects missing server credential without external calls", async () => {
  let called = false;
  const result = await publishSiteSkinFallback("butterfly-lotus", {}, async () => {
    called = true;
    throw new Error("should not send request");
  });
  assert.equal(result.status, 503);
  assert.equal(result.body.error, "SITE_SKIN_SERVICE_NOT_CONFIGURED");
  assert.equal(called, false);
});

test("site skin fallback writes only the whitelisted theme row and confirms readback", async () => {
  let request;
  const result = await publishSiteSkinFallback("butterfly-lotus", env, async (url, init) => {
    request = { url, ...init };
    return new Response(JSON.stringify([{ value: { skin: "butterfly-lotus" } }]), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.ok, true);
  assert.equal(result.body.skin, "butterfly-lotus");
  assert.equal(request.method, "POST");
  assert.match(request.url, /^https:\/\/example\.supabase\.co\/rest\/v1\/site_settings\?on_conflict=key/);
  const payload = JSON.parse(request.body);
  assert.equal(payload.key, "published_site_skin_v1");
  assert.equal(payload.value.skin, "butterfly-lotus");
  assert.equal(payload.public_read, true);
});

test("site skin fallback refuses false success from REST service", async () => {
  const fail = await publishSiteSkinFallback("butterfly-lotus", env, async () => new Response("{}", { status: 404 }));
  assert.equal(fail.status, 503);
  assert.equal(fail.body.error, "SHARED_SKIN_WRITE_FAILED");
  const mismatched = await publishSiteSkinFallback("butterfly-lotus", env, async () =>
    new Response(JSON.stringify([{ value: { skin: "another-theme" } }]), { status: 200 })
  );
  assert.equal(mismatched.status, 503);
  assert.equal(mismatched.body.error, "SHARED_SKIN_VERIFY_FAILED");
});
