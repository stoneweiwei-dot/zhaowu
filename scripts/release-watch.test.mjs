import assert from "node:assert/strict";
import test from "node:test";
import handler, { probeReleaseJson, requestIsAuthorizedCron, runReleaseWatch } from "../api/release-watch.js";

const good = () => new Response(JSON.stringify({ release: "abc123", builtAt: "2026-10-23T00:00:00Z" }), { status: 200 });
const noSleep = () => Promise.resolve();
const SECRET = "x".repeat(24);

test("healthy release.json returns 200 and the release id", async () => {
  const r = await runReleaseWatch({ env: {}, fetchImpl: async () => good(), sleep: noSleep });
  assert.equal(r.status, 200);
  assert.equal(r.body.release, "abc123");
  assert.equal(r.body.attempts, 1);
});

test("timeout, bad JSON, bad shape and HTTP errors each raise a 503 after one retry", async () => {
  const cases = {
    TIMEOUT: async (_u, { signal }) => new Promise((_, rej) => signal.addEventListener("abort", () => rej(Object.assign(new Error("a"), { name: "AbortError" })))),
    INVALID_JSON: async () => new Response("<html>", { status: 200 }),
    INVALID_SHAPE: async () => new Response("{}", { status: 200 }),
    HTTP_500: async () => new Response("no", { status: 500 }),
  };
  for (const [reason, fetchImpl] of Object.entries(cases)) {
    const probe = reason === "TIMEOUT" ? await probeReleaseJson({ fetchImpl, timeoutMs: 20 }) : null;
    if (probe) assert.equal(probe.reason, "TIMEOUT");
    const quiet = console.error; console.error = () => {};
    try {
      const r = await runReleaseWatch({ env: {}, fetchImpl, sleep: noSleep });
      assert.equal(r.status, reason === "TIMEOUT" ? 503 : 503);
      assert.equal(r.body.attempts, 2);
      if (reason !== "TIMEOUT") assert.equal(r.body.reason, reason);
    } finally { console.error = quiet; }
  }
});

test("a transient failure recovers on the retry", async () => {
  let n = 0;
  const r = await runReleaseWatch({ env: {}, sleep: noSleep, fetchImpl: async () => (n++ === 0 ? new Response("x", { status: 502 }) : good()) });
  assert.equal(r.status, 200);
  assert.equal(r.body.attempts, 2);
});

test("webhook is posted on failure when configured, https only", async () => {
  const calls = [];
  const quiet = console.error; console.error = () => {};
  try {
    const fetchImpl = async (url) => { calls.push(url); return url.includes("hook") ? new Response("ok") : new Response("x", { status: 500 }); };
    const r = await runReleaseWatch({ env: { RELEASE_WATCH_WEBHOOK_URL: "https://example.com/hook" }, fetchImpl, sleep: noSleep });
    assert.equal(r.body.webhookSent, true);
    const r2 = await runReleaseWatch({ env: { RELEASE_WATCH_WEBHOOK_URL: "http://example.com/hook" }, fetchImpl, sleep: noSleep });
    assert.equal(r2.body.webhookSent, false);
  } finally { console.error = quiet; }
});

test("slow responses and release mismatch only warn", async () => {
  let t = 0;
  const r = await runReleaseWatch({ env: { VERCEL_GIT_COMMIT_SHA: "other" }, fetchImpl: async () => good(), sleep: noSleep, now: () => (t += 3000) });
  assert.equal(r.status, 200);
  assert.ok(r.body.warn.includes("RELEASE_MISMATCH"));
  assert.ok(r.body.warn.some((w) => w.startsWith("SLOW_")));
});

test("cron auth fails closed", async () => {
  assert.equal(requestIsAuthorizedCron({ headers: { authorization: `Bearer ${SECRET}` } }, {}), false);
  assert.equal(requestIsAuthorizedCron({ headers: { authorization: `Bearer ${SECRET}` } }, { CRON_SECRET: "short" }), false);
  assert.equal(requestIsAuthorizedCron({ headers: { authorization: "Bearer wrong" } }, { CRON_SECRET: SECRET }), false);
  assert.equal(requestIsAuthorizedCron({ headers: { authorization: `Bearer ${SECRET}` } }, { CRON_SECRET: SECRET }), true);
  const res = await handler({ method: "GET", headers: {} });
  assert.equal(res.status, 401);
  assert.equal((await handler({ method: "POST", headers: {} })).status, 405);
});
