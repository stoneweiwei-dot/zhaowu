import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r167 restores mineral colour and depth without weakening readable paper", async () => {
  const design = await source("src/zhaowu-design-system.css");
  assert.match(design, /--zw-pine-deep: #174b39;/);
  assert.match(design, /--zw-mineral-gold: #a87731;/);
  assert.match(design, /--zw-cinnabar-deep: #973b2f;/);
  assert.match(design, /filter: saturate\(\.92\) contrast\(1\.04\) sepia\(\.08\);/);
  assert.match(design, /box-shadow: 0 16px 42px rgba\(58, 43, 24, \.10\), inset 0 3px 0 rgba\(23, 75, 57, \.86\) !important;/);
  assert.match(design, /background: #fffaf1 !important;/);
});

test("r167 keeps the richer surface mobile-readable and preserves the hidden homepage atlas", async () => {
  const design = await source("src/zhaowu-design-system.css");
  const home = await source("src/routes/index.tsx");
  assert.match(design, /@media \(max-width: 430px\)/);
  assert.match(design, /font-size: 16px !important;/);
  assert.doesNotMatch(home, /AuspiciousGallerySection|home-gallery/);
});
