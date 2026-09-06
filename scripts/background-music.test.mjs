import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const music = await readFile(new URL("../src/components/background-music.tsx", import.meta.url), "utf8");
const manager = await readFile(new URL("../src/components/owner-background-music-manager.tsx", import.meta.url), "utf8");
const assets = await readFile(new URL("../src/lib/background-music-assets.ts", import.meta.url), "utf8");
const upload = await readFile(new URL("../src/lib/background-music-upload.ts", import.meta.url), "utf8");
const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");
const root = await readFile(new URL("../src/routes/__root.tsx", import.meta.url), "utf8");

test("background music keeps the verified AAC as a safe fallback and reads the active Supabase asset", () => {
  assert.match(music, /jingfo-shengyuan-aac\.m4a/);
  assert.match(music, /getActiveBackgroundMusic/);
  assert.match(music, /musicPublicUrl/);
  assert.match(music, /DEFAULT_VOLUME = 0\.24/);
  assert.match(music, /audio\/mp4/);
  assert.match(music, /audio\/mpeg/);
  assert.match(music, /loop/);
  assert.match(music, /playsInline/);
  assert.match(music, /preload="metadata"/);
});

test("background music is mounted globally and unlocks on an iPhone Safari user gesture", () => {
  assert.match(main, /import \{ BackgroundMusic \}/);
  assert.match(main, /<BackgroundMusic \/>/);
  assert.match(music, /zhaowu\.backgroundMusic\.v1/);
  assert.match(music, /touchstart/);
  assert.match(music, /pointerdown/);
  assert.match(music, /touchend/);
  assert.match(music, /keydown/);
  assert.match(music, /data-background-music-control/);
});

test("owner music manager is mounted inside AuthProvider so owner session is visible", () => {
  assert.doesNotMatch(music, /OwnerBackgroundMusicManager/);
  assert.match(root, /import \{ OwnerBackgroundMusicManager \}/);
  assert.match(root, /<AuthProvider>[\s\S]*<OwnerBackgroundMusicManager \/>[\s\S]*<\/AuthProvider>/);
  assert.match(manager, /data-owner-background-music-manager/);
  assert.match(manager, /user\?\.isOwner/);
  assert.match(manager, /session/);
});

test("owner music manager is visibly embedded in the account console with a high-z fallback", () => {
  assert.match(manager, /createPortal/);
  assert.match(manager, /main > section:first-child/);
  assert.match(manager, /data-owner-background-music-inline/);
  assert.match(manager, /startsWith\("\/account\/"\)/);
  assert.match(manager, /w-full/);
  assert.match(manager, /z-\[88\]/);
  assert.match(manager, /z-\[100\]/);
  assert.match(manager, /背景音樂管理/);
  assert.match(manager, /站主專用/);
});

test("owner console exposes direct native upload and no-deploy track switching", () => {
  assert.match(manager, /uploadBackgroundMusicResilient/);
  assert.match(manager, /activateBackgroundMusic/);
  assert.match(manager, /MP3/);
  assert.match(manager, /M4A \/ AAC/);
  assert.match(manager, /15 MB/);
  assert.match(upload, /native-mp3/);
  assert.match(upload, /native-aac-m4a/);
  assert.match(upload, /native-aac/);
  assert.doesNotMatch(upload, /@ffmpeg\/ffmpeg/);
  assert.match(assets, /activate_background_music/);
  assert.match(assets, /zhaowu-music-change/);
});

test("mobile keeps an explicit music control visible when autoplay is blocked", () => {
  assert.match(music, /\{playing \? "音樂播放中" : "播放音樂"\}/);
  assert.doesNotMatch(music, /hidden min-\[430px\]:inline/);
  assert.match(music, /onError=\{\(\) => setPlaying\(false\)\}/);
});
