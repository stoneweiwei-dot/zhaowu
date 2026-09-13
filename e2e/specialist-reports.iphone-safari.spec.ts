import { expect, test } from "@playwright/test";

const missingSharedBirth = "尚未找到生辰資料。回首頁填寫一次，六份命理專卷即可共用。";

test("Western astrology gives a complete house analysis instead of one Sun-house fragment", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.addInitScript(() => {
    localStorage.setItem("zhaowu.birth-record.v1", JSON.stringify({
      year: 1990, month: 6, day: 15, hour: 10, minute: 30, timeUnknown: false,
      gender: "male", relation: "unset",
      city: { name: "Sydney", display: "Sydney", country: "AU", timezone: "Australia/Sydney", latitude: -33.87, longitude: 151.21 },
    }));
  });
  await page.goto("/astrology", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("本頁不再只抽一個太陽落宮。", { exact: false })).toBeVisible();
  await expect(page.getByRole("region", { name: "七曜星座與落宮解讀" }).locator("tbody tr")).toHaveCount(7);
  await expect(page.getByRole("region", { name: "十二宮完整解讀" }).locator("tbody tr")).toHaveCount(12);
  await expect(page.getByRole("region", { name: "四軸解讀" }).locator("tbody tr")).toHaveCount(4);
  expect(await page.getByRole("region", { name: "主要相位" }).locator("tbody tr").count()).toBeGreaterThan(0);
  await expect(page.getByRole("heading", { name: "太陽落宮", exact: true })).toHaveCount(0);
  await expect(page.getByText(/^mercury\b/i)).toHaveCount(0);
  await expect(page.getByText(/^venus\b/i)).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

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

test("Seven Luminaries and Zi Wei show natal charts when the shared birth record is present", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("zhaowu.birth-record.v1", JSON.stringify({
      year: 1990, month: 6, day: 15, hour: 10, minute: 30, timeUnknown: false,
      gender: "male", relation: "unset",
      city: { name: "Sydney", display: "Sydney", country: "AU", timezone: "Australia/Sydney", latitude: -33.87, longitude: 151.21 },
    }));
  });
  await page.goto("/qizheng", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-natal-chart="qizheng"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.goto("/ziwei", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-natal-chart="ziwei"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("Indian D60 shows year/month/day, exact time and place, and withholds interpretation before minute confirmation", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("zhaowu.birth-record.v1", JSON.stringify({
      year: 1988, month: 10, day: 4, hour: 4, minute: 40, timeUnknown: false,
      gender: "male", relation: "unset",
      city: { name: "Sydney", display: "Sydney", country: "AU", timezone: "Australia/Sydney", latitude: -33.87, longitude: 151.21 },
    }));
  });
  await page.goto("/indian-astrology", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-d60-minute-gate]")).toBeVisible();
  await expect(page.locator("[data-d60-confirmed-record]")).toContainText("1988-10-04 · 04:40");
  await expect(page.locator("[data-d60-confirmed-record]")).toContainText("Sydney");
  await expect(page.getByRole("button", { name: /核心慣性/ })).toHaveCount(0);
  await expect(page.locator("[data-natal-chart=\"indian\"]")).toHaveCount(0);
});
