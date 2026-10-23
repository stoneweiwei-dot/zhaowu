import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [client, gate, specialist, palm, numerology, unified, personalComponent, personalModel, reportCss] = await Promise.all([
  read("src/lib/report-access.ts"),
  read("src/components/report-access-gate.tsx"),
  read("src/components/specialist-system-page.tsx"),
  read("src/components/palm-standalone.tsx"),
  read("src/routes/numerology.tsx"),
  read("src/components/unified-birth-report.tsx"),
  read("src/components/personal-paid-profile.tsx"),
  read("src/lib/report/personal-paid-profile.ts"),
  read("src/report-access.css"),
]);

// 2026-10-19: quick remains free. Paid prices are fixed manually in
// USD/AUD/CNY; no live exchange-rate calculation is performed.
test("the report catalogue keeps quick free and exposes the new canonical USD prices", () => {
  assert.match(client, /quick: \{ amountCents: 0, price: "\$0" \}/);
  assert.match(client, /system: FIXED_REPORT_PRICES\.standard\.usd/);
  assert.match(client, /usd: \{ amountCents: 990, price: "US\$9\.90" \}/);
  assert.match(gate, /basic chart is free/i);
  assert.match(gate, /不自動續費/);
});

test("standard and deep tiers use fixed AUD and CNY amounts", () => {
  assert.match(client, /aud: \{ amountCents: 1490, price: "A\$14\.90" \}/);
  assert.match(client, /cny: \{ amountCents: 6800, price: "¥68" \}/);
  assert.match(client, /aud: \{ amountCents: 2490, price: "A\$24\.90" \}/);
  assert.match(client, /cny: \{ amountCents: 10800, price: "¥108" \}/);
  assert.match(client, /DEEP_REPORT_SYSTEMS[^\n]*\["bazi", "ziwei"\]/);
});

test("browser price detection selects only fixed configured currencies", () => {
  assert.match(client, /detectReportPriceCurrency/);
  assert.match(client, /timeZone\.startsWith\("Australia\/"\)/);
  assert.match(client, /hasRegion\("CN"\)/);
  const detector = client.match(/export function detectReportPriceCurrency[\s\S]*?\n}/)?.[0] ?? "";
  assert.ok(detector, "detectReportPriceCurrency not found");
  assert.doesNotMatch(detector, /fetch\(|exchange|rate/i);
});

test("resolveReportAccess floors everyone at the free quick welcome gift", () => {
  assert.match(client, /level: "quick" as ReportAccessLevel, pending: false/);
  assert.match(client, /let level: ReportAccessLevel = "quick"/);
});

test("basic charts stay outside the gate and all interpretation is gated", () => {
  assert.ok(specialist.indexOf("<SpecialistChart") < specialist.indexOf("<ReportAccessGate"));
  assert.ok(palm.indexOf('data-natal-chart="past"') < palm.indexOf("<ReportAccessGate"));
  assert.ok(numerology.indexOf('data-natal-chart="numerology"') < numerology.indexOf("<ReportAccessGate"));
  assert.match(palm, /system="palm"/);
  assert.match(numerology, /system="numerology"/);
});

test("browser state never grants access without server verification", () => {
  assert.match(client, /verifySession/);
  assert.match(client, /verification\.paid/);
  assert.doesNotMatch(client, /localStorage\.setItem\([^\n]*(?:paid|product|bundle|system)/i);
  assert.doesNotMatch(client, /STRIPE_(?:SECRET|RESTRICTED)_KEY/);
});


test("full paid reports include a customer-specific birth profile without changing the quick tier", () => {
  assert.match(gate, /personal\?: ReactNode/);
  assert.match(gate, /level === "system"[\s\S]*\{personal\}\{full\}/);
  const quickBranch = gate.slice(gate.indexOf('level === "quick"'), gate.indexOf("<header>"));
  assert.doesNotMatch(quickBranch, /\{personal\}/);

  for (const surface of [specialist, palm, numerology]) {
    assert.match(surface, /PersonalPaidProfile/);
    assert.match(surface, /personal=\{/);
  }
  assert.match(unified, /href=\{entry\.route\}/);
  assert.doesNotMatch(unified, /<ReportAccessGate|<PersonalPaidProfile/);
});

test("the paid personal page is derived from each customer's saved birth data, never the owner's chart", () => {
  assert.match(personalModel, /buildChart\(\{ \.\.\.birth, question: "personal-paid-profile", locale \}\)/);
  assert.match(personalComponent, /data-personal-source="customer-birth-only"/);
  assert.match(personalComponent, /birth: SharedBirthRecord/);
  assert.match(personalModel, /不引用任何他人命盤/);
  assert.doesNotMatch(personalModel, /壬辰|金水結構|金水结构|辰辰自刑/);
});

test("the customer profile keeps the approved three-page wardrobe/editorial structure", () => {
  assert.match(personalComponent, /1\/3|page \+ 1/);
  assert.match(personalComponent, /專屬穿衣/);
  assert.match(personalComponent, /合沖刑害/);
  assert.match(personalComponent, /colorSwatches/);
  assert.match(personalComponent, /currentCycle/);
  assert.match(reportCss, /\.zhaowu-paid-personal-profile/);
  assert.match(reportCss, /#173f35/);
  assert.match(reportCss, /Songti TC/);
});
