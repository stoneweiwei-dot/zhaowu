import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { customerCopy } from "../src/lib/report/customer-copy.ts";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("D60 uses geocentric positions including the Sun and receives the active birth as a prop", () => {
  const d60 = source("src/components/d60-karma-section.tsx");
  assert.match(d60, /api\.Ecliptic\(api\.GeoVector\(key, date, true\)\)\.elon/);
  assert.doesNotMatch(d60, /api\.EclipticLongitude\(/);
  assert.match(d60, /reportBirth === undefined \? eventBirth : reportBirth/);
  assert.match(source("src/components/specialist-system-page.tsx"), /reportBirth=\{birth && !birth.timeUnknown \? birth : null\}/);
});

test("master numbers are interpreted inside the personal numerology result, not the article area", () => {
  assert.doesNotMatch(source("src/components/life-view-home-section.tsx"), /NumerologyHomeSection/);
  assert.match(source("src/routes/numerology.tsx"), /isMaster \? <p[^>]+data-master-number-insight/);
});

test("internal timing traces are removed without losing the following year's answer", () => {
  const text = "2026 屬於可做、但要挑月份的年份。歲運作用鏈：大運乙丑 → 流年丙午；流月層：酉酉自刑 2027 屬於可做、但要挑月份的年份。";
  const clean = customerCopy(text);
  assert.match(clean, /2026/);
  assert.match(clean, /2027/);
  assert.doesNotMatch(clean, /歲運作用鏈|酉酉自刑/);
  assert.match(customerCopy("2026 属于可做的年份。岁运作用链：乙丑 2027 属于可做的年份。"), /2027/);
});

test("share artwork contains the whole panel and bootstrap uses owner artwork", () => {
  assert.match(source("src/lib/report/share-card.ts"), /Math.min\(width \/ sourceWidth, height \/ sourceHeight\)/);
  assert.match(source("src/components/intro-gate.tsx"), /data-intro-fallback-mode="owner-poster"/);
  assert.doesNotMatch(source("src/components/intro-gate.tsx"), /<svg/);
});
