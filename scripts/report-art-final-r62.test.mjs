import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../src/report-art-final-r62.css", import.meta.url), "utf8");
const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");
const assets = await readFile(new URL("../src/lib/report/report-visual-assets.ts", import.meta.url), "utf8");
const policy = await readFile(new URL("../docs/GALLERY-AUTO-INGEST-POLICY.md", import.meta.url), "utf8");

test("r62 report overview uses the approved Supabase art with paper fallback", () => {
  assert.match(css, /report-visuals\/r62\/overview-bg\.webp/);
  assert.match(css, /\/wallpaper-song\.jpg/);
  assert.match(main, /report-art-final-r62\.css/);
});

test("the fixed report art library is complete and intentionally frozen", () => {
  assert.match(assets, /dayMaster:\s*10/);
  assert.match(assets, /month:\s*12/);
  assert.match(assets, /luckElement:\s*5/);
  assert.match(policy, /十天干：10/);
  assert.match(policy, /十二月令：12/);
  assert.match(policy, /運之書五行：5/);
  assert.match(policy, /命之書總覽：1/);
  assert.match(policy, /停止無目的擴圖/);
});

test("future useful generated art is auto-ingested through the existing Gallery pipeline", () => {
  assert.match(policy, /預設把最終核准版本加入後台 Gallery/);
  assert.match(policy, /gallery_ingest_queue/);
  assert.match(policy, /gallery-ingest-finalize/);
  assert.match(policy, /eTag \+ bytes/);
  assert.match(policy, /沒有用途就不生成、不入庫/);
});
