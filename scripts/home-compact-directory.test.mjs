import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const home = readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const form = readFileSync(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");
const report = readFileSync(new URL("../src/components/unified-birth-report.tsx", import.meta.url), "utf8");
const design = readFileSync(new URL("../src/zhaowu-design-system.css", import.meta.url), "utf8");
const articles = readFileSync(new URL("../src/components/life-view-home-section.tsx", import.meta.url), "utf8");

test("homepage hides the seven-school directory and renders one integrated report after birth data", () => {
  assert.doesNotMatch(home, /七種個人分析|Seven personal readings|data-specialist-link|portalCopy/);
  assert.doesNotMatch(home, /to: "\/(?:numerology|ziwei|astrology|indian-astrology|qizheng|yizhangjing)"/);
  assert.match(form, /UnifiedBirthReport/);
  assert.match(form, /第二步 · 完整綜合報告/);
  assert.match(report, /data-unified-birth-report/);
  assert.match(report, /完整綜合報告/);
  assert.match(report, /buildWesternReading/);
  assert.match(report, /buildZiweiReading/);
  assert.match(report, /buildQizhengReading/);
  assert.match(report, /buildIndianReading/);
  assert.match(report, /buildPalmReading/);
  assert.match(report, /NUMEROLOGY_PROFILES/);
  assert.match(design, /\.zhaowu-unified-birth-report/);
  assert.match(design, /font-size:\s*16px !important/);
  assert.match(design, /@media \(max-width: 640px\)/);
});

test("homepage shows only the latest editorial item until the archive is opened", () => {
  assert.match(articles, /const latest = CONTENTS\[0\] \?\? null/);
  assert.match(articles, /const visibleArticles = archiveMode \|\| showAll \? CONTENTS : \[latest\]/);
  assert.match(articles, /aria-expanded=\{showAll\}/);
  assert.match(articles, /archiveMode/);
});
