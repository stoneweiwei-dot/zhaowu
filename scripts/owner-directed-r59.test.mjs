import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const brand = await readFile(new URL("../src/components/brand-seal.tsx", import.meta.url), "utf8");
const almanac = await readFile(new URL("../src/components/daily-almanac-widget.tsx", import.meta.url), "utf8");
const almanacCss = await readFile(new URL("../src/daily-almanac-r59.css", import.meta.url), "utf8");
const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");
const result = await readFile(new URL("../src/components/result-view.tsx", import.meta.url), "utf8");

test("header uses Stone's bright white-gold-emerald logo instead of the dark placeholder", () => {
  assert.match(brand, /Stone-approved 2026-09-07 white \/ bright-gold \/ emerald/);
  assert.match(brand, /data:image\/webp;base64/);
  assert.match(brand, /bg-\[#fffdf8\]/);
  assert.doesNotMatch(brand, /bg-\[#9d4033\]/);
});

test("homepage almanac shows the current Ganzhi year month day and hour from the canonical calendar", () => {
  assert.match(almanac, /dayGanzhi/);
  assert.match(almanac, /yearMonthPillars/);
  assert.match(almanac, /hourPillar/);
  assert.match(almanac, /pillarLabels: \["年", "月", "日", "時"\]/);
  assert.match(almanac, /zhaowu-daily-pillars/);
  assert.match(almanac, /jieLabel\(pillars\.jieName/);
});

test("daily almanac uses an explicit Song-family visual lock loaded last", () => {
  assert.match(main, /daily-almanac-r59\.css/);
  assert.match(almanacCss, /Songti TC/);
  assert.match(almanacCss, /zhaowu-daily-pillar strong/);
  assert.match(almanacCss, /linear-gradient\(148deg/);
});

test("free result renders the actual question-specific engine answer instead of replacing it with a generic topic template", () => {
  assert.match(result, /customerDirectAnswer\(question, reading\.directAnswer\)/);
  assert.doesNotMatch(result, /buildFreeDirectAnswer/);
});
