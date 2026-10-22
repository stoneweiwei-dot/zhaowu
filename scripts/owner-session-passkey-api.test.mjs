import assert from "node:assert/strict";
import test from "node:test";
import { createAuthenticator } from "./helpers/virtual-authenticator.mjs";
import musicWrite from "../api/owner-music-write.js";
import ownerData from "../api/owner-data.js";
import ownerSession from "../api/owner-session.js";
import { clearOwnerDeviceCache } from "../lib/owner-auth.js";
import { passkeyRegistrationOptions, verifyPasskeyRegistration } from "../lib/owner-passkey.js";

const HOST = "zhaowu.test";
const BRIDGE = "bridge-secret-for-tests-0123456789abcdef";
process.env.ZHAOWU_OWNER_BRIDGE_SECRET = BRIDGE;

// ---- a fake owner-data Edge Function: just the owner_devices table -------------------------------------------------
function fakeEdge() {
  const devices = [];
  const calls = [];
  const fetchImpl = async (_url, init) => {
    const body = JSON.parse(init.body);
    const headers = new Headers(init.headers);
    calls.push({ action: body.action, headers });
    assert.equal(headers.get("x-zhaowu-bridge-secret"), BRIDGE);
    const reply = (value, status = 200) => new Response(JSON.stringify(value), { status });
    switch (body.action) {
      case "owner.device.credential": return reply({ ok: true, device: devices.find((row) => row.credential_id === body.credentialId) ?? null });
      case "owner.device.check": return reply({ ok: true, active: devices.some((row) => row.id === body.deviceId && !row.revoked_at) });
      case "owner.device.touch": { const row = devices.find((item) => item.id === body.id); row.sign_count = body.signCount; return reply({ ok: true }); }
      case "owner.device.list": return reply({ ok: true, items: devices.map(({ id, label, revoked_at }) => ({ id, label, revoked_at })) });
      case "owner.device.revoke": { const row = devices.find((item) => item.id === body.id); if (!row) return reply({ ok: false, error: "DEVICE_NOT_FOUND" }, 404); row.revoked_at = "now"; return reply({ ok: true }); }
      default: return reply({ ok: true });
    }
  };
  return { devices, calls, fetchImpl };
}

// ---- minimal Vercel-style req/res ------------------------------------------------------------------------------------
function call(handler, { method = "POST", body, cookie = "", headers = {} } = {}) {
  const request = {
    method,
    body,
    headers: { host: HOST, origin: `https://${HOST}`, "sec-fetch-site": "same-origin", ...(cookie ? { cookie } : {}), ...headers },
  };
  const state = { status: 200, headers: {}, body: undefined };
  const response = {
    setHeader(key, value) { state.headers[key.toLowerCase()] = value; },
    status(code) { state.status = code; return response; },
    json(value) { state.body = value; return response; },
    end() { return response; },
  };
  return Promise.resolve(handler(request, response)).then(() => state);
}
const cookiesOf = (state) => [state.headers["set-cookie"]].flat().filter(Boolean);
const pair = (setCookie) => setCookie.split(";")[0];

async function withEdge(run) {
  clearOwnerDeviceCache();
  const edge = fakeEdge();
  const original = globalThis.fetch;
  globalThis.fetch = edge.fetchImpl;
  try { return await run(edge); } finally { globalThis.fetch = original; }
}

async function enrol(edge) {
  const phone = createAuthenticator();
  const request = { headers: { host: HOST } };
  const { options, cookie } = await passkeyRegistrationOptions(request);
  const registered = await verifyPasskeyRegistration({ headers: { host: HOST, cookie: pair(cookie) } }, phone.register(options));
  const row = { id: "3f2b8c1e-5d4a-4e7b-9c10-a1b2c3d4e5f6", credential_id: registered.credentialId, public_key: registered.publicKey, sign_count: registered.signCount, transports: registered.transports, revoked_at: null };
  edge.devices.push(row);
  return { phone, row };
}

async function signIn(edge, phone) {
  const options = await call(ownerSession, { body: { action: "passkey.login.options" } });
  assert.equal(options.status, 200);
  const challenge = pair(cookiesOf(options)[0]);
  const verified = await call(ownerSession, { cookie: challenge, body: { action: "passkey.login.verify", response: phone.authenticate(options.body.options) } });
  return { options, verified };
}

test("a registered phone signs in with Face ID and gets a long-lived device session", async () => {
  await withEdge(async (edge) => {
    const { phone, row } = await enrol(edge);
    const { verified } = await signIn(edge, phone);
    assert.equal(verified.status, 200, JSON.stringify(verified.body));
    const cookies = cookiesOf(verified);
    const session = cookies.find((value) => value.startsWith("__Host-zhaowu_owner_session="));
    assert.ok(session, "session cookie issued");
    assert.match(session, /HttpOnly; Secure; SameSite=Strict; Max-Age=7776000/);
    assert.ok(cookies.some((value) => value.startsWith("__Host-zhaowu_passkey_challenge=;")), "challenge cookie cleared");
    assert.equal(row.sign_count, 1, "counter stored");

    const status = await call(ownerSession, { method: "GET", cookie: pair(session) });
    assert.deepEqual(status.body, { authenticated: true, kind: "device" });
  });
});

