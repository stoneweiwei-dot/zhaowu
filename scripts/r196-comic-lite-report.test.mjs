import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r196 turns the unified report into a real six-frame Comic Lite mode", async () => {
  const report = await source("src/components/unified-birth-report.tsx");
  assert.match(report, /useState<"formal" \| "comic">\("comic"\)/);
  assert.match(report, /data-report-mode="comic-lite"/);
  assert.match(report, /sections\.map\(\(section, index\)/);
  assert.match(report, /section\.body\.slice\(1\)/);
  assert.match(report, /漫畫 Lite/);
  assert.match(report, /Comic Lite/);
});

test("r196 keeps Comic Lite as presentation only and leaves payment untouched", async () => {
  const report = await source("src/components/unified-birth-report.tsx");
  assert.doesNotMatch(report, /payment|paywall|checkout|stripe|supabase|storage\.from|upload\(/i);
  assert.match(report, /buildWesternReading/);
  assert.match(report, /buildZiweiReading/);
  assert.match(report, /buildQizhengReading/);
  assert.match(report, /buildPalmReading/);
});

test("r196 Comic Lite is single-column and touch-readable on mobile", async () => {
  const css = await source("src/zhaowu-design-system.css");
  assert.match(css, /r196 — Full comic Lite reading mode/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.zhaowu-comic-lite__grid \{ grid-template-columns: 1fr/);
  assert.match(css, /\.zhaowu-report-mode-switch button[\s\S]*min-height: 40px/);
  assert.doesNotMatch(css, /\.zhaowu-comic-lite[^\n]*position:\s*fixed/);
});
