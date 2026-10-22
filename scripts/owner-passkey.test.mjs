import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import test from "node:test";
import { b64, createAuthenticator } from "./helpers/virtual-authenticator.mjs";
import { authenticateOwner, clearOwnerDeviceCache, ownerAuthHeaders } from "../lib/owner-auth.js";
import {
  passkeyAuthenticationOptions,
  passkeyRegistrationOptions,
  rpFromRequest,
  verifyPasskeyAuthentication,
  verifyPasskeyRegistration,
} from "../lib/owner-passkey.js";
import {
  OWNER_COOKIE,
  ownerAuthFromCookieValue,
  ownerDeviceCookieValue,
  ownerDeviceSetCookie,
  openPayload,
  sealPayload,
} from "../lib/owner-session-cookie.js";

const env = { ZHAOWU_OWNER_BRIDGE_SECRET: "bridge-secret-for-tests-0123456789" };
const HOST = "zhaowu.test";
const ORIGIN = `https://${HOST}`;

function requestWithCookie(setCookie, extra = {}) {
  const pair = setCookie ? setCookie.split(";")[0] : "";
  return { headers: { host: HOST, ...(pair ? { cookie: pair } : {}), ...extra } };
}
const plainRequest = () => ({ headers: { host: HOST } });
const toDeviceRow = (registered, overrides = {}) => ({
  credential_id: registered.credentialId,
  public_key: registered.publicKey,
  sign_count: registered.signCount,
  transports: registered.transports,
  revoked_at: null,
  ...overrides,
});

test("rp id and origin come from the request host", () => {
  assert.deepEqual(rpFromRequest({ headers: { host: "zhaowu.soul-terminal.com" } }), { rpID: "zhaowu.soul-terminal.com", origin: "https://zhaowu.soul-terminal.com" });
  assert.deepEqual(rpFromRequest({ headers: { "x-forwarded-host": "a.example, b.example", host: "internal" } }), { rpID: "a.example", origin: "https://a.example" });
  assert.equal(rpFromRequest({ headers: {} }), null);
});

test("register a device, then sign in with it and the counter advances", async () => {
  const phone = createAuthenticator();
  const registrationRequest = plainRequest();
  const { options, cookie } = await passkeyRegistrationOptions(registrationRequest, { env });
  assert.equal(options.rp.id, HOST);
  assert.equal(options.authenticatorSelection.userVerification, "required");
  assert.equal(options.authenticatorSelection.residentKey, "required");

  const registered = await verifyPasskeyRegistration(requestWithCookie(cookie), phone.register(options), { env });
  assert.equal(registered.credentialId, phone.credentialId);
  assert.ok(registered.publicKey.length > 40);

  const login = await passkeyAuthenticationOptions(plainRequest(), { env });
  assert.equal(login.options.userVerification, "required");
  const result = await verifyPasskeyAuthentication(requestWithCookie(login.cookie), phone.authenticate(login.options), toDeviceRow(registered), { env });
  assert.equal(result.newCounter, 1);

  const second = await passkeyAuthenticationOptions(plainRequest(), { env });
  const next = await verifyPasskeyAuthentication(requestWithCookie(second.cookie), phone.authenticate(second.options), toDeviceRow(registered, { sign_count: 1 }), { env });
  assert.equal(next.newCounter, 2);
});

async function registeredPhone() {
  const phone = createAuthenticator();
  const { options, cookie } = await passkeyRegistrationOptions(plainRequest(), { env });
  const registered = await verifyPasskeyRegistration(requestWithCookie(cookie), phone.register(options), { env });
  return { phone, registered };
}

test("registration rejects a wrong origin, a missing user-verification flag and a missing challenge", async () => {
  const phone = createAuthenticator();
  const { options, cookie } = await passkeyRegistrationOptions(plainRequest(), { env });
  await assert.rejects(verifyPasskeyRegistration(requestWithCookie(cookie), phone.register(options, { origin: "https://evil.test" }), { env }));
  await assert.rejects(verifyPasskeyRegistration(requestWithCookie(cookie), phone.register(options, { flags: 0x41 }), { env })); // UV bit off
  await assert.rejects(verifyPasskeyRegistration(plainRequest(), phone.register(options), { env }), /PASSKEY_CHALLENGE_MISSING/);
});

