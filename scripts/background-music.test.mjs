import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const music = await readFile(new URL("../src/components/background-music.tsx", import.meta.url), "utf8");
const manager = await readFile(new URL("../src/components/owner-background-music-manager.tsx", import.meta.url), "utf8");
const ownerClient = await readFile(new URL("../src/lib/owner-music-client.ts", import.meta.url), "utf8");
const ownerTranscode = await readFile(new URL("../src/lib/owner-music-transcode.ts", import.meta.url), "utf8");
const assets = await readFile(new URL("../src/lib/background-music-assets.ts", import.meta.url), "utf8");
const upload = await readFile(new URL("../src/lib/background-music-upload.ts", import.meta.url), "utf8");
const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");
const root = await readFile(new URL("../src/routes/__root.tsx", import.meta.url), "utf8");

test("background music plays the owner-uploaded track from /api/owner-music and defers fetch until a playback request", () => {
  assert.match(music, /\/api\/owner-music/);
  assert.match(music, /loadOwnerMusic/);
  assert.match(music, /jingfo-shengyuan-aac\.m4a/);
  assert.match(music, /musicPublicUrl/);
  assert.match(music, /DEFAULT_VOLUME = 0\.24/);
  assert.match(music, /audio\/mpeg/);
  assert.match(music, /loop/);
  assert.match(music, /playsInline/);
  assert.match(music, /preload="none"/);
  assert.match(music, /if \(!requested\) return;[\s\S]*void refreshAsset\(\)/);
  assert.doesNotMatch(music, /\/audio\/zhaowu-background\.m4a/);
  assert.doesNotMatch(music, /supabase\.co\/storage\/v1\/object\/public\/zhaowu-audio/);
});

test("background music is mounted globally and can unlock on the first user gesture", () => {
  assert.match(main, /import \{ BackgroundMusic \}/);
  assert.match(main, /<BackgroundMusic \/>/);
  assert.match(music, /zhaowu\.backgroundMusic\.v3/);
  assert.match(music, /const \[requested, setRequested\] = useState\(false\)/);
  assert.match(music, /window\.addEventListener\("pointerdown", unlock/);
  assert.match(music, /window\.addEventListener\("touchend", unlock/);
  assert.match(music, /setRequested\(true\)/);
  assert.match(music, /data-background-music-control/);
});

test("owner music manager is mounted inside AuthProvider so owner cookie login is visible", () => {
  assert.doesNotMatch(music, /OwnerBackgroundMusicManager/);
  assert.match(root, /import \{ OwnerBackgroundMusicManager \}/);
  assert.match(root, /<AuthProvider>[\s\S]*<OwnerBackgroundMusicManager \/>[\s\S]*<\/AuthProvider>/);
  assert.match(manager, /data-owner-background-music-manager/);
  assert.match(manager, /user\?\.isOwner/);
  assert.doesNotMatch(manager, /session\?\.access_token/);
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

test("owner console exposes cookie-gated upload without a Supabase session", () => {
  assert.match(manager, /uploadOwnerMusic/);
  assert.match(manager, /activateOwnerMusic/);
  assert.match(ownerClient, /\/api\/owner-music/);
  assert.match(ownerClient, /credentials: "include"/);
  assert.match(manager, /MP3/);
  assert.match(manager, /M4A \/ AAC/);
  assert.doesNotMatch(manager, /單檔最多 4 MB/);
  assert.match(manager, /200 MB/);
  assert.doesNotMatch(manager, /uploadBackgroundMusicResilient/);
  assert.match(upload, /native-mp3/);
  assert.match(upload, /native-aac-m4a/);
  assert.match(upload, /native-aac/);
  assert.doesNotMatch(upload, /@ffmpeg\/ffmpeg/);
  assert.match(assets, /activate_background_music/);
  assert.match(assets, /zhaowu-music-change/);
});

test("owner audio optimizer is bounded and refuses destructive low-bitrate compression", () => {
  assert.match(ownerTranscode, /CORE_LOAD_TIMEOUT_MS = 25_000/);
  assert.match(ownerTranscode, /TRANSCODE_TIMEOUT_MS = 180_000/);
  assert.match(ownerTranscode, /withTimeout/);
  assert.match(ownerTranscode, /terminate\?/);
  assert.match(ownerTranscode, /INITIAL_AAC_KBPS = 96/);
  assert.match(ownerTranscode, /MIN_AAC_KBPS = 64/);
  assert.match(ownerTranscode, /aac_low/);
  assert.match(ownerTranscode, /為避免把音質壓到明顯變差/);
});

test("mobile keeps an explicit music control visible when autoplay is blocked", () => {
  assert.match(music, /Music playing/);
  assert.match(music, /音乐播放中/);
  assert.match(music, /音樂播放中/);
  assert.match(music, /useI18n/);
  assert.doesNotMatch(music, /hidden min-\[430px\]:inline/);
  assert.match(music, /onError=\{\(\) => setPlaying\(false\)\}/);
});
