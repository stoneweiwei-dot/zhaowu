import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runPasskeyAction } from "../lib/owner-passkey-actions.js";
import { OWNER_PRODUCTION_SUPABASE_URL } from "../lib/owner-supabase-origin.js";

const req = { headers: { host: "zhao-wu.com", origin: "https://zhao-wu.com" } };
const owner = { kind: "secret", secret: "test-secret-that-is-not-a-real-owner-password" };
const env = { ZHAOWU_OWNER_BRIDGE_SECRET: "unit-test-bridge-not-a-real-secret-0123456789" };

test("registration stops before issuing a WebAuthn challenge when the device backend rejects owner authentication", async () => {
  const fetchImpl = async () => new Response(JSON.stringify({ ok: false, error: "OWNER_UNAUTHORIZED" }), { status: 401 });
  const result = await runPasskeyAction("passkey.register.options", {}, { req, owner, env, fetchImpl });
  assert.equal(result.status, 502);
  assert.equal(result.body.error, "OWNER_UNAUTHORIZED");
  assert.deepEqual(result.cookies, [], "must not issue an orphan-producing WebAuthn challenge");
});

test("registration stops before WebAuthn when the bridge is unavailable", async () => {
  const fetchImpl = async () => new Response(JSON.stringify({ ok: false, error: "BRIDGE_UNAUTHORIZED" }), { status: 401 });
  const result = await runPasskeyAction("passkey.register.options", {}, { req, owner, env, fetchImpl });
  assert.equal(result.status, 502);
  assert.equal(result.body.error, "BRIDGE_UNAUTHORIZED");
  assert.equal(result.cookies.length, 0);
});

test("healthy backend issues normal registration options and the protected challenge cookie", async () => {
  let calls = 0;
  const fetchImpl = async (_url, init) => {
    calls++;
    const input = JSON.parse(init.body);
    assert.equal(input.action, "owner.device.list");
    return new Response(JSON.stringify({ ok: true, items: [] }), { status: 200 });
  };
  const result = await runPasskeyAction("passkey.register.options", {}, { req, owner, env, fetchImpl });
  assert.equal(calls, 1);
  assert.equal(result.status, 200);
  assert.equal(result.body.ok, true);
  assert.equal(typeof result.body.options?.challenge, "string");
  assert.equal(result.cookies.length, 1);
  // The WebAuthn challenge cookie stays Strict: it is only ever written and read by same-origin fetches.
  assert.match(result.cookies[0], /HttpOnly; Secure; SameSite=Strict/);
});

test("public passkey sign-in does not leak bridge response details", async () => {
  const fetchImpl = async () => new Response(JSON.stringify({ ok: false, error: "BRIDGE_UNAUTHORIZED" }), { status: 401 });
  const result = await runPasskeyAction("passkey.login.verify", { response: { id: "a-valid-looking-credential-id" } }, { req, owner: null, env, fetchImpl });
  assert.equal(result.status, 400);
  assert.equal(result.body.error, "PASSKEY_FAILED");
});

test("production Face ID ignores an injected Supabase URL from the old project", async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    const action = JSON.parse(init.body).action;
    calls.push({ url: String(url), action });
    if (action === "owner.device.credential") return new Response(JSON.stringify({ ok: true, device: null }), { status: 200 });
    if (action === "owner.device.list") return new Response(JSON.stringify({ ok: true, items: [] }), { status: 200 });
    return new Response(JSON.stringify({ ok: false, error: "ACTION_NOT_ALLOWED" }), { status: 400 });
  };
  const prod = {
    ...env,
    VERCEL_ENV: "production",
    SUPABASE_URL: "https://plgpxusmemnmzckbwtiv.supabase.co",
    VITE_SUPABASE_URL: "https://plgpxusmemnmzckbwtiv.supabase.co",
  };
  const options = await runPasskeyAction("passkey.login.options", {}, { req, env: prod, fetchImpl });
  assert.equal(options.status, 200);
  assert.equal(calls.length, 0, "issuing a challenge must not touch Supabase");
  const cookie = options.cookies[0].split(";")[0];
  const verified = await runPasskeyAction("passkey.login.verify", {
    response: { id: "unknown-credential-id-value" },
  }, { req: { headers: { ...req.headers, cookie } }, env: prod, fetchImpl });
  assert.equal(verified.status, 400);
  assert.equal(verified.body.error, "PASSKEY_DEVICE_UNKNOWN");
  assert.deepEqual(verified.cookies, [], "an unknown credential must not receive a session");
  const registered = await runPasskeyAction("passkey.register.options", {}, { req, owner, env: prod, fetchImpl });
  assert.equal(registered.status, 200);
  assert.ok(registered.cookies[0].includes("SameSite=Strict"));
  assert.deepEqual(calls.map((call) => call.url), [
    `${OWNER_PRODUCTION_SUPABASE_URL}/functions/v1/zhaowu-owner-data`,
    `${OWNER_PRODUCTION_SUPABASE_URL}/functions/v1/zhaowu-owner-data`,
  ]);
  assert.deepEqual(calls.map((call) => call.action), ["owner.device.credential", "owner.device.list"]);
});

test("an expired Face ID challenge and a missing device function do not create a session", async () => {
  const options = await runPasskeyAction("passkey.login.options", {}, { req, env, fetchImpl: async () => { throw new Error("unused"); } });
  const cookie = options.cookies[0].split(";")[0];
  const expired = await runPasskeyAction("passkey.login.verify", {
    response: { id: "unknown-credential-id-value" },
  }, {
    req: { headers: { ...req.headers, cookie } },
    env,
    fetchImpl: async () => new Response(JSON.stringify({ ok: true, device: null }), { status: 200 }),
    cookieOptions: { now: Date.now() + 10 * 60 * 1000 },
  });
  assert.equal(expired.status, 400);
  assert.equal(expired.body.error, "PASSKEY_CHALLENGE_MISSING");
  assert.deepEqual(expired.cookies, []);

  const missing = await runPasskeyAction("passkey.login.verify", {
    response: { id: "unknown-credential-id-value" },
  }, {
    req: { headers: { ...req.headers, cookie } },
    env,
    fetchImpl: async () => new Response("missing", { status: 404 }),
  });
  assert.equal(missing.status, 400);
  assert.equal(missing.body.error, "PASSKEY_FAILED");
  assert.deepEqual(missing.cookies, []);
});

test("device UI never encourages creating an unpersisted passkey while the list is down", () => {
  const source = readFileSync(new URL("../src/components/owner-devices-manager.tsx", import.meta.url), "utf8");
  assert.match(source, /if \(deviceLoadFailed\)/);
  assert.match(source, /\) : deviceLoadFailed \? \(/);
  assert.match(source, /case "OWNER_EDGE_HTTP_404"/);
  assert.match(source, /case "BRIDGE_UNAUTHORIZED"/);
});
