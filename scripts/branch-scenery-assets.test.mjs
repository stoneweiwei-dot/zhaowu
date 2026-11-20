import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const src = readFileSync("src/lib/report/branch-scenery.ts", "utf8");
const PAIRS = { 子: "zi", 丑: "chou", 寅: "yin", 卯: "mao", 辰: "chen", 巳: "si", 午: "wu", 未: "wei", 申: "shen", 酉: "you", 戌: "xu", 亥: "hai" };

test("twelve branches map to the right key and a webp on disk", () => {
  assert.equal(Object.keys(PAIRS).length, 12);
  for (const [zhi, key] of Object.entries(PAIRS)) {
    assert.match(src, new RegExp(`${zhi}: \\{ key: "${key}", zhi: "${zhi}"`), `${zhi} -> ${key}`);
    assert.ok(existsSync(`public/report-visuals/branches/${key}.webp`), `${key}.webp exists`);
  }
});

test("component is report-only, deduped/capped, text-layer titled, and degrades to text", () => {
  const comp = readFileSync("src/components/branch-scenery.tsx", "utf8");
  const report = readFileSync("src/components/paid-report-pages.tsx", "utf8");
  assert.match(src, /max = 4/);
  assert.match(comp, /onError=/);
  assert.match(comp, /<strong lang="zh">\{s\.zhi\}<\/strong>/);
  assert.match(report, /<BranchScenery result=\{result\} \/>/);
  assert.doesNotMatch(readFileSync("src/routes/index.tsx", "utf8"), /BranchScenery/);
});
