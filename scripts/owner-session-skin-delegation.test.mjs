import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import ownerSession from "../api/owner-session.js";
import ownerData, { handleOwnerData } from "../api/owner-data.js";
import { OWNER_COOKIE, ownerCookieValue } from "../lib/owner-session-cookie.js";

const OWNER = "test-owner-secret";
const ORIGIN = "https://zhao-wu.com";
const ENV = {
  ZHAOWU_OWNER_BRIDGE_SECRET: "b".repeat(32),
  ZHAOWU_OWNER_KEY_SHA256: createHash("sha256").update(OWNER, "utf8").digest("hex"),
  ZHAOWU_OWNER_ALLOWED_ORIGINS: ORIGIN,
};

async function withEnv(fn, respond) {
  const saved = new Map();
  for (const key of Object.keys(ENV)) { saved.set(key, process.env[key]); process.env[key] = ENV[key]; }
  const realFetch = globalThis.fetch;
  const upstream = [];
  globalThis.fetch = async (url, init) => {
    upstream.push({ url: String(url), init });
    if (respond) return respond(url, init, upstream.length);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  try { return await fn(upstream); }
  finally {
    globalThis.fetch = realFetch;
    for (const [key, value] of saved) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
}

const cookie = () => `${OWNER_COOKIE}=${encodeURIComponent(ownerCookieValue(OWNER, { env: ENV }))}`;
const baseHeaders = () => ({ origin: ORIGIN, host: "zhao-wu.com", cookie: cookie(), "content-type": "application/json" });

/** Fetch-style request: the body stream can be read exactly once, like a real Request. */
function fetchStyleRequest(payload) {
  let consumed = false;
  return {
    method: "POST",
    url: `${ORIGIN}/api/owner-session`,
    headers: new Headers(baseHeaders()),
    async json() {
      if (consumed) throw new TypeError("Body is unusable: Body has already been read");
      consumed = true;
      return payload;
    },
  };
}

/** Node-style request: Vercel's Node runtime pre-parses the body into req.body. */
const nodeStyleRequest = (payload) => ({ method: "POST", url: "/api/owner-session", headers: baseHeaders(), body: payload });

function fakeRes() {
  const res = { statusCode: 0, headers: {}, payload: undefined };
  res.setHeader = (key, value) => { res.headers[key] = value; };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.payload = body; return res; };
  return res;
}

const publish = { action: "site-skin.publish", skin: "pastel-koi" };

test("owner-session delegates site-skin.publish to owner-data with a single-use Fetch-style body", async () => {
  await withEnv(async (upstream) => {
    const response = await ownerSession(fetchStyleRequest(publish));
    assert.equal(response.status, 200);
    assert.equal(upstream.length, 1, "exactly one upstream call");
    assert.match(upstream[0].url, /\/functions\/v1\/zhaowu-owner-data$/);
    assert.deepEqual(JSON.parse(upstream[0].init.body), publish, "the original payload reached the edge function intact");
    assert.equal(upstream[0].init.headers["X-Zhaowu-Owner-Secret"], OWNER);
  });
});

test("owner-session delegates site-skin.publish with a Node-style pre-parsed body", async () => {
  await withEnv(async (upstream) => {
    const res = fakeRes();
    await ownerSession(nodeStyleRequest(publish), res);
    assert.equal(res.statusCode, 200);
    assert.equal(upstream.length, 1);
    assert.deepEqual(JSON.parse(upstream[0].init.body), publish);
  });
});

test("delegation still enforces origin and owner session before touching upstream", async () => {
  await withEnv(async (upstream) => {
    const foreign = fetchStyleRequest(publish);
    foreign.headers = new Headers({ ...baseHeaders(), origin: "https://evil.example" });
    assert.equal((await ownerSession(foreign)).status, 403);

    const anonymous = fetchStyleRequest(publish);
    anonymous.headers = new Headers({ origin: ORIGIN, host: "zhao-wu.com" });
    assert.equal((await ownerSession(anonymous)).status, 401);
    assert.equal(upstream.length, 0, "rejected requests never reach the edge function");
  });
});

test("owner-data default export still reads its own body when called directly by Vercel", async () => {
  await withEnv(async (upstream) => {
    const response = await ownerData(fetchStyleRequest(publish));
    assert.equal(response.status, 200);
    assert.equal(upstream.length, 1);
    assert.deepEqual(JSON.parse(upstream[0].init.body), publish);
  });
});

test("an unknown skin is rejected without an upstream call, via delegation too", async () => {
  await withEnv(async (upstream) => {
    const response = await ownerSession(fetchStyleRequest({ action: "site-skin.publish", skin: "not-a-skin" }));
    assert.equal(response.status, 400);
    assert.equal(upstream.length, 0);
  });
});

test("handleOwnerData prefers the supplied payload over re-reading a consumed body", async () => {
  await withEnv(async (upstream) => {
    const req = fetchStyleRequest(publish);
    await req.json(); // simulate the caller having consumed the stream
    const response = await handleOwnerData(req, undefined, publish);
    assert.equal(response.status, 200);
    assert.deepEqual(JSON.parse(upstream[0].init.body), publish);
  });
});

test("site-skin publication retries one transient network failure", async () => {
  await withEnv(async (upstream) => {
    const response = await ownerData(fetchStyleRequest(publish));
    assert.equal(response.status, 200);
    assert.equal(upstream.length, 2);
  }, (_url, _init, attempt) => {
    if (attempt === 1) throw new TypeError("transient connection reset");
    return new Response(JSON.stringify({ ok: true, skin: publish.skin }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
});

test("site-skin publication retries a transient upstream 5xx", async () => {
  await withEnv(async (upstream) => {
    const response = await ownerData(fetchStyleRequest(publish));
    assert.equal(response.status, 200);
    assert.equal(upstream.length, 2);
  }, (_url, _init, attempt) => new Response(
    JSON.stringify(attempt === 1 ? { ok: false, error: "TEMPORARY" } : { ok: true, skin: publish.skin }),
    { status: attempt === 1 ? 502 : 200, headers: { "Content-Type": "application/json" } },
  ));
});

test("public read-only skin fallback does not require a sign-in", async () => {
  await withEnv(async () => {
    const response = await ownerSession({ method: "GET", url: ORIGIN + "/api/owner-session?view=site-skin", headers: new Headers({ host: "zhao-wu.com" }) });
    assert.notEqual(response.status, 401);
    assert.notEqual(response.status, 405);
  });
});
