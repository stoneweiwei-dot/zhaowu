import { expect, test } from "@playwright/test";

const missingSharedBirth = "尚未找到生辰資料。回首頁填寫一次，六份命理專卷即可共用。";

test("Western house explanation stays below an unbroken heading on narrow phones", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.addInitScript(() => {
    localStorage.setItem("zhaowu.birth-record.v1", JSON.stringify({
      year: 1990, month: 6, day: 15, hour: 10, minute: 30, timeUnknown: false,
      gender: "male", relation: "unset",
      city: { name: "Sydney", display: "Sydney", country: "AU", timezone: "Australia/Sydney", latitude: -33.87, longitude: 151.21 },
    }));
  });
  await page.goto("/astrology", { waitUntil: "domcontentloaded" });
  const heading = page.getByRole("heading", { name: "太陽落宮", exact: true });
  const explanation = page.getByText(/太陽落在第 10 宮\s+此宮主題：事業與社會角色/);
  await expect(heading).toBeVisible();
  await expect(explanation).toBeVisible();
  const h = await heading.boundingBox();
  const p = await explanation.boundingBox();
  expect(h).not.toBeNull();
  expect(p).not.toBeNull();
  expect(p!.y).toBeGreaterThanOrEqual(h!.y + h!.height);
  const lineHeight = await heading.evaluate(el => parseFloat(getComputedStyle(el).lineHeight));
  expect(h!.height).toBeLessThanOrEqual(lineHeight + 2);
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
