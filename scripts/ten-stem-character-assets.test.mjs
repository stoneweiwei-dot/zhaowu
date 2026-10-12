import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const readText = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const readBytes = (path) => readFile(new URL(`../${path}`, import.meta.url));

const STEMS = {
  甲: "jia-wood", 乙: "yi-wood", 丙: "bing-fire", 丁: "ding-fire", 戊: "wu-earth",
  己: "ji-earth", 庚: "geng-metal", 辛: "xin-metal", 壬: "ren-water", 癸: "gui-water",
};

function webpDimensions(bytes) {
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(bytes.subarray(8, 12).toString("ascii"), "WEBP");
  const chunk = bytes.subarray(12, 16).toString("ascii");
  if (chunk === "VP8X") {
    return { width: 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16), height: 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16) };
  }
  if (chunk === "VP8 ") {
    for (let i = 20; i < bytes.length - 10; i += 1) {
      if (bytes[i] === 0x9d && bytes[i + 1] === 0x01 && bytes[i + 2] === 0x2a) {
        return { width: (bytes[i + 3] | (bytes[i + 4] << 8)) & 0x3fff, height: (bytes[i + 5] | (bytes[i + 6] << 8)) & 0x3fff };
      }
    }
  }
  if (chunk === "VP8L") {
    const b = bytes.subarray(21, 25);
    return { width: 1 + (((b[1] & 0x3f) << 8) | b[0]), height: 1 + (((b[3] & 0x0f) << 10) | (b[2] << 2) | ((b[1] & 0xc0) >> 6)) };
  }
  throw new Error(`Unsupported WebP header: ${chunk}`);
}

test("ten-stem character files exist for exactly the ten stem keys, with a legacy fallback for each", async () => {
  const files = (await readdir(new URL("../public/report-visuals/characters/", import.meta.url))).filter((f) => f.endsWith(".webp")).sort();
  assert.deepEqual(files, Object.values(STEMS).map((k) => `${k}.webp`).sort());
  for (const key of Object.values(STEMS)) {
    const { width, height } = webpDimensions(await readBytes(`public/report-visuals/characters/${key}.webp`));
    assert.equal(width, 720, `${key}: width`);
    assert.equal(height, 773, `${key}: height`);
    await readBytes(`public/report-visuals/full/${key}.webp`); // legacy fallback must still exist
  }
});

test("stem → visual key mapping is the canonical ten-stem table in assets and in the report model", async () => {
  const assets = await readText("src/lib/report/report-visual-assets.ts");
  const model = await readText("src/lib/report/report-visual-model.ts");
  for (const [stem, key] of Object.entries(STEMS)) {
    assert.match(assets, new RegExp(`${stem}: "${key}"`), `${stem} → ${key} in STEM_VISUAL_KEYS`);
    assert.match(model, new RegExp(`visualKey: "${key}"`), `${key} in report model`);
  }
});

test("day-stem portrait prefers characters/, falls back to full/, keeps the text glyph, and stays report-only", async () => {
  const assets = await readText("src/lib/report/report-visual-assets.ts");
  const portrait = await readText("src/components/day-stem-portrait.tsx");
  assert.match(assets, /\/report-visuals\/characters/);
  assert.match(assets, /getDayStemCharacterAsset/);
  assert.match(portrait, /characterArt \?\? legacyArt/);
  assert.match(portrait, /getReportVisualAsset\("day-master", visualKey\)/);
  assert.match(portrait, /<strong lang="zh">\{stem\}<\/strong>/);
  // Report-only: nothing else under src/ may reference the character files or the portrait except the report page.
  const { execFileSync } = await import("node:child_process");
  const hits = execFileSync("grep", ["-rlE", "report-visuals/characters|getDayStemCharacterAsset|day-stem-portrait", "src"], { cwd: new URL("..", import.meta.url), encoding: "utf8" })
    .split("\n").filter(Boolean).sort();
  assert.deepEqual(hits, [
    "src/components/day-stem-portrait.css",
    "src/components/day-stem-portrait.tsx",
    "src/components/paid-report-pages.tsx",
    "src/lib/report/report-visual-assets.ts",
  ]);
});
