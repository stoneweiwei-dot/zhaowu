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


test("owner-selected homepage wallpaper is consumed by the live SiteShell", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const account = await source("src/routes/account.tsx");
  assert.match(shell, /listPublicBackgrounds/);
  assert.match(shell, /chooseDailyBackground/);
  assert.match(shell, /--zhaowu-shell-wallpaper/);
  assert.match(shell, /zhaowu-background-change/);
  assert.match(account, /setBackgroundHistoryOpen\(true\)/);
  assert.match(account, /loadBackgroundHistory\(0\)/);
  assert.match(account, /text-\[#fffaf0\]/);
});
