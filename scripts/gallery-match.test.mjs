import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("customer Gallery matching reads approved client-eligible knowledge only", async () => {
  const source = await read("src/lib/gallery-match.ts");
  assert.match(source, /analysis_status=eq\.approved/);
  assert.match(source, /client_eligible=eq\.true/);
  assert.match(source, /chart\.useful/);
  assert.match(source, /chart\.drain/);
  assert.match(source, /a\.asset\.id\.localeCompare\(b\.asset\.id\)/);
});

test("Gallery visual is presentation-only and cannot block the report", async () => {
  const [resultView, component] = await Promise.all([
    read("src/components/result-view.tsx"),
    read("src/components/customer-standard-art.tsx"),
  ]);
  assert.match(resultView, /reportSections \? <FocusedReportSections/);
  assert.match(resultView, /reportSections \? <CustomerStandardArt chart=\{chart\}/);
  assert.match(component, /\.catch\(\(\) =>/);
  assert.match(component, /if \(!match\) return null/);
  assert.match(component, /never the underlying reading/);
});
