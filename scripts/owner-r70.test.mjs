import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const upload = await readFile(new URL("../src/lib/background-music-upload.ts", import.meta.url), "utf8");
const manager = await readFile(new URL("../src/components/owner-background-music-manager.tsx", import.meta.url), "utf8");
const player = await readFile(new URL("../src/components/background-music.tsx", import.meta.url), "utf8");
const root = await readFile(new URL("../src/routes/__root.tsx", import.meta.url), "utf8");
const organizer = await readFile(new URL("../src/components/owner-console-organizer.tsx", import.meta.url), "utf8");
const gallery = await readFile(new URL("../src/components/owner-gallery-manager.tsx", import.meta.url), "utf8");

test("owner music upload avoids unnecessary mobile transcoding and times out cleanly", () => {
  assert.match(upload, /CORE_LOAD_TIMEOUT_MS = 28_000/);
  assert.match(upload, /UPLOAD_TIMEOUT_MS = 120_000/);
  assert.match(upload, /isDirectMp3/);
  assert.match(upload, /isDirectAacM4a/);
  assert.match(upload, /containsAscii\(probe, "ftyp"\).*containsAscii\(probe, "mp4a"\)/s);
  assert.match(upload, /codec: "mp3-direct"/);
  assert.match(upload, /codec: "aac-m4a-direct"/);
  assert.match(upload, /libmp3lame/);
  assert.match(upload, /128k/);
  assert.match(upload, /頁面已停止等待，不會一直卡在 3%/);
  assert.match(upload, /uploadBackgroundMusicResilient/);
  assert.match(manager, /uploadBackgroundMusicResilient/);
});

test("background player respects the active asset MIME instead of hard-coding mp4", () => {
  assert.match(player, /const primaryType = asset\?\.content_type \|\| "audio\/mp4"/);
  assert.match(player, /const fallbackType = asset\?\.fallback_content_type \|\| "audio\/mpeg"/);
  assert.match(player, /<source src=\{primarySrc\} type=\{primaryType\}/);
});

test("owner console is mounted inside auth and keeps long account sections collapsed", () => {
  assert.match(root, /OwnerConsoleOrganizer/);
  assert.match(root, /<AuthProvider>[\s\S]*<OwnerConsoleOrganizer \/>[\s\S]*<\/AuthProvider>/);
  assert.match(organizer, /data-owner-console-dashboard/);
  assert.match(organizer, /backgroundSection\.hidden = expanded !== "backgrounds"/);
  assert.match(organizer, /reportsSection\.hidden = expanded !== "reports"/);
  assert.match(organizer, /data-owner-background-music-manager/);
});

test("owner Gallery is collapsed by default, paginates by 18 and preserves Loading assets", () => {
  assert.match(gallery, /type OwnerView = "atlas" \| "loading" \| "all"/);
  assert.match(gallery, /const PAGE_SIZE = 18/);
  assert.match(gallery, /data-owner-gallery-drawer/);
  assert.match(gallery, /LOADING_GALLERY_CATALOG/);
  assert.match(gallery, /isLoadingGalleryAsset/);
  assert.match(gallery, /category: view === "loading" \? "loading" : "visual-library"/);
  assert.match(gallery, /setShown\(\(current\) => current \+ PAGE_SIZE\)/);
});
