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

// 2026-10-10: the quick tier was cancelled as a paid product and is now a
// standing new-user welcome gift (free for everyone by default — see
// resolveReportAccess). system/bundle remain the only sold tiers; their
// display prices match the verified live Stripe USD 9.90 / USD 19.99
// amounts; BaZi is a separate USD 9.90 purchase and the bundle excludes it.
test("the report catalogue is fixed at free quick, US$9.90 per system and US$19.99 bundle", () => {
  assert.match(client, /quick: \{ amountCents: 0, price: "\$0" \}/);
  assert.match(client, /system: \{ amountCents: 990, price: "US\$9\.90" \}/);
  assert.match(client, /bundle: \{ amountCents: 1999, price: "US\$19\.99" \}/);
  assert.match(gate, /basic chart is free/i);
  assert.match(gate, /不自動續費/);
});

test("2026-10-16: BaZi and Zi Wei single-system price is US$19.99; the other five stay US$9.90", () => {
  assert.match(client, /SYSTEM_PRICE_1999[^\n]*new Set<ReportSystemId>\(\["bazi", "ziwei"\]\)/);
  const fn = client.match(/export function reportAccessPrice[\s\S]*?\n}\n/)?.[0] ?? "";
  assert.ok(fn, "reportAccessPrice not found");
  assert.match(fn, /product === "system" && SYSTEM_PRICE_1999\.has\(system\)/);
  assert.match(fn, /amountCents: 1999, price: "US\$19\.99"/);
  assert.match(fn, /return REPORT_ACCESS_PRODUCTS\[product\]/);
  // the default catalogue stays 9.90 for every other single system, and the bundle stays 19.99
  assert.match(client, /system: \{ amountCents: 990, price: "US\$9\.90" \}/);
  assert.match(client, /bundle: \{ amountCents: 1999, price: "US\$19\.99" \}/);
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
  assert.match(gate, /level === "bundle" \|\| level === "system"[\s\S]*\{personal\}\{full\}/);
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
  assert.match(personalModel, /不引用站主命盤/);
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
