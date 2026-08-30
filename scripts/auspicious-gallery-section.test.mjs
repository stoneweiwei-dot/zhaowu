import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("home exposes one mixed public auspicious atlas while owner gallery stays one upload surface", async () => {
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
  assert.doesNotMatch(atlas, /role="tablist"/);
  assert.match(groups, /library-buddhist-/);
  assert.match(groups, /library-daoist-/);
  assert.match(groups, /library-guardian-beast-/);
  assert.match(groups, /library-auspicious-/);
  assert.match(groups, /library-report-art-/);
  assert.match(owner, /分類、五行、用途、客戶匹配與背景調用都由系統在後台處理/);
  assert.doesNotMatch(owner, /聖像.*道韻.*瑞獸/s);
  assert.match(ownerRoute, /if \(!user\.isOwner\)/);
});
