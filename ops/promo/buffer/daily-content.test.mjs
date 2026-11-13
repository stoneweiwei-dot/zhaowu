import test from "node:test";
import assert from "node:assert/strict";
import { dailyDraft, sydneyLocalDate } from "./daily-content.mjs";

test("Sydney local day respects DST", () => {
  assert.equal(sydneyLocalDate(new Date("2026-11-02T13:30:00Z")), "2026-11-03");
  assert.equal(sydneyLocalDate(new Date("2026-07-01T13:30:00Z")), "2026-07-01");
});
test("same date yields stable reviewed draft and all three captions", () => {
  const a = dailyDraft("2026-11-03");
  assert.deepEqual(a, dailyDraft("2026-11-03"));
  assert.equal(a.local_date,"2026-11-03");
  assert.ok(a.captions.facebook.includes("https://zhao-wu.com/"));
  assert.ok([...a.captions.threads].length <= 500);
  assert.equal(a.image_url,""); // Instagram must fail closed until original media is verified.
});
test("invalid date / bank is rejected", () => {
  assert.throws(()=>dailyDraft("tomorrow"));
  assert.throws(()=>dailyDraft("2026-11-03",[]));
});
