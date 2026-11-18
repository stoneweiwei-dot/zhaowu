import test from "node:test";
import assert from "node:assert/strict";
import { sydneyDate } from "../src/lib/daily-sky-date.ts";

test("observation switches to archived at Sydney midnight, including DST", () => {
  assert.equal(sydneyDate(new Date("2026-10-31T12:59:59Z")), "2026-10-31");
  assert.equal(sydneyDate(new Date("2026-10-31T13:00:00Z")), "2026-11-01");
  assert.equal(sydneyDate(new Date("2026-07-01T14:00:00Z")), "2026-07-02");
});
