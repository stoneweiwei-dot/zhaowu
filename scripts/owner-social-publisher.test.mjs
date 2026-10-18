import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { publishSocialPost, socialConfiguration, validateSocialPost } from "../lib/meta-social-publisher.js";
import {
  createThreadsAuthorization,
  decryptThreadsAccessToken,
  encryptThreadsAccessToken,
  threadsAuthorizationOwnerProof,
  verifyThreadsAuthorization,
} from "../lib/threads-oauth.js";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");
const configuredEnv = {
  META_INSTAGRAM_USER_ID: "ig-user",
  META_INSTAGRAM_ACCESS_TOKEN: "ig-secret-token",
  META_THREADS_USER_ID: "threads-user",
  META_THREADS_ACCESS_TOKEN: "threads-secret-token",
  META_GRAPH_API_VERSION: "v26.0",
};

test("social credentials stay server-side and configuration exposes booleans only", async () => {
  assert.deepEqual(socialConfiguration(configuredEnv), {
    instagram: true,
    threads: true,
    ready: true,
    targets: { instagram: "", threads: "" },
  });
  const client = await source("src/lib/owner-social-client.ts");
  const route = await source("src/routes/social.tsx");
  assert.doesNotMatch(client, /META_.*ACCESS_TOKEN|graph\.facebook\.com|graph\.threads/);
  assert.doesNotMatch(route, /graph\.facebook\.com|graph\.threads/);
  assert.doesNotMatch(route, /ig-secret-token|threads-secret-token/);
  assert.match(client, /credentials: "include"/);
  assert.match(client, /fetch\("\/api\/owner-session"/);
  assert.match(client, /social\.status/);
  assert.match(client, /social\.publish/);
});

test("validation preserves platform-specific limits", () => {
  assert.throws(
    () => validateSocialPost({ text: "text only", channels: ["instagram"] }),
    (error) => error?.code === "INSTAGRAM_IMAGE_REQUIRED",
  );
  assert.throws(
    () => validateSocialPost({ text: "𠮷".repeat(126), channels: ["threads"] }),
    (error) => error?.code === "THREADS_TEXT_TOO_LONG",
  );
  assert.throws(
    () => validateSocialPost({ text: "hello", imageUrl: "http://localhost/private.png", channels: ["threads"] }),
    (error) => error?.code === "INVALID_IMAGE_URL",
  );
  assert.deepEqual(
    validateSocialPost({ text: " hello ", imageUrl: "https://stone-zhaowu-official.vercel.app/og-preview.png", channels: ["threads", "threads"] }).channels,
    ["threads"],
  );
});

test("one request creates and publishes one container per selected platform", async () => {
  const calls = [];
  const fakeFetch = async (url, init) => {
    const values = Object.fromEntries(new URLSearchParams(String(init.body)));
    calls.push({ url: String(url), values });
    const isPublish = String(url).endsWith("_publish");
    return new Response(JSON.stringify({ id: isPublish ? `published-${calls.length}` : `container-${calls.length}` }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  const results = await publishSocialPost({
    text: "昭梧測試",
    imageUrl: "https://stone-zhaowu-official.vercel.app/og-preview.png",
    altText: "昭梧",
    channels: ["threads", "instagram"],
  }, configuredEnv, fakeFetch);
  assert.equal(results.threads.ok, true);
  assert.equal(results.instagram.ok, true);
  assert.equal(calls.length, 4);
  assert.ok(calls.some((call) => call.url === "https://graph.threads.net/v1.0/threads-user/threads" && call.values.media_type === "IMAGE"));
  assert.ok(calls.some((call) => call.url === "https://graph.threads.net/v1.0/threads-user/threads_publish" && call.values.creation_id));
  assert.ok(calls.some((call) => call.url === "https://graph.facebook.com/v26.0/ig-user/media" && call.values.caption === "昭梧測試"));
  assert.ok(calls.some((call) => call.url === "https://graph.facebook.com/v26.0/ig-user/media_publish" && call.values.creation_id));
});

test("one Threads publish can target multiple OAuth accounts without exposing tokens", async () => {
  const calls = [];
  const fakeFetch = async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method || "GET" });
    if ((init.method || "GET") === "GET") {
      const username = String(url).includes("thread-user-2") ? "second" : "first";
      return new Response(JSON.stringify({ id: "profile", username }), { status: 200 });
    }
    return new Response(JSON.stringify({ id: String(url).endsWith("_publish") ? "published" : "container" }), { status: 200 });
  };
  const results = await publishSocialPost({ text: "昭梧", channels: ["threads"] }, {}, fakeFetch, [
    { id: "account-1", userId: "thread-user-1", username: "first", accessToken: "secret-one" },
    { id: "account-2", userId: "thread-user-2", username: "second", accessToken: "secret-two" },
  ]);
  assert.equal(results.threads.ok, true);
  assert.deepEqual(results.threads.accounts.map((item) => item.username), ["first", "second"]);
  assert.equal(calls.filter((call) => call.method === "POST").length, 4);
  assert.doesNotMatch(JSON.stringify(results), /secret-one|secret-two/);
});

test("Threads OAuth state and stored tokens are authenticated and encrypted", () => {
  const env = {
    META_APP_ID: "1234567890",
    META_APP_SECRET: "app-secret-for-unit-test-123456",
    ZHAOWU_OWNER_BRIDGE_SECRET: "bridge-secret-for-unit-test-123456",
    PUBLIC_SITE_ORIGIN: "https://zhao-wu.com",
  };
  const authorization = createThreadsAuthorization(env, 1_000_000, "sealed-owner-proof");
  assert.equal(new URL(authorization.url).searchParams.get("redirect_uri"), "https://zhao-wu.com/api/owner-session?action=threads.callback");
  const state = new URL(authorization.url).searchParams.get("state");
  const cookieValue = decodeURIComponent(authorization.cookie.match(/=([^;]+)/)[1]);
  const request = { headers: { cookie: `__Host-zhaowu_threads_oauth=${encodeURIComponent(cookieValue)}` } };
  assert.equal(verifyThreadsAuthorization(request, state, env, 1_000_001), true);
  assert.equal(threadsAuthorizationOwnerProof(request), "sealed-owner-proof");
  assert.equal(verifyThreadsAuthorization(request, `${state}x`, env, 1_000_001), false);
  const encrypted = encryptThreadsAccessToken("threads-user-token", env);
  assert.match(encrypted, /^v1\./);
  assert.doesNotMatch(encrypted, /threads-user-token/);
  assert.equal(decryptThreadsAccessToken(encrypted, env), "threads-user-token");
});

test("locked target handles reject the wrong Meta account before any publish call", async () => {
  const calls = [];
  const env = {
    ...configuredEnv,
    META_TARGET_INSTAGRAM_USERNAME: "fkofflove",
    META_TARGET_THREADS_USERNAME: "fkofflove",
  };
  const fakeFetch = async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method || "GET" });
    if ((init.method || "GET") === "GET") {
      const username = String(url).includes("graph.threads.net") ? "otherthreads" : "fkofflove";
      return new Response(JSON.stringify({ id: "profile", username }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ id: "should-not-publish" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  const results = await publishSocialPost({
    text: "test",
    imageUrl: "https://stone-zhaowu-official.vercel.app/og-preview.png",
    channels: ["threads"],
  }, env, fakeFetch);
  assert.equal(results.threads.ok, false);
  assert.equal(results.threads.code, "META_ACCOUNT_MISMATCH");
  assert.match(results.threads.message, /@otherthreads/);
  assert.match(results.threads.message, /@fkofflove/);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, "GET");
});

test("partial failures are explicit and tokens are scrubbed", async () => {
  const fakeFetch = async (url, init) => {
    const values = Object.fromEntries(new URLSearchParams(String(init.body)));
    if (String(url).includes("graph.threads.net")) {
      return new Response(JSON.stringify({ error: { message: `bad access_token=${values.access_token}` } }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ id: String(url).endsWith("media_publish") ? "ig-post" : "ig-container" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  const results = await publishSocialPost({
    text: "test",
    imageUrl: "https://stone-zhaowu-official.vercel.app/og-preview.png",
    channels: ["threads", "instagram"],
  }, configuredEnv, fakeFetch);
  assert.equal(results.instagram.ok, true);
  assert.equal(results.threads.ok, false);
  assert.doesNotMatch(results.threads.message, /threads-secret-token/);
  assert.match(results.threads.message, /\[hidden\]/);
});

test("owner endpoint is protected, consolidated, and stays within the Hobby function cap", async () => {
  const api = await source("api/owner-session.js");
  const vercel = JSON.parse(await source("vercel.json"));
  const apiFiles = (await readdir(new URL("api/", root))).filter((name) => name.endsWith(".js"));
  assert.match(api, /requestHasOwnerSession/);
  assert.match(api, /requestIsSameOrigin/);
  assert.match(api, /from ["']\.\.\/lib\/owner-session-cookie\.js["']/);
  assert.match(await source("lib/owner-session-cookie.js"), /timingSafeEqual/);
  assert.match(api, /Cache-Control.*no-store/s);
  assert.match(api, /social\.status/);
  assert.match(api, /social\.publish/);
  assert.match(api, /social\.threads\.connect/);
  assert.match(api, /threads\.callback/);
  assert.equal(vercel.functions["api/owner-session.js"].maxDuration, 60);
  assert.equal(vercel.functions["api/owner-social.js"], undefined);
  assert.ok(apiFiles.length <= 12);
});

test("the owner console embeds the existing gallery-backed dual social publisher", async () => {
  const account = await source("src/routes/account.tsx");
  const panel = await source("src/components/owner/autopublish-panel.tsx");
  const route = await source("src/routes/social.tsx");
  const userState = await source("src/lib/auth/use-current-user.ts");
  // 2026-10-16: the console rebuild puts auto-publishing first and keeps the manual publisher inside it.
  assert.match(account, /<AutopublishPanel/);
  assert.match(panel, /<SocialPublisherPage embedded/);
  assert.match(panel, /Instagram/);
  assert.match(route, /data-owner-social-publisher/);
  assert.match(route, /configuration\.targets/);
  assert.match(route, /useCurrentUserState/);
  assert.match(route, /listOwnerGalleryAssets/);
  assert.match(route, /uploadGalleryAsset/);
  assert.match(route, /一次發到多個帳號/);
  assert.match(route, /data-threads-account-manager/);
  assert.match(route, /startThreadsConnection/);
  assert.match(route, /Instagram 需要一張圖片；請從圖庫選擇或直接上傳/);
  assert.doesNotMatch(route, /完成一次 Meta 授權後/);
  assert.match(userState, /"\/social"/);
  assert.match(route, /data-xiaohongshu-helper/);
  assert.match(route, /navigator\.clipboard\.writeText/);
  assert.match(route, /xiaohongshu\.com\/explore/);
});

test("the root no longer mounts the duplicate DOM-scanning owner console organizer", async () => {
  const root = await source("src/routes/__root.tsx");
  assert.doesNotMatch(root, /OwnerConsoleOrganizer/);
});


test("unconfigured production does not pretend the Meta publisher is ready", async () => {
  const route = await source("src/routes/social.tsx");
  assert.match(route, /data-social-connection-required/);
  assert.match(route, /Meta 尚未連接/);
  assert.match(route, /連接帳號/);
  assert.doesNotMatch(route, /META_.*ACCESS_TOKEN/);
});
