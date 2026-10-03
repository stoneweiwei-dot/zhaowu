import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [client, gate, specialist, palm, numerology] = await Promise.all([
  read("src/lib/report-access.ts"),
  read("src/components/report-access-gate.tsx"),
  read("src/components/specialist-system-page.tsx"),
  read("src/components/palm-standalone.tsx"),
  read("src/routes/numerology.tsx"),
]);

test("the report catalogue is fixed at free, $1.99, $4.99 and $9.99", () => {
  assert.match(client, /quick: \{ amountCents: 199, price: "\$1\.99" \}/);
  assert.match(client, /system: \{ amountCents: 499, price: "\$4\.99" \}/);
  assert.match(client, /bundle: \{ amountCents: 999, price: "\$9\.99" \}/);
  assert.match(gate, /basic chart is free/i);
  assert.match(gate, /不自動續費/);
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
