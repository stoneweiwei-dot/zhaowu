import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const asset = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));

test("report image is clickable and opens a closable viewer with distinct full source", async () => {
  const art = await read("src/components/report-sprite-artwork.tsx");
  const viewer = await read("src/components/image-viewer.tsx");
  const assets = await read("src/lib/report/report-visual-assets.ts");
  assert.match(art, /zhaowu-sprite-open/);
  assert.match(art, /ImageViewer/);
  assert.match(viewer, /role="dialog"/);
  assert.match(viewer, /aria-modal="true"/);
  assert.match(viewer, /Escape/);
  assert.match(viewer, /圖片暫時無法載入/);
  assert.match(viewer, /scrollY/);
  assert.match(assets, /thumbnailUrl/);
  assert.match(assets, /fullImageUrl/);
  assert.match(assets, /\/report-visuals\/full\//);
  assert.match(assets, /\/report-visuals\/thumb\//);
  for (const id of ["jia-wood", "yin-spring", "luck-wood", "overview"]) {
    assert.equal(existsSync(asset(`public/report-visuals/thumb/${id}.webp`)), true);
    assert.equal(existsSync(asset(`public/report-visuals/full/${id}.webp`)), true);
  }
});

test("failed full image does not block text and six report entries stay semantically clickable", async () => {
  const paid = await read("src/components/paid-report-pages.tsx");
  const home = await read("src/routes/index.tsx");
  const page = await read("src/components/specialist-system-page.tsx");
  const d60Gate = await read("src/components/d60-reliability-gate.tsx");
  assert.match(paid, /ReportVisualBook/);
  assert.match(home, /to: "\/indian-astrology"/);
  assert.match(home, /to: "\/astrology"/);
  assert.match(home, /to: "\/ziwei"/);
  assert.match(home, /to: "\/qizheng"/);
  assert.match(home, /to: "\/yizhangjing"/);
  assert.match(home, /data-specialist-link="bazi"/);
  assert.match(home, /data-specialist-link=\{item\.id\}/);
  assert.match(home, /<Link[\s\S]*to=\{item\.to!\}/);
  assert.doesNotMatch(home, /role="button"/);
  assert.match(home, /填寫生辰|填写生辰|Add birth data/);
  assert.match(home, /查看分析|Open analysis/);
  assert.match(page, /readSharedBirthRecord/);
  assert.match(page, /buildZiweiReading|buildWesternReading/);
  assert.match(page, /D60ReliabilityGate/);
  assert.match(d60Gate, /D60KarmaSection/);
  assert.match(d60Gate, /data-d60-minute-gate/);
  assert.doesNotMatch(home, /disabled/);
});

test("unknown birth time does not disable a whole section and D60 warns instead of fabricating", async () => {
  const reading = await read("src/lib/specialist-reading.ts");
  const indian = await read("src/routes/indian-astrology.tsx");
  const d60 = await read("src/components/d60-karma-section.tsx");
  const d60Gate = await read("src/components/d60-reliability-gate.tsx");
  assert.match(reading, /目前無法確定命宮|Life Palace/);
  assert.match(reading, /不生成 D60 結論|no D60 conclusion/);
  assert.match(indian, /id="indian"/);
  assert.match(d60, /variant === "standalone"/);
  assert.match(d60, /unavailable/);
  assert.match(d60Gate, /reportBirth: D60GateBirth \| null/);
  assert.match(d60Gate, /reportBirth=\{null\}/);
});

test("apple-touch-icon and manifest point to versioned new icons with no old active HTML favicon", async () => {
  const html = await read("index.html");
  const manifest = await read("public/manifest.webmanifest");
  const gate = await read("src/components/intro-gate.tsx");
  const paid = await read("src/components/paid-report-pages.tsx");
  assert.match(html, /apple-touch-icon-r113\.png/);
  assert.match(manifest, /apple-touch-icon-r113\.png/);
  assert.match(manifest, /any maskable/);
  assert.doesNotMatch(html, /apple-touch-icon-r53\.png/);
  assert.doesNotMatch(html, /icons\/zhaowu-lotus-192\.png/);
  assert.match(gate, /IntroGate|intro/);
  assert.match(paid, /summary|你現在最需要知道的事|What matters now/);
});
