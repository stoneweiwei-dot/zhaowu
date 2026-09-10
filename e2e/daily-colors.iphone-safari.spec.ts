import { expect, test } from "@playwright/test";

test("daily five-element colour guide is usable on iPhone Safari", async ({ page }) => {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
  await page.goto("/daily-colors", { waitUntil: "domcontentloaded" });

  const card = page.locator("#five-element-wardrobe");
  await expect(card).toBeVisible();
  await expect(card.getByRole("heading", { name: "每日穿衣｜五行色彩", exact: true })).toBeVisible();
  await expect(card.locator("[data-daily-colors-today] > p").first()).toContainText("今日適合：");

  await card.locator('[data-daily-color-id="liujin"]').click();
  await expect(card.locator('[data-daily-color-id="liujin"]')).toHaveAttribute("aria-pressed", "true");
  await expect(card.locator("[data-daily-colors-quote]")).toContainText("鎏金");
  await expect(card.getByText(/不是改運、招財或古籍穿著律令/)).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
