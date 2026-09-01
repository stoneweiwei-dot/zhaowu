import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { chooseDailyBackground } from "../src/lib/background-assets.ts";
import { isQaReportRecord } from "../src/lib/supabase-rest.ts";

const account = await readFile(new URL("../src/routes/account.tsx", import.meta.url), "utf8");
const backgrounds = await readFile(new URL("../src/lib/background-assets.ts", import.meta.url), "utf8");
const shell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const sheet = await readFile(new URL("../src/home-sheet-ui-v5.css", import.meta.url), "utf8");
const rest = await readFile(new URL("../src/lib/supabase-rest.ts", import.meta.url), "utf8");

function asset(id, overrides = {}) {
  return {
    id,
    source: "upload",
    name: `${id}.webp`,
    storage_path: `${id}.webp`,
    content_type: "image/webp",
    enabled: true,
    days_of_week: [],
    start_date: null,
    end_date: null,
    theme: "daily-rotation",
    created_at: "2026-08-01T00:00:00.000Z",
    updated_at: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

test("STO-13 keeps fixed and scheduled backgrounds ahead of daily rotation", () => {
  const now = new Date("2026-09-01T12:00:00+10:00");
  const daily = asset("daily");
  const scheduled = asset("scheduled", { days_of_week: [now.getDay()] });
  const fixed = asset("fixed", { theme: "wallpaper" });

  assert.equal(chooseDailyBackground([daily, scheduled], now)?.id, "scheduled");
  assert.equal(chooseDailyBackground([daily, scheduled, fixed], now)?.id, "fixed");
});

test("owner background history starts with one item and caps every page at twelve", () => {
  assert.match(backgrounds, /BACKGROUND_HISTORY_PAGE_SIZE\s*=\s*12/);
  assert.match(account, /listOwnerBackgroundPage\(session, 0, 1\)/);
  assert.match(account, /loadBackgroundHistory\(0\)/);
  assert.match(backgrounds, /Math\.min\(BACKGROUND_HISTORY_PAGE_SIZE/);
});

test("multi-image upload exposes per-file progress without expanding the mobile shell", () => {
  assert.match(account, /type="file" multiple/);
  assert.match(account, /backgroundUploads\.map/);
  assert.match(account, /role="progressbar"/);
  assert.match(account, /data-report-primary-actions/);
  assert.match(account, /data-report-secondary-actions/);
});

test("customer shell keeps gallery posters out of the restored Song landscape", () => {
  assert.doesNotMatch(shell, /chooseDailyBackground/);
  assert.doesNotMatch(shell, /dailyWallpaperPromise/);
  assert.doesNotMatch(shell, /--zhaowu-wallpaper-url/);
  assert.match(sheet, /radial-gradient/);
  assert.doesNotMatch(sheet, /background-attachment:\s*fixed/);
});

test("QA records stay out of formal owner and customer report lists", () => {
  const base = { record_kind: "analysis", access_mode: "member", context: {} };
  assert.equal(isQaReportRecord(base), false);
  assert.equal(isQaReportRecord({ ...base, record_kind: "test" }), true);
  assert.equal(isQaReportRecord({ ...base, access_mode: "qa" }), true);
  assert.equal(isQaReportRecord({ ...base, context: { isQa: true } }), true);
  assert.match(rest, /record_kind\.not\.in\.\(test,qa,e2e\)/);
  assert.match(rest, /filter\(\(row\) => !isQaReportRecord\(row\)\)/);
});
