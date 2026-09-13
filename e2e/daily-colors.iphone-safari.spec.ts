import { expect, test } from "@playwright/test";

test("daily five-element colour guide is usable on iPhone Safari", async ({ page }) => {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
  await page.goto("/daily-colors", { waitUntil: "domcontentloaded" });

  const card = page.locator("#five-element-wardrobe");
  await expect(card).toBeVisible();
  await expect(card.getByRole("heading", { name: "每日穿衣｜五行色彩", exact: true })).toBeVisible();
  await expect(card.locator("[data-daily-colors-today] > p").first()).toContainText("今日適合：");

  await expect(card.locator("[data-daily-color-swatch] i").first()).toBeVisible();
  const swatchColor = await card.locator("[data-daily-color-swatch] i").first().evaluate((node) => getComputedStyle(node).backgroundColor);
  expect(swatchColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(swatchColor).not.toBe("transparent");

  await card.locator('[data-daily-color-id="liujin"]').click();
  await expect(card.locator('[data-daily-color-id="liujin"]')).toHaveAttribute("aria-pressed", "true");
  await expect(card.locator("[data-daily-colors-quote]")).toContainText("鎏金");
  await expect(card.getByText(/不是改運、招財或古籍穿著律令/)).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("home keeps dress colour inside today's guidance and the closed almanac compact", async ({ page }) => {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const almanac = page.locator("#daily-almanac");
  await expect(almanac).toBeVisible();
  await expect(almanac.locator("details[open]")).toHaveCount(0);
  const closedHeight = await almanac.evaluate((node) => node.getBoundingClientRect().height);
  expect(closedHeight).toBeLessThan(260);

  await almanac.locator("summary").click();
  await expect(almanac.locator("details")).toHaveAttribute("open", "");
  const embed = almanac.locator('#five-element-wardrobe[data-daily-colors="embed"]');
  await expect(embed).toBeVisible();
  await expect(embed.locator("[data-daily-color-swatch] i").first()).toBeVisible();
});
