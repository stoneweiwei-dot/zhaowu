import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const palm = await readFile(new URL("../src/components/palm-standalone.tsx", import.meta.url), "utf8");
const d60 = await readFile(new URL("../src/components/d60-karma-section.tsx", import.meta.url), "utf8");

test("Past & Present collects minute-level time and birthplace for D60", () => {
  assert.match(palm, /出生時間（精確到分鐘）/);
  assert.match(palm, /CityPicker/);
  assert.match(palm, /D60 時間精度確認/);
  assert.match(palm, /zhaowu:d60-birth/);
});

test("D60 uses only the birth data submitted by the current report", () => {
  assert.match(d60, /zhaowu:d60-birth/);
  assert.doesNotMatch(d60, /useCurrentUserState/);
  assert.doesNotMatch(d60, /user\?\.birthData/);
  assert.match(d60, /不會再從帳戶舊資料|no longer falls back to old account data/);
});

test("Past & Present no longer renders decorative emblem\/logo assets", () => {
  assert.doesNotMatch(palm, /\/emblems\//);
  assert.doesNotMatch(palm, /BrandSeal/);
});
