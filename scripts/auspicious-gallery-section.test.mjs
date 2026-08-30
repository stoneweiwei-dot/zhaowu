import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("home exposes the public auspicious atlas while owner gallery remains separate", async () => {
  const home = await source("src/routes/index.tsx");
  const atlas = await source("src/components/auspicious-gallery-section.tsx");
  const groups = await source("src/lib/gallery-groups.ts");
  const owner = await source("src/components/owner-gallery-manager.tsx");
  const ownerRoute = await source("src/routes/gallery.tsx");

  assert.match(home, /AuspiciousGallerySection/);
  assert.match(home, /<AuspiciousGallerySection\s*\/\>/);
  assert.match(atlas, /昭梧吉象圖鑑/);
  assert.match(atlas, /Zhaowu Auspicious Atlas/);
  assert.match(atlas, /listPublicGalleryAssets\("visual-library"\)/);
  assert.match(atlas, /aspect-\[9\/16\]/);
  assert.match(atlas, /loading="lazy"/);
  assert.match(groups, /library-buddhist-/);
  assert.match(groups, /library-daoist-/);
  assert.match(groups, /library-guardian-beast-/);
  assert.match(groups, /library-auspicious-/);
  assert.match(groups, /library-report-art-/);
  assert.match(owner, /atlas/);
  assert.match(ownerRoute, /if \(!user\.isOwner\)/);
});
