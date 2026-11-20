import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { isSkyReportArchived } from "../src/lib/sky-week-presentation.ts";

test("archive changes at Sydney midnight, not the reader timezone or before the report ends", () => {
  assert.equal(isSkyReportArchived("2026-10-25", new Date("2026-10-25T12:59:59Z")), false);
  assert.equal(isSkyReportArchived("2026-10-25", new Date("2026-10-25T13:00:00Z")), true);
  assert.equal(isSkyReportArchived(undefined), false);
});
test("weekly deep link opens visible content above the essay without an extra disclosure", async () => {
  const page = await readFile("src/routes/sky-events.tsx", "utf8");
  assert.ok(page.indexOf('<TodaySkyCards />') < page.indexOf('<article className="sky-event-article"'));
  assert.match(page, /<section[^>]*id="sky-week"/);
  assert.doesNotMatch(page, /<details[^>]*id="sky-week"/);
});
test("intro offers explicit homepage destination in every primary language and exits immediately", async () => {
  const gate = await readFile("src/components/intro-gate.tsx", "utf8");
  assert.match(gate, /Enter homepage/);
  assert.match(gate, /进入首页/);
  assert.match(gate, /進入首頁/);
  assert.match(gate, /data-intro-skip[\s\S]*?onClick=\{forceOff\}/);
});
