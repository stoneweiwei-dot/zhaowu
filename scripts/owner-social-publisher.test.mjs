import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { publishSocialPost, socialConfiguration, validateSocialPost } from "../lib/meta-social-publisher.js";

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
  assert.deepEqual(socialConfiguration(configuredEnv), { instagram: true, threads: true, ready: true });
  const client = await source("src/lib/owner-social-client.ts");
  const route = await source("src/routes/social.tsx");
  assert.doesNotMatch(client, /META_.*ACCESS_TOKEN|graph\.facebook\.com|graph\.threads/);
  assert.doesNotMatch(route, /META_.*ACCESS_TOKEN|graph\.facebook\.com|graph\.threads/);
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
  assert.match(api, /timingSafeEqual/);
  assert.match(api, /Cache-Control.*no-store/s);
  assert.match(api, /social\.status/);
  assert.match(api, /social\.publish/);
  assert.equal(vercel.functions["api/owner-session.js"].maxDuration, 60);
  assert.equal(vercel.functions["api/owner-social.js"], undefined);
  assert.ok(apiFiles.length <= 12);
});

test("the owner console links to the compact social publisher", async () => {
  const account = await source("src/routes/account.tsx");
  const route = await source("src/routes/social.tsx");
  assert.match(account, /to="\/social"/);
  assert.match(route, /data-owner-social-publisher/);
  assert.match(route, /user\.isOwner/);
  assert.match(route, /Instagram 需要一張公開圖片/);
  assert.doesNotMatch(route, /小紅書|小红书|抖音/);
});
