import test from "node:test";
import assert from "node:assert/strict";
import { SOCIAL_CONTENT_BANK, bankPostText, pickBankEntry } from "../lib/social-content-bank.js";
import { isPublishDay, runAutopublish, taipeiClock } from "../lib/social-scheduler.js";
import { upcomingPublishDates, autopublishOverview } from "../lib/social-owner-actions.js";
import { encryptMetaAccessToken } from "../lib/meta-oauth.js";

test("every bank post fits Threads (<=500 UTF-8 bytes), is unique, and has no outcome promises", () => {
  const keys = new Set();
  for (const entry of SOCIAL_CONTENT_BANK) {
    assert.ok(!keys.has(entry.key), `duplicate key ${entry.key}`);
    keys.add(entry.key);
    const text = bankPostText(entry);
    assert.ok(Buffer.byteLength(text, "utf8") <= 500, `${entry.key} is ${Buffer.byteLength(text, "utf8")} bytes`);
    assert.match(entry.path, /^\/[a-z0-9\-/]*$/);
    assert.doesNotMatch(entry.body, /保證|一定會|必定|包準|轉運|改運|立即見效/);
  }
  assert.ok(SOCIAL_CONTENT_BANK.length >= 24);
});

test("bank rotation uses unused posts first, then the least recently used", () => {
  const first = pickBankEntry([]);
  assert.equal(first.key, SOCIAL_CONTENT_BANK[0].key);
  const allButLast = SOCIAL_CONTENT_BANK.slice(0, -1).map((e) => e.key).reverse();
  assert.equal(pickBankEntry(allButLast).key, SOCIAL_CONTENT_BANK.at(-1).key);
  const all = SOCIAL_CONTENT_BANK.map((e) => e.key).reverse(); // newest-first; first bank entry is the oldest
  assert.equal(pickBankEntry(all).key, SOCIAL_CONTENT_BANK[0].key);
});

test("schedule clock is Asia/Taipei", () => {
  // 2026-10-16 12:00 UTC = Friday 20:00 Taipei; 2026-10-16 17:00 UTC is already Saturday 01:00 Taipei.
  assert.deepEqual(taipeiClock(new Date("2026-10-16T12:00:00Z")), { date: "2026-10-16", weekday: 5 });
  assert.deepEqual(taipeiClock(new Date("2026-10-16T17:00:00Z")), { date: "2026-10-17", weekday: 6 });
  assert.equal(isPublishDay([2, 4, 6], new Date("2026-10-16T12:00:00Z")), false);
  assert.equal(isPublishDay([2, 4, 5], new Date("2026-10-16T12:00:00Z")), true);
  assert.deepEqual(upcomingPublishDates([5], new Date("2026-10-16T01:00:00Z"), 2), ["2026-10-16", "2026-10-23"]);
  assert.deepEqual(upcomingPublishDates([5], new Date("2026-10-16T13:00:00Z"), 1), ["2026-10-23"]);
});

function gateway(state) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    const body = JSON.parse(init.body);
    calls.push(body.action);
    const respond = (value, status = 200) => ({ ok: status < 400, status, json: async () => value });
    switch (body.action) {
      case "settings.get": return respond({ ok: true, settings: state.settings });
      case "settings.set": state.note = body.pausedReason; return respond({ ok: true });
      case "queue.nextOwner": return respond({ ok: true, item: state.ownerItem || null });
      case "queue.recentBankKeys": return respond({ ok: true, keys: state.keys || [] });
      case "accounts.list": return respond({ ok: true, items: state.accounts || [] });
      case "metaAccounts.list": return respond({ ok: true, items: state.metaAccounts || [] });
      case "run.claim":
        if (state.claimed) return respond({ ok: true, claimed: false, reason: "ALREADY_RAN_TODAY" });
        state.claimed = body;
        return respond({ ok: true, claimed: true, item: { id: "11111111-1111-1111-1111-111111111111" } });
      case "run.finish": state.finished = body; return respond({ ok: true, item: { id: body.id, status: body.status } });
      default: return respond({ ok: false, error: "UNEXPECTED" }, 400);
    }
  };
  return { calls, fetchImpl };
}

const ENV = { ZHAOWU_SOCIAL_QUEUE_SECRET: "x".repeat(40) };
const FRIDAY = new Date("2026-10-16T12:00:00Z");

