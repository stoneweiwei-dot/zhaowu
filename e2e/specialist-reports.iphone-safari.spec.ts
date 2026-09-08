import { expect, test } from "@playwright/test";

const missingSharedBirth = "尚未找到生辰資料。回首頁填寫一次，六份命理專卷即可共用。";

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
