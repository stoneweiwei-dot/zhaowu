import { expect, test } from "@playwright/test";

const missingSharedBirth = "尚未找到生辰資料。回首頁填寫一次，六份命理專卷即可共用。";

async function seedGuestBirth(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem("zhaowu.birth-record-owner.v1", "__zhaowu_guest__");
    localStorage.setItem("zhaowu.birth-record.v1", JSON.stringify({
      year: 1988,
      month: 10,
      day: 4,
      hour: 4,
      minute: 40,
      timeUnknown: false,
      gender: "male",
      relation: "unset",
      city: {
        name: "Sydney",
        country: "Australia",
        display: "雪梨，澳洲",
        timezone: "Australia/Sydney",
        latitude: -33.8688,
        longitude: 151.2093,
      },
      liveCity: null,
      ziPolicy: "midnight",
      useTrueSolar: true,
    }));
  });
}

test("Seven Luminaries uses the shared homepage birth record and keeps its explanation readable", async ({ page }) => {
  await page.goto("/qizheng", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "七政四餘", exact: true })).toBeVisible();
  await expect(page.getByText("從七曜運行看性情、節奏、壓力反應與天時變化。", { exact: true })).toBeVisible();
  await expect(page.getByText(missingSharedBirth, { exact: true })).toBeVisible();
  await expect(page.getByLabel("年", { exact: true })).toHaveCount(0);
  const birthLink = page.getByRole("link", { name: "回首頁填寫生辰", exact: true });
  await expect(birthLink).toBeVisible();
  await expect(birthLink).toHaveAttribute("href", "/#bazi");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("Zi Wei uses the shared homepage birth record and keeps its explanation readable", async ({ page }) => {
  await page.goto("/ziwei", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "紫微斗數", exact: true })).toBeVisible();
  await expect(page.getByText("以宮位與時限作獨立旁證，重點看性格、關係、事業、財務與階段主軸。", { exact: true })).toBeVisible();
  await expect(page.getByText(missingSharedBirth, { exact: true })).toBeVisible();
  await expect(page.getByLabel("年", { exact: true })).toHaveCount(0);
  const birthLink = page.getByRole("link", { name: "回首頁填寫生辰", exact: true });
  await expect(birthLink).toBeVisible();
  await expect(birthLink).toHaveAttribute("href", "/#bazi");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("D60 requires explicit minute confirmation before any divisional interpretation", async ({ page }) => {
  await seedGuestBirth(page);
  await page.goto("/indian-astrology", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "印度古法占星", exact: true })).toBeVisible();
  await expect(page.getByText("1988-10-04 · 04:40 · 雪梨，澳洲", { exact: true }).first()).toBeVisible();
  await expect(page.locator("[data-d60-minute-gate]")).toBeVisible();
  await expect(page.locator("[data-d60-confirmed-record]")).toContainText("04:40");
  await expect(page.getByRole("button", { name: /我確認這是可核對到分鐘的出生時間（04:40）/ })).toBeVisible();
  await expect(page.getByText("核心慣性", { exact: true })).toHaveCount(0);
  await expect(page.locator("[data-d60-withheld]")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
