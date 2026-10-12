import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  WATERMARK_BAKED_TAG,
  WATERMARK_TEXT,
  applyBrandWatermark,
  isBakedWatermark,
  watermarkLayout,
} from "../src/lib/brand-watermark.ts";

const load = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("watermark geometry scales with the image and stays subtle", () => {
  const phone = watermarkLayout(1080, 1920);
  const big = watermarkLayout(4000, 3000);
  assert.ok(phone.cornerFont >= 14 && phone.cornerFont < 60);
  assert.ok(big.cornerFont > phone.cornerFont, "larger image, larger mark");
  assert.ok(phone.margin > 0 && phone.centreFont > phone.cornerFont);
  assert.ok(phone.angleRad < 0);
  assert.equal(WATERMARK_TEXT, "昭梧 ZHAOWU");
});

test("baked assets are recognised by tag, others are not", () => {
  assert.equal(isBakedWatermark({ tags: ["owner-upload", WATERMARK_BAKED_TAG] }), true);
  assert.equal(isBakedWatermark({ tags: ["owner-upload"] }), false);
  assert.equal(isBakedWatermark({ tags: null }), false);
  assert.equal(isBakedWatermark(undefined), false);
});

test("outside a browser the upload helper fails open and returns the original file", async () => {
  const file = new File([new Uint8Array([1, 2, 3])], "x.png", { type: "image/png" });
  const out = await applyBrandWatermark(file);
  assert.equal(out.applied, false);
  assert.equal(out.file, file);
});

test("every owner image upload path burns in the mark, and videos get the overlay instead", async () => {
  const [gallery, bridge, manager] = await Promise.all([
    load("src/lib/gallery-assets.ts"),
    load("src/lib/bridge/background-assets.ts"),
    load("src/components/owner-gallery-manager.tsx"),
  ]);
  const uploadGallery = gallery.slice(gallery.indexOf("export async function uploadGalleryAsset"));
  assert.match(uploadGallery, /if \(!isVideo\) \{\s*const marked = await applyBrandWatermark\(file\)/);
  assert.match(uploadGallery, /WATERMARK_BAKED_TAG/);
  assert.ok(uploadGallery.indexOf("applyBrandWatermark") < uploadGallery.indexOf("/storage/v1/object/"), "mark is applied before the file is uploaded");
  const uploadBg = bridge.slice(bridge.indexOf("export async function uploadBackground"));
  assert.ok(uploadBg.indexOf("applyBrandWatermark") < uploadBg.indexOf("base.uploadBackground"), "background mark is applied before either upload path");
  assert.match(manager, /skipWatermark: isBakedWatermark\(asset\)/, "copying a baked gallery image to wallpaper does not double-mark");
});

test("display-time overlay covers existing media, intro video and report sheets", async () => {
  const [css, intro, art, decree, gallery, shell] = await Promise.all([
    load("src/brand-watermark.css"),
    load("src/components/intro-gate.tsx"),
    load("src/components/customer-standard-art.tsx"),
    load("src/components/decree-gallery-preview.tsx"),
    load("src/components/auspicious-gallery-section.tsx"),
    load("src/components/site-shell.tsx"),
  ]);
  assert.match(shell, /import "@\/brand-watermark\.css"/);
  assert.match(intro, /zhaowu-wm-on/);
  assert.match(art, /zhaowu-wm/);
  assert.match(decree, /isBakedWatermark\(match\.asset\)/);
  assert.match(gallery, /zhaowu-wm/);
  assert.match(css, /zhaowu-report-continuous-sheet::after/);
  assert.match(css, /zhaowu-report-access-content\[data-report-access\]::after/);
  assert.match(css, /pointer-events: none/);
  assert.match(css, /@container \(max-width: 110px\)/, "thumbnails stay clean");
});
