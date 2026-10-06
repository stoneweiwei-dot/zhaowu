import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const upload = await readFile(new URL("../src/lib/background-music-upload.ts", import.meta.url), "utf8");
const manager = await readFile(new URL("../src/components/owner-background-music-manager.tsx", import.meta.url), "utf8");
const player = await readFile(new URL("../src/components/background-music.tsx", import.meta.url), "utf8");
const root = await readFile(new URL("../src/routes/__root.tsx", import.meta.url), "utf8");
const gallery = await readFile(new URL("../src/components/owner-gallery-manager.tsx", import.meta.url), "utf8");
const shellSource = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const account = await readFile(new URL("../src/routes/account.tsx", import.meta.url), "utf8");
const galleryRoute = await readFile(new URL("../src/routes/gallery.tsx", import.meta.url), "utf8");
const loginVisuals = await readFile(new URL("../src/components/owner-login-visuals-manager.tsx", import.meta.url), "utf8");
const publicAtlas = await readFile(new URL("../src/lib/public-atlas.ts", import.meta.url), "utf8");
const galleryGroups = await readFile(new URL("../src/lib/gallery-groups.ts", import.meta.url), "utf8");

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

test("owner console keeps one canonical account navigation without the old portal organizer", () => {
  assert.doesNotMatch(root, /OwnerConsoleOrganizer/);
  assert.match(root, /<AuthProvider>[\s\S]*<OwnerBackgroundMusicManager \/>[\s\S]*<\/AuthProvider>/);
  assert.match(account, /Instagram／Threads/);
  assert.match(account, /ownerView === "backgrounds"/);
  assert.match(account, /ownerView === "reports"/);
});

test("owner Gallery separates protected Song assets from uploads and legacy material", () => {
  assert.match(gallery, /useState<OwnerGalleryGroup>\("song-master"\)/);
  assert.match(gallery, /const PAGE_SIZE = 18/);
  assert.match(gallery, /asset\.category === "visual-library"/);
  assert.match(gallery, /OWNER_GALLERY_GROUP_ORDER/);
  assert.match(gallery, /matchesOwnerGalleryGroup/);
  assert.match(gallery, /正式宋式母圖/);
  assert.match(gallery, /十天干/);
  assert.match(gallery, /十二地支／月令/);
  assert.match(gallery, /五行運圖/);
  assert.match(gallery, /吉祥紋樣/);
  assert.match(gallery, /私人上傳/);
  assert.match(gallery, /舊素材/);
  assert.match(gallery, /核心資產/);
  assert.match(gallery, /selectedDeletableIds/);
  assert.doesNotMatch(gallery, /LOADING_GALLERY_CATALOG/);
  assert.match(gallery, /setShown\(\(current\) => current \+ PAGE_SIZE\)/);

  assert.match(galleryGroups, /export type OwnerGalleryGroup/);
  assert.match(galleryGroups, /"song-master"/);
  assert.match(galleryGroups, /hasTag\(asset, "day-master"\)/);
  assert.match(galleryGroups, /hasTag\(asset, "month-command"\)/);
  assert.match(galleryGroups, /hasTag\(asset, "luck-five-elements"\)/);
  assert.match(galleryGroups, /asset\.bucket_id === "zhaowu-backgrounds"/);
  assert.match(galleryGroups, /asset\.bucket_id === "zhaowu-gallery"/);
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


test("owner file managers expose persistent bulk actions with explicit text selection states", () => {
  assert.match(manager, /data-owner-bulk-toolbar="music"/);
  assert.match(manager, /batchManage/);
  assert.match(manager, /aria-pressed=\{selected\}/);
  assert.doesNotMatch(manager, /type="checkbox" className="h-4 w-4" disabled=\{busy \|\| track\.enabled\}/);

  assert.match(gallery, /data-owner-bulk-toolbar="gallery"/);
  assert.match(gallery, /setSelectedIds\(visibleAssets\.map/);
  assert.match(gallery, /copy\.shown : copy\.hidden/);
  assert.doesNotMatch(gallery, /type="checkbox" className="h-4 w-4" checked=\{selectedIds\.includes\(asset\.id\)\}/);

  assert.match(loginVisuals, /data-owner-bulk-toolbar="login-visuals"/);
  assert.match(loginVisuals, /batchManage/);
  assert.doesNotMatch(loginVisuals, /type="checkbox" className="h-4 w-4" checked=\{selectedIds\.includes\(asset\.id\)\}/);

  assert.match(account, /data-owner-bulk-toolbar="backgrounds"/);
  assert.match(account, /data-owner-bulk-toolbar="reports"/);
  assert.match(account, /selectedOne/);
  assert.doesNotMatch(account, /type="checkbox" className="h-4 w-4" checked=\{selectedReportIds\.includes\(row\.id\)\}/);
});

test("customer-facing atlas keeps only restrained Song-jade motifs", () => {
  assert.match(publicAtlas, /ornament-crane/);
  assert.match(publicAtlas, /ornament-dragon/);
  assert.match(publicAtlas, /ornament-lotus/);
  assert.match(publicAtlas, /ornament-phoenix/);
  assert.doesNotMatch(publicAtlas, /celestial-pearl|endless-knot|pomegranate|twin-fish/);
});