test("sign-in rejects a wrong origin, no user verification, a wrong challenge and a replayed counter", async () => {
  const { phone, registered } = await registeredPhone();
  const device = toDeviceRow(registered);
  const attempt = async (assertion, row = device, cookieFrom) => {
    const login = await passkeyAuthenticationOptions(plainRequest(), { env });
    return verifyPasskeyAuthentication(requestWithCookie(cookieFrom ?? login.cookie), assertion(login.options), row, { env });
  };
  await assert.rejects(attempt((o) => phone.authenticate(o, { origin: "https://evil.test" })));
  await assert.rejects(attempt((o) => phone.authenticate(o, { flags: 0x01 })));
  await assert.rejects(attempt((o) => phone.authenticate(o, { challenge: b64(randomBytes(32)) })));
  // A stored counter ahead of the authenticator means a cloned or replayed credential.
  await assert.rejects(attempt((o) => phone.authenticate(o), toDeviceRow(registered, { sign_count: 50 })));
});

test("a revoked or unknown device never authenticates", async () => {
  const { phone, registered } = await registeredPhone();
  const login = await passkeyAuthenticationOptions(plainRequest(), { env });
  const assertion = phone.authenticate(login.options);
  await assert.rejects(verifyPasskeyAuthentication(requestWithCookie(login.cookie), assertion, toDeviceRow(registered, { revoked_at: "2026-10-22T00:00:00Z" }), { env }), /PASSKEY_DEVICE_UNKNOWN/);
  await assert.rejects(verifyPasskeyAuthentication(requestWithCookie(login.cookie), assertion, null, { env }), /PASSKEY_DEVICE_UNKNOWN/);
});

test("a challenge sealed for registration cannot be used for sign-in, and expires", async () => {
  const phone = createAuthenticator();
  const { options, cookie } = await passkeyRegistrationOptions(plainRequest(), { env });
  const registered = await verifyPasskeyRegistration(requestWithCookie(cookie), phone.register(options), { env });
  const login = await passkeyAuthenticationOptions(plainRequest(), { env });
  // Swap in the registration challenge cookie while presenting a sign-in assertion.
  await assert.rejects(verifyPasskeyAuthentication(requestWithCookie(cookie), phone.authenticate(login.options), toDeviceRow(registered), { env }), /PASSKEY_CHALLENGE_MISSING/);
  // Expired.
  await assert.rejects(verifyPasskeyAuthentication(requestWithCookie(login.cookie), phone.authenticate(login.options), toDeviceRow(registered), { env, now: Date.now() + 10 * 60 * 1000 }), /PASSKEY_CHALLENGE_MISSING/);
});

test("passkey ceremonies fail closed without a server key", async () => {
  await assert.rejects(passkeyRegistrationOptions(plainRequest(), { env: {} }), /PASSKEY_NOT_CONFIGURED/);
  await assert.rejects(passkeyAuthenticationOptions(plainRequest(), { env: {} }), /PASSKEY_NOT_CONFIGURED/);
});

test("sealed payloads are purpose-bound and tamper-proof", () => {
  const sealed = sealPayload("a", { c: "x" }, { env });
  assert.equal(openPayload("a", sealed, { env }).c, "x");
  assert.equal(openPayload("b", sealed, { env }), null);
  assert.equal(openPayload("a", sealed.slice(0, -3) + "AAA", { env }), null);
  assert.equal(openPayload("a", sealed, { env: { ZHAOWU_OWNER_BRIDGE_SECRET: "different-secret-0123456789abcdef" } }), null);
  assert.equal(openPayload("a", sealed, { env, now: Date.now() + 301_000 }), null);
});

const DEVICE_ID = "3f2b8c1e-5d4a-4e7b-9c10-a1b2c3d4e5f6";

