import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r166 makes the fixed Song landscape visibly present without weakening paper surfaces", async () => {
  const design = await source("src/zhaowu-design-system.css");
  assert.match(design, /var\(--zhaowu-shell-wallpaper, url\('\/wallpaper-song\.jpg'\)\) center 72% \/ cover no-repeat/);
  assert.match(design, /\.zhaowu-home-sheet-shell::before[\s\S]*opacity: \.98;/);
  assert.match(design, /\.zhaowu-home-sheet-shell \.zhaowu-customer-record[\s\S]*background: #fffaf1 !important;/);
});

test("r166 removes the atlas from the homepage only", async () => {
  const home = await source("src/routes/index.tsx");
  const atlasRoute = await source("src/routes/auspicious-atlas.tsx");
  const ownerRoute = await source("src/routes/gallery.tsx");
  assert.doesNotMatch(home, /AuspiciousGallerySection|home-gallery|galleryTitle|galleryHint/);
  assert.match(atlasRoute, /createFileRoute\("\/auspicious-atlas"\)/);
  assert.match(ownerRoute, /createFileRoute\("\/gallery"\)/);
  assert.match(ownerRoute, /if \(!user\.isOwner\)/);
});


test("owner-selected homepage wallpaper is consumed and remains visible on the live homepage", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const account = await source("src/routes/account.tsx");
  const hero = await source("src/home-hero-v1.css");
  const gallery = await source("src/components/owner-gallery-manager.tsx");
  assert.match(shell, /listPublicBackgrounds/);
  assert.match(shell, /chooseDailyBackground/);
  assert.match(shell, /--zhaowu-shell-wallpaper/);
  assert.match(shell, /zhaowu-background-change/);
  assert.match(gallery, /setAsHomepageBackground/);
  assert.match(gallery, /uploadBackground/);
  assert.match(gallery, /setBackgroundWallpaper/);
  assert.doesNotMatch(account, /onClick=\{\(\) => setOwnerView\("backgrounds"\)\}/);
  assert.match(account, /ownerView !== "backgrounds"/);
  assert.match(account, /setBackgroundHistoryOpen\(true\)/);
  assert.match(account, /loadBackgroundHistory\(0\)/);
  const bridge = await source("src/lib/bridge/background-assets.ts");
  assert.match(bridge, /publicBackgroundFallbackPage/);
  assert.match(bridge, /listPublicBackgrounds\(\)/);
  assert.match(account, /files\.length === 1/);
  assert.match(account, /setBackgroundWallpaper\(session, singleUploadedAsset\.id\)/);
  assert.match(hero, /\.zw-hero-home\s*\{[^}]*background:\s*transparent;/s);
  assert.match(hero, /\.zhaowu-home-sheet-shell\.zhaowu-route-home::before\s*\{[^}]*var\(--zhaowu-shell-wallpaper/s);
  assert.match(hero, /\.zw-hero-carousel-controls\s*\{[^}]*display:\s*flex;/s);
  assert.match(hero, /\.zw-hero-dots\s*\{[^}]*display:\s*flex !important;/s);
});