test("an unknown phone and a bad assertion are refused without a session", async () => {
  await withEdge(async (edge) => {
    const stranger = createAuthenticator();
    const { verified } = await signIn(edge, stranger);
    assert.equal(verified.status, 400);
    assert.equal(verified.body.error, "PASSKEY_DEVICE_UNKNOWN");
    assert.equal(cookiesOf(verified).length, 0);

    const { phone } = await enrol(edge);
    const options = await call(ownerSession, { body: { action: "passkey.login.options" } });
    const forged = phone.authenticate(options.body.options, { origin: "https://evil.test" });
    const result = await call(ownerSession, { cookie: pair(cookiesOf(options)[0]), body: { action: "passkey.login.verify", response: forged } });
    assert.equal(result.status, 400);
    assert.equal(cookiesOf(result).filter((value) => value.startsWith("__Host-zhaowu_owner_session=")).length, 0);
  });
});

test("a Passkey session can list and revoke devices, but not enrol new ones", async () => {
  await withEdge(async (edge) => {
    const { phone, row } = await enrol(edge);
    const { verified } = await signIn(edge, phone);
    const cookie = pair(cookiesOf(verified).find((value) => value.startsWith("__Host-zhaowu_owner_session=")));

    const list = await call(ownerSession, { cookie, body: { action: "device.list" } });
    assert.equal(list.status, 200);
    assert.equal(list.body.items.length, 1);
    const listCall = edge.calls.findLast((item) => item.action === "owner.device.list");
    assert.equal(listCall.headers.get("x-zhaowu-owner-device"), row.id);
    assert.equal(listCall.headers.get("x-zhaowu-owner-secret"), null);

    for (const action of ["passkey.register.options", "passkey.register.verify"]) {
      const refused = await call(ownerSession, { cookie, body: { action, response: {} } });
      assert.equal(refused.status, 403);
      assert.equal(refused.body.error, "OWNER_PASSWORD_REQUIRED");
    }
  });
});

test("revoking a phone ends its session as soon as the cache expires", async () => {
  await withEdge(async (edge) => {
    const { phone } = await enrol(edge);
    const { verified } = await signIn(edge, phone);
    const cookie = pair(cookiesOf(verified).find((value) => value.startsWith("__Host-zhaowu_owner_session=")));
    assert.equal((await call(ownerSession, { method: "GET", cookie })).body.authenticated, true);

    const revoke = await call(ownerSession, { cookie, body: { action: "device.revoke", id: edge.devices[0].id } });
    assert.equal(revoke.status, 200);
    clearOwnerDeviceCache(); // stands in for the 60 second cache window passing
    assert.deepEqual((await call(ownerSession, { method: "GET", cookie })).body, { authenticated: false, kind: null });
    assert.equal((await call(ownerSession, { cookie, body: { action: "device.list" } })).status, 401);

    // And the revoked phone can no longer sign in.
    const again = await signIn(edge, phone);
    assert.equal(again.verified.status, 400);
    assert.equal(again.verified.body.error, "PASSKEY_DEVICE_UNKNOWN");
  });
});

test("device and passkey actions refuse anonymous callers and cross-site requests", async () => {
  await withEdge(async () => {
    assert.equal((await call(ownerSession, { body: { action: "device.list" } })).status, 401);
    assert.equal((await call(ownerSession, { body: { action: "device.revoke", id: "x" } })).status, 401);
    assert.equal((await call(ownerSession, { body: { action: "passkey.register.options" } })).status, 401);
    const crossSite = await call(ownerSession, { body: { action: "passkey.login.options" }, headers: { origin: "https://evil.test" } });
    assert.equal(crossSite.status, 403);
    assert.equal((await call(ownerSession, { method: "GET" })).body.authenticated, false);
  });
});

test("Passkey sessions reach owner-data through the device header, but music upload and promo/article actions need the password", async () => {
  await withEdge(async (edge) => {
    const { phone, row } = await enrol(edge);
    const { verified } = await signIn(edge, phone);
    const cookie = pair(cookiesOf(verified).find((value) => value.startsWith("__Host-zhaowu_owner_session=")));

    const report = await call(ownerData, { cookie, body: { action: "report.list" } });
    assert.equal(report.status, 200);
    const forwarded = edge.calls.findLast((item) => item.action === "report.list");
    assert.equal(forwarded.headers.get("x-zhaowu-owner-device"), row.id);
    assert.equal(forwarded.headers.get("x-zhaowu-owner-secret"), null);

    // Theme skins are published through the owner-data Edge Function now, so Face ID may do it.
    const skin = await call(ownerData, { cookie, body: { action: "site-skin.publish", skin: "lotus-boat" } });
    assert.equal(skin.status, 200);
    assert.equal(edge.calls.findLast((item) => item.action === "site-skin.publish").headers.get("x-zhaowu-owner-device"), row.id);
    // Promo codes and articles live in separate Edge Functions that only know the password.
    for (const action of ["promo.list", "article.list"]) {
      const refused = await call(ownerData, { cookie, body: { action } });
      assert.equal(refused.status, 403, action);
      assert.equal(refused.body.error, "OWNER_PASSWORD_REQUIRED");
    }
    const music = await call(musicWrite, { cookie, body: Buffer.from("x"), headers: { "content-type": "audio/mpeg", "x-zhaowu-music-name": "a.mp3" } });
    assert.equal(music.status, 403);
    assert.equal(music.body.error, "OWNER_PASSWORD_REQUIRED");
  });
});
