import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const comparison = read("src/components/report-plan-comparison.tsx");
const gate = read("src/components/report-access-gate.tsx");
const bazi = read("src/components/bazi-reading-unlock.tsx");
const prices = read("src/lib/report-access.ts");
const style = read("src/components/report-plan-comparison.css");

test("three reading editions rely on live fixed local prices; no invented price", () => {
  assert.match(comparison, /reportAccessPrice\("system", "western"\)/);
  assert.match(comparison, /reportAccessPrice\("system", "bazi"\)/);
  for (const id of ["free", "standard", "deep"]) assert.match(comparison, new RegExp(`key: "${id}"`));
  assert.match(prices, /aud: \{ amountCents: 1490, price: "A\$14\.90" \}/);
  assert.match(prices, /aud: \{ amountCents: 2490, price: "A\$24\.90" \}/);
  assert.match(prices, /const DEEP_REPORT_SYSTEMS/);
});
test("every active paywall keeps the existing Stripe+consent gate", () => {
  assert.match(gate, /<ReportPlanComparison locale=\{locale\} system=\{system\}/);
  assert.match(gate, /startReportCheckout\(product, system\)/);
  assert.match(gate, /consent\.require\(\)/);
  assert.match(bazi, /<ReportPlanComparison locale=\{locale\} system="bazi"/);
  assert.match(bazi, /startReportCheckout\("system", "bazi", reportId\)/);
  assert.match(bazi, /consent\.require\(\)/);
});
test("unfinished unique portrait is NOT silently advertised as fulfilled", () => {
  assert.match(comparison, /portraitNote/);
  assert.match(comparison, /不屬現行付費權益/);
  assert.match(comparison, /not included in current paid access/);
  assert.doesNotMatch(comparison, /<img/);
});
test("editorial comparison uses list rows without shadows or floating graphic stickers", () => {
  assert.match(style, /\.zw-editions__row/);
  assert.match(style, /border-radius: 0/);
  assert.match(style, /box-shadow: none/);
  assert.match(style, /max-width: 380px/);
});

test("home artwork remains exact original, never substituted by procedural graphics", () => {
  const home = read("src/components/painted-home.tsx");
  const art = read("src/components/portrait-edition-showcase.tsx");
  assert.match(home, /<PortraitEditionShowcase locale=\{locale\}/);
  assert.match(art, /portrait-editions\/stone-song-original\.webp/);
  assert.match(art, /method: "HEAD"/);
  assert.match(art, /image\/webp/);
  assert.doesNotMatch(art, /<svg/);
  assert.match(art, /if \(!verified\) return null/);
});
