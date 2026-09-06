import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const music = await readFile(new URL("../src/components/background-music.tsx", import.meta.url), "utf8");
const manager = await readFile(new URL("../src/components/owner-background-music-manager.tsx", import.meta.url), "utf8");
const assets = await readFile(new URL("../src/lib/background-music-assets.ts", import.meta.url), "utf8");
const upload = await readFile(new URL("../src/lib/background-music-upload.ts", import.meta.url), "utf8");
const organizer = await readFile(new URL("../src/components/owner-console-organizer.tsx", import.meta.url), "utf8");
const gallery = await readFile(new URL("../src/components/owner-gallery-manager.tsx", import.meta.url), "utf8");
const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");
const root = await readFile(new URL("../src/routes/__root.tsx", import.meta.url), "utf8");

test("background music keeps the verified AAC fallback and honors the active asset MIME type", () => {
  assert.match(music, /jingfo-shengyuan-aac\.m4a/);
  assert.match(music, /getActiveBackgroundMusic/);
  assert.match(music, /musicPublicUrl/);
  assert.match(music, /DEFAULT_VOLUME = 0\.24/);
  assert.match(music, /primaryType = asset\?\.content_type/);
  assert.match(music, /fallbackType = asset\?\.fallback_content_type/);
  assert.match(music, /type=\{primaryType\}/);
  assert.match(music, /type=\{fallbackType\}/);
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

test("owner music manager stays inside AuthProvider so the owner session is visible", () => {
  assert.doesNotMatch(music, /OwnerBackgroundMusicManager/);
  assert.match(root, /import \{ OwnerBackgroundMusicManager \}/);
  assert.match(root, /<AuthProvider>[\s\S]*<OwnerBackgroundMusicManager \/>[\s\S]*<\/AuthProvider>/);
  assert.match(manager, /data-owner-background-music-manager/);
  assert.match(manager, /user\?\.isOwner/);
  assert.match(manager, /session/);
});

test("owner music upload no longer waits forever at three percent", () => {
  assert.match(manager, /uploadBackgroundMusicResilient/);
  assert.match(manager, /不會一直卡在 3%/);
  assert.match(upload, /CORE_LOAD_TIMEOUT_MS = 28_000/);
  assert.match(upload, /FFMPEG_PROVIDERS/);
  assert.match(upload, /cdn\.jsdelivr\.net/);
  assert.match(upload, /esm\.sh/);
  assert.match(upload, /withTimeout/);
  assert.match(upload, /頁面已停止等待，不會一直卡在 3%/);
});

test("owner music upload bypasses transcoding for already web-safe MP3 and AAC M4A", () => {
  assert.match(upload, /isDirectMp3/);
  assert.match(upload, /isDirectAacM4a/);
  assert.match(upload, /containsAscii\(probe, "ftyp"\)/);
  assert.match(upload, /containsAscii\(probe, "mp4a"\)/);
  assert.match(upload, /MP3 已是網站高相容格式，略過轉碼/);
  assert.match(upload, /偵測到標準 AAC\/M4A，略過手機轉碼/);
  assert.match(upload, /aac-m4a-direct/);
  assert.match(upload, /audio\/mp4/);
});

test("non-web-safe owner audio uses one bounded MP3 normalization and real upload progress", () => {
  assert.match(upload, /libmp3lame/);
  assert.match(upload, /128k/);
  assert.match(upload, /48000/);
  assert.match(upload, /XMLHttpRequest/);
  assert.match(upload, /UPLOAD_TIMEOUT_MS = 120_000/);
  assert.match(upload, /content_type: prepared\.contentType/);
  assert.match(upload, /fallback_storage_path: null/);
  assert.match(upload, /activate_background_music|activateBackgroundMusic/);
  assert.match(upload, /deleteMetadata/);
  assert.match(assets, /zhaowu-music-change/);
});

test("owner console groups heavy management sections instead of spreading them down the page", () => {
  assert.match(root, /import \{ OwnerConsoleOrganizer \}/);
  assert.match(root, /<AuthProvider>[\s\S]*<OwnerConsoleOrganizer \/>[\s\S]*<\/AuthProvider>/);
  assert.match(organizer, /data-owner-console-dashboard/);
  assert.match(organizer, /OWNER CONSOLE/);
  assert.match(organizer, /BACKGROUND LIBRARY/);
  assert.match(organizer, /REPORTS/);
  assert.match(organizer, /backgroundSection\.hidden/);
  assert.match(organizer, /reportsSection\.hidden/);
  assert.match(organizer, /href="\/gallery"/);
  assert.match(organizer, /站主管理分組/);
  assert.doesNotMatch(organizer, /sections\[1\]/);
  assert.doesNotMatch(organizer, /sections\[2\]/);
});

test("owner gallery is collapsed by default and renders images in small batches", () => {
  assert.match(gallery, /const PAGE_SIZE = 18/);
  assert.match(gallery, /useState\(false\)/);
  assert.match(gallery, /data-owner-gallery-drawer/);
  assert.match(gallery, /<details/);
  assert.match(gallery, /renderedAssets = visibleAssets\.slice\(0, shown\)/);
  assert.match(gallery, /載入更多/);
  assert.match(gallery, /圖片預設收合，不再整頁鋪開/);
});

test("mobile keeps an explicit music control visible when autoplay is blocked", () => {
  assert.match(music, /\{playing \? "音樂播放中" : "播放音樂"\}/);
  assert.doesNotMatch(music, /hidden min-\[430px\]:inline/);
  assert.match(music, /onError=\{\(\) => setPlaying\(false\)\}/);
});
