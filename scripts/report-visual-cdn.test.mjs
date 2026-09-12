import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const assets = await readFile(new URL("../src/lib/report/report-visual-assets.ts", import.meta.url), "utf8");
const sprite = await readFile(new URL("../src/components/report-sprite-artwork.tsx", import.meta.url), "utf8");

test("day-master and month-command mother art use same-origin Vercel sprites", () => {
  assert.match(assets, /const REPORT_VISUAL_CDN_BASE = "\\/report-visuals\\/groups"/);
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
  assert.match(sprite, /fullImageUrl/);
  assert.match(sprite, /thumbnailUrl/);
});

test("luck artwork uses the completed five-element same-origin sprite", () => {
  assert.match(assets, /const REPORT_LUCK_CDN_BASE = "\\/report-visuals\\/groups"/);
  assert.match(assets, /luck-0\.webp/);
  assert.match(assets, /REPORT_LUCK_CDN_BASE/);
  assert.doesNotMatch(assets, /supabase\.co|storage\/v1\/object\/public/);
  assert.match(assets, /luckElement:\s*5/);
});