test("a device session cookie carries the device id and no owner secret", () => {
  const value = ownerDeviceCookieValue(DEVICE_ID, { env });
  assert.ok(value.startsWith("d1."));
  assert.deepEqual(ownerAuthFromCookieValue(value, { env }), { kind: "device", deviceId: DEVICE_ID });
  assert.equal(ownerAuthFromCookieValue(value.slice(0, -3) + "AAA", { env }), null);
  assert.equal(ownerAuthFromCookieValue(value, { env, now: Date.now() + 91 * 86400 * 1000 }), null);
  assert.equal(ownerDeviceCookieValue("not-a-uuid", { env }), "");
  assert.equal(ownerDeviceCookieValue(DEVICE_ID, { env: {} }), "");
  assert.match(ownerDeviceSetCookie(DEVICE_ID, { env }), new RegExp(`^${OWNER_COOKIE}=.*; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=7776000$`));
  assert.equal(ownerDeviceSetCookie(DEVICE_ID, { env: {} }), "");
});

test("a device cookie is not an owner secret for legacy secret-only code paths", async () => {
  const { ownerSecretFromCookieValue } = await import("../lib/owner-session-cookie.js");
  assert.equal(ownerSecretFromCookieValue(ownerDeviceCookieValue(DEVICE_ID, { env }), { env, isValid: () => true }), "");
});

test("authenticateOwner trusts a device only while the edge function says it is active", async () => {
  clearOwnerDeviceCache();
  const cookie = `${OWNER_COOKIE}=${encodeURIComponent(ownerDeviceCookieValue(DEVICE_ID, { env }))}`;
  const request = { headers: { cookie } };
  const calls = [];
  const edge = (active) => async (url, init) => {
    calls.push({ url, headers: init.headers, body: JSON.parse(init.body) });
    return new Response(JSON.stringify({ ok: true, active }), { status: 200 });
  };

  const trusted = await authenticateOwner(request, { env, fetchImpl: edge(true) });
  assert.deepEqual(trusted, { kind: "device", deviceId: DEVICE_ID });
  assert.equal(calls[0].body.action, "owner.device.check");
  assert.equal(calls[0].headers["X-Zhaowu-Bridge-Secret"], env.ZHAOWU_OWNER_BRIDGE_SECRET);
  assert.equal(calls[0].headers["X-Zhaowu-Owner-Secret"], undefined);

  await authenticateOwner(request, { env, fetchImpl: edge(true) });
  assert.equal(calls.length, 1, "second call inside the cache window must not hit the edge function");

  clearOwnerDeviceCache();
  assert.equal(await authenticateOwner(request, { env, fetchImpl: edge(false) }), null, "revoked device");

  clearOwnerDeviceCache();
  assert.equal(await authenticateOwner(request, { env, fetchImpl: async () => { throw new Error("network"); } }), null, "fail closed when revocation cannot be checked");

  clearOwnerDeviceCache();
  assert.equal(await authenticateOwner(request, { env, fetchImpl: async () => new Response("nope", { status: 500 }) }), null);
});

test("secret sessions need no edge lookup and forward the password; device sessions forward the device id", async () => {
  const secret = "correct-horse-battery-staple";
  const { ownerCookieValue } = await import("../lib/owner-session-cookie.js");
  const request = { headers: { cookie: `${OWNER_COOKIE}=${encodeURIComponent(ownerCookieValue(secret, { env }))}` } };
  const auth = await authenticateOwner(request, { env, fetchImpl: async () => { throw new Error("must not be called"); }, cookieOptions: { isValid: (value) => value === secret } });
  assert.deepEqual(auth, { kind: "secret", secret });
  assert.deepEqual(ownerAuthHeaders(auth), { "X-Zhaowu-Owner-Secret": secret });
  assert.deepEqual(ownerAuthHeaders({ kind: "device", deviceId: DEVICE_ID }), { "X-Zhaowu-Owner-Device": DEVICE_ID });
  assert.deepEqual(ownerAuthHeaders(null), {});
  assert.equal(await authenticateOwner({ headers: {} }, { env }), null);
});
