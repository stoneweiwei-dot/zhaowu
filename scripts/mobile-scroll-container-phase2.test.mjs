import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const scrollComponent = await readFile(new URL("../src/components/mobile-scroll-container.tsx", import.meta.url), "utf8");
const baziChart = await readFile(new URL("../src/components/bazi-chart.tsx", import.meta.url), "utf8");
const specialistChart = await readFile(new URL("../src/components/specialist-chart.tsx", import.meta.url), "utf8");
const timingGuide = await readFile(new URL("../src/components/report-timing-guide.tsx", import.meta.url), "utf8");
const paidReport = await readFile(new URL("../src/components/paid-report-pages.tsx", import.meta.url), "utf8");
const scrollCss = await readFile(new URL("../src/mobile-page-scroll.css", import.meta.url), "utf8");
const specialistCss = await readFile(new URL("../src/specialist-chart.css", import.meta.url), "utf8");

test("Phase 2 MobileScrollContainer component provides trilingual swipe cues, edge fades and touch pan action", () => {
  assert.match(scrollComponent, /export function MobileScrollContainer/);
  assert.match(scrollComponent, /左右滑動查看完整/);
  assert.match(scrollComponent, /左右滑动查看完整/);
  assert.match(scrollComponent, /Scroll horizontally/);
  assert.match(scrollComponent, /mobile-scroll-track/);
  assert.match(scrollComponent, /data-scroll-left/);
  assert.match(scrollComponent, /data-scroll-right/);
});

test("Phase 2 BaZi chart wraps four pillars and luck cycles in MobileScrollContainer", () => {
  assert.match(baziChart, /import\s+\{\s*MobileScrollContainer\s*\}\s+from\s+['"]@\/components\/mobile-scroll-container['"]/);
  assert.match(baziChart, /<MobileScrollContainer[^>]*hint="chart"[^>]*>[\s\S]*?<div className="zhaowu-pillar-grid">/);
  assert.match(baziChart, /<MobileScrollContainer[^>]*hint="cycles"[^>]*>[\s\S]*?<ol className="zhaowu-cycle-list">/);
});

test("Phase 2 Specialist chart wraps 12-palace Ziwei grid in MobileScrollContainer", () => {
  assert.match(specialistChart, /import\s+\{\s*MobileScrollContainer\s*\}\s+from\s+['"]@\/components\/mobile-scroll-container['"]/);
  assert.match(specialistChart, /<MobileScrollContainer[^>]*hint="chart"[\s\S]*?zw-ziwei-grid/);
});

test("Phase 2 Timing guide wraps monthly forecast table in MobileScrollContainer", () => {
  assert.match(timingGuide, /import\s+\{\s*MobileScrollContainer\s*\}\s+from\s+['"]@\/components\/mobile-scroll-container['"]/);
  assert.match(timingGuide, /<MobileScrollContainer[^>]*hint="months"[\s\S]*?<table className="w-full min-w-\[34rem\]/);
});

test("Phase 2 Paid report chart snapshot wraps four pillars in MobileScrollContainer", () => {
  assert.match(paidReport, /import\s+\{\s*MobileScrollContainer\s*\}\s+from\s+['"]@\/components\/mobile-scroll-container['"]/);
  assert.match(paidReport, /<MobileScrollContainer[^>]*hint="chart"[\s\S]*?<div className="zhaowu-pillar-grid">/);
});

test("Phase 2 CSS provides overflow-x touch scrolling, smooth edge fades and small-screen pillar preservation", () => {
  assert.match(scrollCss, /\.mobile-scroll-container/);
  assert.match(scrollCss, /\.mobile-scroll-track/);
  assert.match(scrollCss, /touch-action:\s*pan-x pan-y pinch-zoom/);
  assert.match(scrollCss, /\.mobile-scroll-hint/);
  assert.match(scrollCss, /\.has-edge-fades\[data-scroll-left="true"\]::before/);
  assert.match(scrollCss, /\.has-edge-fades\[data-scroll-right="true"\]::after/);
  assert.match(scrollCss, /grid-template-columns:\s*repeat\(4,\s*minmax\(78px,\s*1fr\)\)/);
  assert.match(specialistCss, /\.zw-chart-scroll:has\(\.zw-ziwei-grid\)\{overflow-x:auto/);
});
