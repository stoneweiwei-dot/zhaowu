import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const upload = await readFile(new URL("../src/lib/background-music-upload.ts", import.meta.url), "utf8");
const manager = await readFile(new URL("../src/components/owner-background-music-manager.tsx", import.meta.url), "utf8");
const player = await readFile(new URL("../src/components/background-music.tsx", import.meta.url), "utf8");
const root = await readFile(new URL("../src/routes/__root.tsx", import.meta.url), "utf8");
const organizer = await readFile(new URL("../src/components/owner-console-organizer.tsx", import.meta.url), "utf8");
const gallery = await readFile(new URL("../src/components/owner-gallery-manager.tsx", import.meta.url), "utf8");
const shellSource = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const account = await readFile(new URL("../src/routes/account.tsx", import.meta.url), "utf8");
const galleryRoute = await readFile(new URL("../src/routes/gallery.tsx", import.meta.url), "utf8");

test("owner music upload uses a deterministic native mobile path instead of browser ffmpeg", () => {
  assert.match(upload, /MAX_OUTPUT_BYTES = 15 \* 1024 \* 1024/);
  assert.match(upload, /UPLOAD_TIMEOUT_MS = 120_000/);
  assert.match(upload, /native-mp3/);
  assert.match(upload, /native-aac-m4a/);
  assert.match(upload, /native-aac/);
  assert.match(upload, /native-wav/);
  assert.match(upload, /native-flac/);
  assert.match(upload, /不再在 iPhone 內載入大型轉碼器/);
  assert.doesNotMatch(upload, /@ffmpeg\/ffmpeg/);
  assert.doesNotMatch(upload, /libmp3lame/);
  assert.match(upload, /uploadBackgroundMusicResilient/);
  assert.match(manager, /uploadOwnerMusic/);
});

test("background player plays owner-uploaded audio with explicit MIME types", () => {
  assert.match(player, /loadOwnerMusic/);
  assert.match(player, /\/api\/owner-music/);
  assert.match(player, /primaryType/);
  assert.match(player, /<source src=\{primarySrc\} type=\{primaryType\}/);
  assert.doesNotMatch(player, /LOCAL_PRIMARY/);
});

test("owner console is mounted inside auth and keeps long account sections collapsed", () => {
  assert.match(root, /OwnerConsoleOrganizer/);
  assert.match(root, /<AuthProvider>[\s\S]*<OwnerConsoleOrganizer \/>[\s\S]*<\/AuthProvider>/);
  assert.match(organizer, /data-owner-console-dashboard/);
  assert.match(organizer, /backgroundSection\.hidden = expanded !== "backgrounds"/);
  assert.match(organizer, /reportsSection\.hidden = expanded !== "reports"/);
  assert.match(organizer, /data-owner-background-music-manager/);
});

test("owner Gallery keeps content media separate from login/loading assets", () => {
  assert.match(gallery, /type OwnerView = "atlas" \| "all"/);
  assert.match(gallery, /const PAGE_SIZE = 18/);
  assert.match(gallery, /isLoadingGalleryAsset/);
  assert.match(gallery, /!isLoadingGalleryAsset\(asset\)/);
  assert.doesNotMatch(gallery, /LOADING_GALLERY_CATALOG/);
  assert.doesNotMatch(gallery, /view === "loading"/);
  assert.match(gallery, /setShown\(\(current\) => current \+ PAGE_SIZE\)/);
});


test("owner workspace hides public counters, dragon guide and technical status walls", () => {
  assert.match(shellSource, /const isOwnerWorkspace = Boolean/);
  assert.match(shellSource, /!isOwnerWorkspace \? \(/);
  assert.match(shellSource, /!isLogin && !isOwnerWorkspace \? <GreenDragonGuide/);
  assert.doesNotMatch(account, /402 spend cap|Supabase Auth/);
  assert.doesNotMatch(galleryRoute, /BrandUiLibrary/);
  assert.doesNotMatch(galleryRoute, /spend cap|Supabase data session/);
  assert.doesNotMatch(galleryRoute, /系統內置小素材不在這裡展示|系统内置小素材不在这里展示/);
  assert.match(galleryRoute, /data-owner-gallery-console/);
});
