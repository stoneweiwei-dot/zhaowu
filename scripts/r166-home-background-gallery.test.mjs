import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r166 makes the fixed Song landscape visibly present without weakening paper surfaces", async () => {
  const design = await source("src/zhaowu-design-system.css");
  assert.match(design, /url\('\/wallpaper-song\.jpg'\) center 72% \/ cover no-repeat/);
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
