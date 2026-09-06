import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const assets = await readFile(new URL("../src/lib/report/report-visual-assets.ts", import.meta.url), "utf8");
const sprite = await readFile(new URL("../src/components/report-sprite-artwork.tsx", import.meta.url), "utf8");

test("day-master and month-command mother art use the approved Supabase CDN sprites", () => {
  assert.match(assets, /zhaowu-gallery\/report-visuals\/r57/);
  assert.match(assets, /day-0\.webp/);
  assert.match(assets, /day-1\.webp/);
  assert.match(assets, /month-0\.webp/);
  assert.match(assets, /month-1\.webp/);
  assert.match(assets, /month-2\.webp/);
  assert.match(assets, /month-3\.webp/);
  assert.match(assets, /dayMaster:\s*10/);
  assert.match(assets, /month:\s*12/);
});

test("report artwork keeps lazy loading and fail-open paper fallback", () => {
  assert.match(sprite, /loading="lazy"/);
  assert.match(sprite, /decoding="async"/);
  assert.match(sprite, /\/wallpaper-song\.jpg/);
  assert.match(sprite, /onError/);
});

test("luck artwork reuses approved day-master CDN art instead of the old placeholder sprite", () => {
  assert.doesNotMatch(assets, /\/report-visuals\/groups\/luck-0\.webp/);
  assert.match(assets, /木:\s*\{ src: `\$\{REPORT_VISUAL_CDN_BASE\}\/day-0\.webp`, index: 0, count: 5 \}/);
  assert.match(assets, /火:\s*\{ src: `\$\{REPORT_VISUAL_CDN_BASE\}\/day-0\.webp`, index: 2, count: 5 \}/);
  assert.match(assets, /土:\s*\{ src: `\$\{REPORT_VISUAL_CDN_BASE\}\/day-0\.webp`, index: 4, count: 5 \}/);
  assert.match(assets, /金:\s*\{ src: `\$\{REPORT_VISUAL_CDN_BASE\}\/day-1\.webp`, index: 2, count: 5 \}/);
  assert.match(assets, /水:\s*\{ src: `\$\{REPORT_VISUAL_CDN_BASE\}\/day-1\.webp`, index: 3, count: 5 \}/);
  assert.match(assets, /luckElement:\s*5/);
});