test("cron does nothing when disabled or on a non-publish day", async () => {
  const off = { settings: { enabled: false, publish_days: [5], channels: ["threads"] } };
  assert.equal((await runAutopublish({ env: ENV, fetchImpl: gateway(off).fetchImpl, now: FRIDAY })).reason, "DISABLED");
  const wrongDay = { settings: { enabled: true, publish_days: [2], channels: ["threads"] } };
  assert.equal((await runAutopublish({ env: ENV, fetchImpl: gateway(wrongDay).fetchImpl, now: FRIDAY })).reason, "NOT_PUBLISH_DAY");
});

test("nothing connected: does not claim the day or burn a bank post, and leaves a visible note", async () => {
  const state = { settings: { enabled: true, publish_days: [5], channels: ["threads"] }, accounts: [] };
  const g = gateway(state);
  const result = await runAutopublish({ env: ENV, fetchImpl: g.fetchImpl, now: FRIDAY });
  assert.equal(result.reason, "NOTHING_CONNECTED");
  assert.ok(!g.calls.includes("run.claim"));
  assert.match(state.note, /Threads/);
});

test("manual-only channels become a copy-ready manual task, never an API call", async () => {
  const state = { settings: { enabled: true, publish_days: [5], channels: ["xiaohongshu"] } };
  const g = gateway(state);
  const result = await runAutopublish({ env: ENV, fetchImpl: g.fetchImpl, now: FRIDAY });
  assert.equal(result.status, "manual");
  assert.equal(state.finished.results.xiaohongshu.manual, true);
  assert.equal(state.claimed.slotDate, "2026-10-16");
  assert.equal(state.claimed.source, "bank");
});

test("a second cron call the same day is rejected by the day slot", async () => {
  const state = { settings: { enabled: true, publish_days: [5], channels: ["xiaohongshu"] }, claimed: { already: true } };
  const result = await runAutopublish({ env: ENV, fetchImpl: gateway(state).fetchImpl, now: FRIDAY });
  assert.equal(result.reason, "ALREADY_RAN_TODAY");
});

test("owner-written queued posts are published before the bank and keep their own channels", async () => {
  const state = {
    settings: { enabled: true, publish_days: [5], channels: ["threads"] },
    ownerItem: { id: "22222222-2222-2222-2222-222222222222", body: "自己寫的貼文", image_url: null, alt_text: null, channels: ["x"] },
  };
  const result = await runAutopublish({ env: ENV, fetchImpl: gateway(state).fetchImpl, now: FRIDAY });
  assert.equal(result.status, "manual");
  assert.equal(state.claimed.queueId, "22222222-2222-2222-2222-222222222222");
  assert.equal(state.claimed.source, "owner");
});

test("owner 'publish now' ignores the weekday schedule and does not use the daily slot", async () => {
  const state = { settings: { enabled: false, publish_days: [2], channels: ["x"] } };
  const result = await runAutopublish({ env: ENV, fetchImpl: gateway(state).fetchImpl, now: FRIDAY, force: true });
  assert.equal(result.ran, true);
  assert.equal(state.claimed.slotDate, null);
});

function withThreads(g) {
  return async (url, init) => {
    if (String(url).includes("graph.threads.net")) return { ok: true, status: 200, json: async () => ({ id: "123", status: "FINISHED", permalink: "https://www.threads.com/@x/post/1" }) };
    return g.fetchImpl(url, init);
  };
}
const ENV_THREADS = { ...ENV, META_THREADS_USER_ID: "1", META_THREADS_ACCESS_TOKEN: "t".repeat(30) };

test("Threads publishes and the manual channels stay visible as pending tasks (not lost behind 'published')", async () => {
  const state = { settings: { enabled: true, publish_days: [5], channels: ["threads", "x", "xiaohongshu"] } };
  const result = await runAutopublish({ env: ENV_THREADS, fetchImpl: withThreads(gateway(state)), now: FRIDAY });
  assert.equal(result.status, "published");
  assert.equal(state.finished.results.threads.ok, true);
  assert.equal(state.finished.results.x.manual, true);
  assert.equal(state.finished.results.xiaohongshu.manual, true);
});

