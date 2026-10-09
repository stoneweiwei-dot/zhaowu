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
// display prices stay pinned to their current, Stripe-accurate amounts
// until real Payment Links at $9.90/$19.99 exist (see the BLOCKED BY note
// in report-access.ts above REPORT_ACCESS_PRODUCTS).
test("the report catalogue is fixed at free (quick, new-user gift), $4.99 and $9.99", () => {
  assert.match(client, /quick: \{ amountCents: 0, price: "\$0" \}/);
  assert.match(client, /system: \{ amountCents: 499, price: "\$4\.99" \}/);
  assert.match(client, /bundle: \{ amountCents: 999, price: "\$9\.99" \}/);
  assert.match(gate, /basic chart is free/i);
  assert.match(gate, /不自動續費/);
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
