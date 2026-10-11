import assert from "node:assert/strict";
import test from "node:test";
import {
  OWNER_COOKIE,
  OWNER_SESSION_MAX_AGE_SECONDS,
  ownerClearCookie,
  ownerCookieValue,
  ownerSecretFromCookieValue,
  ownerSecretFromRequest,
  ownerSetCookie,
} from "../lib/owner-session-cookie.js";

const SECRET = "correct-horse-battery-staple";
const isValid = (value) => value === SECRET;
const env = { ZHAOWU_OWNER_BRIDGE_SECRET: "bridge-secret-for-tests-0123456789" };
const now = 1_800_000_000_000;

test("sealed cookie never contains the owner secret and round-trips", () => {
  const value = ownerCookieValue(SECRET, { env, now });
  assert.ok(value.startsWith("v1."));
  assert.ok(!value.includes(SECRET));
  assert.ok(!Buffer.from(value.slice(3), "base64url").includes(Buffer.from(SECRET)));
  assert.equal(ownerSecretFromCookieValue(value, { env, now, isValid }), SECRET);
});

test("each login produces a different cookie value", () => {
  assert.notEqual(ownerCookieValue(SECRET, { env, now }), ownerCookieValue(SECRET, { env, now }));
});

test("sealed cookie expires after the max age", () => {
  const value = ownerCookieValue(SECRET, { env, now });
  const justBefore = now + (OWNER_SESSION_MAX_AGE_SECONDS - 5) * 1000;
  const after = now + (OWNER_SESSION_MAX_AGE_SECONDS + 5) * 1000;
  assert.equal(ownerSecretFromCookieValue(value, { env, now: justBefore, isValid }), SECRET);
  assert.equal(ownerSecretFromCookieValue(value, { env, now: after, isValid }), "");
});

test("tampered, truncated or wrong-key cookies are rejected", () => {
  const value = ownerCookieValue(SECRET, { env, now });
  const flipped = value.slice(0, -2) + (value.endsWith("A") ? "BB" : "AA");
  assert.equal(ownerSecretFromCookieValue(flipped, { env, now, isValid }), "");
  assert.equal(ownerSecretFromCookieValue(value.slice(0, 20), { env, now, isValid }), "");
  assert.equal(ownerSecretFromCookieValue("v1.", { env, now, isValid }), "");
  assert.equal(ownerSecretFromCookieValue(value, { env: { ZHAOWU_OWNER_BRIDGE_SECRET: "another-bridge-secret-0123456789" }, now, isValid }), "");
});

test("a sealed cookie holding a wrong secret is rejected", () => {
  const value = ownerCookieValue("not-the-owner-secret", { env, now });
  assert.equal(ownerSecretFromCookieValue(value, { env, now, isValid }), "");
});

test("sealed cookies fail closed when the server key is missing", () => {
  const value = ownerCookieValue(SECRET, { env, now });
  assert.equal(ownerSecretFromCookieValue(value, { env: {}, now, isValid }), "");
});

test("without a server key login still works (legacy plain cookie) so the owner is never locked out", () => {
  const value = ownerCookieValue(SECRET, { env: {}, now });
  assert.equal(value, SECRET);
  assert.equal(ownerSecretFromCookieValue(value, { env: {}, now, isValid }), SECRET);
});

test("legacy plain cookies issued before this change stay valid until they expire", () => {
  assert.equal(ownerSecretFromCookieValue(SECRET, { env, now, isValid }), SECRET);
  assert.equal(ownerSecretFromCookieValue("wrong", { env, now, isValid }), "");
  assert.equal(ownerSecretFromCookieValue("", { env, now, isValid }), "");
});

test("set/clear cookie headers keep the hardened attributes", () => {
  const set = ownerSetCookie(SECRET, { env, now });
  assert.ok(set.startsWith(`${OWNER_COOKIE}=`));
  assert.match(set, /; Path=\/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000$/);
  assert.ok(!decodeURIComponent(set).includes(SECRET));
  assert.match(ownerClearCookie(), /Max-Age=0$/);
});

test("request helper reads the cookie from node-style and fetch-style headers", () => {
  const value = ownerCookieValue(SECRET, { env, now });
  const cookie = `a=b; ${OWNER_COOKIE}=${encodeURIComponent(value)}; c=d`;
  const options = { env, now, isValid };
  assert.equal(ownerSecretFromRequest({ headers: { cookie } }, options), SECRET);
  assert.equal(ownerSecretFromRequest({ headers: new Headers({ cookie }) }, options), SECRET);
  assert.equal(ownerSecretFromRequest({ headers: {} }, options), "");
});

test("no api handler keeps its own copy of the owner key hash or plain-cookie check", async () => {
  const { readFile } = await import("node:fs/promises");
  for (const file of ["owner-login", "owner-logout", "owner-session", "owner-data", "owner-music-write", "mingshu-chart", "mingshu-compare", "mingshu-locations"]) {
    const source = await readFile(new URL(`../api/${file}.js`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /OWNER_KEY_SHA256/, `${file} still embeds the key hash`);
    assert.doesNotMatch(source, /encodeURIComponent\(secret\)/, `${file} still writes the plain secret into the cookie`);
  }
});