test("Instagram without credentials/image becomes a manual task instead of a silent failure", async () => {
  const state = { settings: { enabled: true, publish_days: [5], channels: ["threads", "instagram"] } };
  const result = await runAutopublish({ env: ENV_THREADS, fetchImpl: withThreads(gateway(state)), now: FRIDAY });
  assert.equal(result.status, "published");
  assert.equal(state.finished.results.instagram.manual, true);
  assert.equal(state.finished.results.threads.ok, true);
});

test("an unconnected Facebook channel next to a manual one becomes a manual task, not a silent NOT_CONNECTED", async () => {
  const state = { settings: { enabled: true, publish_days: [5], channels: ["facebook", "x"] } };
  const result = await runAutopublish({ env: ENV, fetchImpl: gateway(state).fetchImpl, now: FRIDAY });
  assert.equal(result.status, "manual");
  assert.equal(state.finished.results.facebook.manual, true);
  assert.equal(state.finished.results.x.manual, true);
  assert.equal(state.finished.results.facebook.code, undefined);
});

test("one stored Meta connection lets the scheduler publish Facebook and linked Instagram automatically", async () => {
  const env = {
    ...ENV,
    META_APP_SECRET: "meta-app-secret-for-scheduler-test-123456",
    ZHAOWU_OWNER_BRIDGE_SECRET: "bridge-secret-for-scheduler-test-123456",
  };
  const state = {
    settings: { enabled: true, publish_days: [5], channels: ["facebook", "instagram"] },
    ownerItem: {
      id: "33333333-3333-3333-3333-333333333333",
      body: "Meta 排程測試",
      image_url: "https://zhao-wu.com/og-preview.png",
      alt_text: "昭梧",
      channels: ["facebook", "instagram"],
    },
    metaAccounts: [{
      id: "44444444-4444-4444-4444-444444444444",
      page_id: "123456789",
      page_name: "昭梧",
      instagram_user_id: "987654321",
      instagram_username: "fkofflove",
      access_token_ciphertext: encryptMetaAccessToken("page-token-secret", env),
      token_expires_at: null,
    }],
  };
  const g = gateway(state);
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    if (!String(url).includes("graph.facebook.com")) return g.fetchImpl(url, init);
    calls.push({ url: String(url), method: init.method || "GET" });
    if ((init.method || "GET") === "GET") return { ok: true, status: 200, json: async () => ({ username: "fkofflove" }) };
    return { ok: true, status: 200, json: async () => ({ id: String(url).endsWith("/media") ? "container" : "published" }) };
  };
  const result = await runAutopublish({ env, fetchImpl, now: FRIDAY });
  assert.equal(result.status, "published");
  assert.equal(state.finished.results.facebook.ok, true);
  assert.equal(state.finished.results.instagram.ok, true);
  assert.ok(calls.some((call) => call.url.endsWith("/123456789/photos")));
  assert.ok(calls.some((call) => call.url.endsWith("/987654321/media_publish")));
  assert.doesNotMatch(JSON.stringify(state.finished.results), /page-token-secret/);
});


test("autopublish overview stays readable when optional Meta account lookup returns 404", async () => {
  const calls = [];
  const fakeFetch = async (_url, init) => {
    const action = JSON.parse(init.body).action;
    calls.push(action);
    const respond = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });
    switch (action) {
      case "settings.get": return respond({ ok: true, settings: { enabled: false, publish_days: [5], channels: ["threads"] } });
      case "queue.list": return respond({ ok: true, items: [] });
      case "accounts.list": return respond({ ok: true, items: [] });
      case "metaAccounts.list": return respond({ ok: false, error: "UNKNOWN_ACTION" }, 404);
      case "queue.recentBankKeys": return respond({ ok: true, keys: [] });
      default: throw Error("UNEXPECTED_ACTION_" + action);
    }
  };
  const env = { ZHAOWU_SOCIAL_QUEUE_SECRET: "z".repeat(40) };
  const status = await autopublishOverview(env, fakeFetch, new Date("2026-10-23T00:00:00Z"));
  assert.equal(status.ok, true);
  assert.equal(status.configured, true);
  assert.deepEqual(status.accountWarnings, ["META_ACCOUNTS_UNAVAILABLE"]);
  assert.deepEqual(status.channels.metaAccounts, []);
  assert.equal(calls.length, 5);
});
