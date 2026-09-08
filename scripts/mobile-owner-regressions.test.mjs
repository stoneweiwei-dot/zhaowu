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
  assert.doesNotMatch(clean, /歲運作用鏈|酉酉自刑|大運層|流年層|流月層|排序依序核對/);
  assert.match(customerCopy("2026 属于可做的年份。岁运作用链：乙丑 2027 属于可做的年份。"), /2027/);
  assert.doesNotMatch(
    customerCopy("較順的窗口：9月。排序依序核對原局、大運、流年、流月；不把任何單一關係當作結果保證。"),
    /排序依序核對|結果保證/,
  );
});

test("share artwork contains the whole panel and bootstrap keeps the approved owner loading treatment", () => {
  assert.match(source("src/lib/report/share-card.ts"), /Math.min\(width \/ sourceWidth, height \/ sourceHeight\)/);
  const intro = source("src/components/intro-gate.tsx");
  assert.match(intro, /data-intro-fallback-mode="fullscreen-owner-poster"/);
  assert.match(intro, /owner-lotus-bloom-r53\.mp4/);
  assert.match(intro, /owner-lotus-bloom-r53\.jpg/);
  assert.match(intro, /zhaowu-lotus-intro__poster/);
  assert.match(intro, /zhaowu-lotus-intro__fallback-art/);
  assert.doesNotMatch(intro, /<svg/);
});
