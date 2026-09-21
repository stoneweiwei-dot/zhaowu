import { expect, test } from "@playwright/test";

test("Today Colour Intent is usable without horizontal overflow on iPhone Safari", async ({ page }) => {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
  await page.goto("/daily-colors", { waitUntil: "domcontentloaded" });

  const card = page.locator("#five-element-wardrobe");
  await expect(card).toBeVisible();
  await expect(card.getByRole("heading", { name: "昭梧 · 今日色意", exact: true })).toBeVisible();
  await expect(card.locator("[data-daily-colors-choices] > button")).toHaveCount(14);
  await expect(card.locator("[data-daily-color-swatch] i").first()).toBeVisible();

  await card.locator('[data-daily-color-id="purple"]').click();
  await expect(card.locator('[data-daily-color-id="purple"]')).toHaveAttribute("aria-pressed", "true");
  const detail = card.locator("[data-daily-color-detail]");
  await expect(detail).toContainText("紫色");
  await expect(detail).toContainText("核心象徵");
  await expect(detail).toContainText("什麼時候少一點");
  await expect(detail).toContainText("直覺可以指引方向");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("home keeps Colour Intent inside the unified Today Guide", async ({ page }) => {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const almanac = page.locator("#daily-almanac");
  await expect(almanac).toHaveCount(0);
  await page.getByRole("button", { name: /^今日/ }).click();
  await expect(almanac).toBeVisible();
  await expect(almanac.locator("details")).toHaveAttribute("open", "");
  await almanac.getByRole("button", { name: "下一頁" }).click();
  await expect(almanac.getByText("今日色意", { exact: true }).first()).toBeVisible();

  const embed = almanac.locator('#five-element-wardrobe[data-daily-colors="embed"]');
  await expect(embed).toBeVisible();
  await expect(embed.locator("[data-daily-colors-choices] > button")).toHaveCount(14);
  await embed.locator('[data-daily-color-id="brown"]').click();
  await expect(embed.locator("[data-daily-color-detail]")).toContainText("把能量放回今天真正能完成的事情");
});
