import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const palm = await readFile(new URL("../src/components/palm-standalone.tsx", import.meta.url), "utf8");
const d60 = await readFile(new URL("../src/components/d60-karma-section.tsx", import.meta.url), "utf8");
const indian = await readFile(new URL("../src/routes/indian-astrology.tsx", import.meta.url), "utf8");
const page = await readFile(new URL("../src/components/specialist-system-page.tsx", import.meta.url), "utf8");
const past = await readFile(new URL("../src/routes/yizhangjing.tsx", import.meta.url), "utf8");

test("Past & Present collects minute-level time and birthplace without owning D60", () => {
  assert.match(palm, /出生時間（精確到分鐘）/);
  assert.match(palm, /CityPicker/);
  assert.doesNotMatch(palm, /印度古法占星時間精度確認/);
  assert.doesNotMatch(palm, /zhaowu:d60-birth/);
  assert.doesNotMatch(palm, /d60Confirm|setD60Exact|d60Exact/);
  assert.doesNotMatch(past, /D60KarmaSection/);
});

test("D60 lives on Classical Indian astrology behind the reliability gate", () => {
  assert.match(indian, /SpecialistSystemPage id="indian"/);
  assert.match(page, /D60ReliabilityGate/);
  assert.match(page, /id === "indian"/);
  assert.match(d60, /zhaowu:d60-birth/);
  assert.doesNotMatch(d60, /useCurrentUserState/);
  assert.doesNotMatch(d60, /user\?\.birthData/);
  assert.match(d60, /不會再從帳戶舊資料|no longer falls back to old account data/);
});

test("Past & Present no longer renders decorative emblem\/logo assets", () => {
  assert.doesNotMatch(palm, /\/emblems\//);
  assert.doesNotMatch(palm, /BrandSeal/);
});
