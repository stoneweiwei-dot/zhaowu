import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r135 CSS is last-wins and keeps paper cards opaque with dark ink at night", async () => {
  const main = await source("src/main.tsx");
  const css = await source("src/night-readability-r135.css");
  const shell = await source("src/components/site-shell.tsx");
  assert.match(main, /night-readability-r135\.css/);
  assert.ok(main.indexOf("night-home-r129.css") < main.indexOf("night-readability-r135.css"));
  assert.match(css, /zhaowu-header-primary \.zhaowu-brand-name/);
  assert.match(css, /clip: rect\(0, 0, 0, 0\)/);
  assert.match(css, /#life-view \.font-display/);
  assert.match(css, /html\[data-zw-theme="night"\] \.zhaowu-app-frame #life-view/);
  assert.match(css, /html\[data-zw-theme="night"\] \.zhaowu-app-frame \.seal-border \.text-ink/);
  assert.match(css, /html\[data-zw-theme="night"\] \.zhaowu-has-wallpaper \.zhaowu-app-frame \.seal-border/);
  assert.match(css, /color: #1a1814 !important/);
  assert.match(css, /background: #f3ead8 !important/);
  assert.match(css, /backdrop-filter: none !important/);
  assert.match(css, /life-view-broken-image/);
  assert.match(shell, /aria-hidden="true"/);
  assert.match(shell, /zhaowu-brand-name/);
});

test("Guan Shi Lu titles stay in the collapsed row and hex cream is gone", async () => {
  const home = await source("src/components/life-view-home-section.tsx");
  const full = await source("src/components/life-view-section.tsx");
  const article = await source("src/lib/life-view-long-form/face-mind-cultivation.ts");
  const svg = await source("public/articles/face-mind-cultivation-2026-09-14.svg");
  assert.match(home, /id="life-view"/);
  assert.match(home, /bg-paper/);
  assert.doesNotMatch(home, /bg-\[#fbf5e9\]/);
  assert.match(home, /article\.title\[locale\]/);
  assert.match(home, /life-view-broken-image/);
  assert.match(full, /bg-paper/);
  assert.match(full, /life-view-broken-image/);
  assert.match(article, /face-mind-cultivation-2026-09-14\.svg/);
  assert.match(svg, /<svg/);
  assert.match(svg, /STONE/);
});

test("owner music skips iPhone decode for MP3/M4A and uploads in chunks", async () => {
  const transcoder = await source("src/lib/owner-music-transcode.ts");
  const native = await source("src/lib/owner-music-native-encode.ts");
  const client = await source("src/lib/owner-music-client.ts");
  const api = await source("api/owner-music.js");
  const git = await source("lib/owner-music-git.js");
  const vercel = JSON.parse(await source("vercel.json"));
  const manager = await source("src/components/owner-background-music-manager.tsx");
  assert.match(transcoder, /MAX_OWNER_UPLOAD_BYTES = 12 \* 1024 \* 1024/);
  assert.match(transcoder, /NATIVE_DECODE_TIMEOUT_MS = 12_000/);
  assert.match(transcoder, /isBrowserSafeAudio/);
  assert.match(transcoder, /已是網站可播放格式，直接上傳原檔/);
  assert.doesNotMatch(transcoder, /file\.size <= TARGET_UPLOAD_BYTES &&/);
  assert.match(native, /setTimeout\(resolve, 1200\)/);
  assert.match(client, /OWNER_MUSIC_CHUNK_BYTES = 3_000_000/);
  assert.match(client, /x-zhaowu-music-upload-id/);
  assert.match(client, /uploadInChunks/);
  assert.match(api, /saveOwnerMusicChunk/);
  assert.match(api, /x-zhaowu-music-chunk-index/);
  assert.match(git, /MAX_BYTES = 12 \* 1024 \* 1024/);
  assert.match(git, /saveOwnerMusicChunk/);
  assert.match(git, /SCRATCH_DIR/);
  assert.equal(vercel.functions["api/owner-music.js"].maxDuration, 60);
  assert.match(manager, /12MB/);
  assert.match(manager, /分段上傳/);
});
