import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// A Vercel ENOSPC failure surfaced as Node's generic AggregateError.message
// ("There are multiple errors...") dumped verbatim into the owner console's
// error banner — a huge unreadable block instead of a clean status line.
// Guards: the write API extracts a short, concrete detail (first inner error,
// capped length) instead of the AggregateError wrapper text; the client caps
// it again; the UI clamps the rendered line so no future error can dominate
// the panel regardless of what the API sends.

const root = new URL("..", import.meta.url);
const source = (rel) => readFile(new URL(rel, root), "utf8");

test("owner-music-write caps and unwraps error detail", async () => {
  const api = await source("api/owner-music-write.js");
  assert.match(api, /function shortErrorDetail/);
  assert.match(api, /detail: shortErrorDetail\(error\)/);
  assert.match(api, /Array\.isArray\(value\.errors\)/, "must unwrap AggregateError.errors instead of using its generic .message");
  assert.match(api, /DETAIL_MAX = 160/);
});

test("owner-music-client caps detail length before composing the message", async () => {
  const client = await source("src/lib/owner-music-client.ts");
  assert.match(client, /UPLOAD_ERROR_DETAIL_MAX/);
  assert.match(client, /detail\.length > UPLOAD_ERROR_DETAIL_MAX/);
});

test("owner background music manager clamps the error banner", async () => {
  const manager = await source("src/components/owner-background-music-manager.tsx");
  assert.match(manager, /line-clamp-3.*text-cinnabar/);
});

test("missing write configuration reaches the visible owner alert", async () => {
  const [api, client, manager] = await Promise.all(["api/owner-music-write.js", "src/lib/owner-music-client.ts", "src/components/owner-background-music-manager.tsx"].map(source));
  assert.match(api, /503, \{ ok: false, error: error.code, detail: error.message/);
  assert.match(client, /MUSIC_WRITE_UNCONFIGURED.*只需請助理設定 ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN/);
  assert.match(manager, /role="alert"[^>]*>\{errorMessage.includes\("ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN"\) \? errorMessage/);
});

test("single and chunked uploads identify missing configuration before repository access", async () => {
  const { randomUUID } = await import("node:crypto");
  const { saveOwnerMusicTrack, saveOwnerMusicChunk } = await import("../lib/owner-music-git.js");
  const key = "ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN";
  const previous = process.env[key];
  delete process.env[key];
  try {
    for (const upload of [saveOwnerMusicTrack, saveOwnerMusicChunk]) {
      await assert.rejects(upload({ kind: "device", deviceId: randomUUID() }, {}), { code: "MUSIC_WRITE_UNCONFIGURED" });
    }
  } finally {
    if (previous !== undefined) process.env[key] = previous;
  }
});
