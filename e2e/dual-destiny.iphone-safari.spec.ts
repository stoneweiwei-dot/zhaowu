import { expect, test } from "@playwright/test";

test("iPhone Safari opens the Dharma One-Palm explanation and returns to the shared birth form", async ({ page }) => {
  await page.goto("/yizhangjing", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "達摩一掌經", exact: true })).toBeVisible();
  await expect(page.getByText("看四世象意，以及被重複加強、留到今生的習慣。", { exact: true })).toBeVisible();
  await expect(page.getByText("目前還沒有共享出生資料。請先在首頁四柱八字分區填寫一次。", { exact: true })).toBeVisible();
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
