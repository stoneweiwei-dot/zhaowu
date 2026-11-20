import { expect, test } from "@playwright/test";
import {
  BACKGROUND_HISTORY_PAGE_SIZE,
  chooseDailyBackground,
  type BackgroundAsset,
} from "../src/lib/background-assets";
import { isQaReportRecord } from "../src/lib/supabase-rest";

function asset(id: string, patch: Partial<BackgroundAsset> = {}): BackgroundAsset {
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
    created_at: "2026-09-01T00:00:00.000Z",
    updated_at: "2026-09-01T00:00:00.000Z",
    ...patch,
  };
}

test.describe("STO-13 approved B variant", () => {
  test("keeps owner history lazy, scheduled wallpaper priority deterministic, and QA records isolated", () => {
    expect(BACKGROUND_HISTORY_PAGE_SIZE).toBe(12);

    const daily = asset("daily");
    const scheduled = asset("scheduled", { days_of_week: [5] });
    const pinned = asset("pinned", { theme: "wallpaper" });
    const friday = new Date("2026-09-04T12:00:00+10:00");

    expect(chooseDailyBackground([daily, scheduled, pinned], friday)?.id).toBe("pinned");
    expect(chooseDailyBackground([daily, scheduled], friday)?.id).toBe("scheduled");

    expect(isQaReportRecord({ record_kind: "analysis", access_mode: "member", context: {} })).toBe(false);
    expect(isQaReportRecord({ record_kind: "qa", access_mode: "member", context: {} })).toBe(true);
    expect(isQaReportRecord({ record_kind: "analysis", access_mode: "test", context: {} })).toBe(true);
    expect(isQaReportRecord({ record_kind: "analysis", access_mode: "member", context: { qa: true } })).toBe(true);
  });
});