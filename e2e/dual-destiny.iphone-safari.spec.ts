import { expect, test } from "@playwright/test";

test("iPhone Safari opens the Dharma One-Palm explanation and returns to the shared birth form", async ({ page }) => {
  await page.goto("/yizhangjing", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "達摩一掌經 · 前世今生", exact: true })).toBeVisible();
  await expect(page.getByText("主要看前四世來路、反覆習性，以及被重複加強、留到今生的習慣。", { exact: true })).toBeVisible();
  await expect(page.getByText("出生資料由昭梧統一保存為一份共享記錄。本頁不會再讓你重複填寫。", { exact: true })).toBeVisible();
  await expect(page.getByLabel("年", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("時", { exact: true })).toHaveCount(0);

  const back = page.getByRole("link", { name: "去填寫一次出生資料", exact: true });
  await expect(back).toBeVisible();
  await expect(back).toHaveAttribute("href", "/#bazi");
  await back.click();
  await expect(page.locator("#analysisForm")).toBeVisible();
  await expect(page.locator("#bazi")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
