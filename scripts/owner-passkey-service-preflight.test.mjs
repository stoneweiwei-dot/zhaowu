import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runPasskeyAction } from "../lib/owner-passkey-actions.js";

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
  assert.match(result.cookies[0], /HttpOnly; Secure; SameSite=Strict/);
});

test("public passkey sign-in does not leak bridge response details", async () => {
  const fetchImpl = async () => new Response(JSON.stringify({ ok: false, error: "BRIDGE_UNAUTHORIZED" }), { status: 401 });
  const result = await runPasskeyAction("passkey.login.verify", { response: { id: "a-valid-looking-credential-id" } }, { req, owner: null, env, fetchImpl });
  assert.equal(result.status, 400);
  assert.equal(result.body.error, "PASSKEY_FAILED");
});

test("device UI never encourages creating an unpersisted passkey while the list is down", () => {
  const source = readFileSync(new URL("../src/components/owner-devices-manager.tsx", import.meta.url), "utf8");
  assert.match(source, /if \(deviceLoadFailed\)/);
  assert.match(source, /\) : deviceLoadFailed \? \(/);
  assert.match(source, /case "OWNER_EDGE_HTTP_404"/);
  assert.match(source, /case "BRIDGE_UNAUTHORIZED"/);
});
