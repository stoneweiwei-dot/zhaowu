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

test("home keeps dress colour inside the unified Today disclosure", async ({ page }) => {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const almanac = page.locator("#daily-almanac");
  await expect(almanac).toBeVisible();
  await expect(almanac.locator("details")).toHaveAttribute("open", "");
  await expect(almanac.locator("summary")).toHaveCount(1);
  await expect(almanac.locator("summary")).toBeHidden();
  await expect(almanac.locator('.zhaowu-today-guide__tabs button[aria-pressed="true"]')).toContainText(/穿衣|Dress/);
  const embed = almanac.locator('#five-element-wardrobe[data-daily-colors="embed"]');
  await expect(embed).toBeVisible();
  await expect(embed.locator("[data-daily-color-swatch] i").first()).toBeVisible();
});

test("home almanac and standalone dress page use the same device date when IP timezone differs", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-09-30T00:15:00Z"));
  await page.addInitScript(() => {
    localStorage.setItem("zhaowu:visitor-context:v3", JSON.stringify({
      at: Date.now(),
      value: { city: "Los Angeles", country: "United States", latitude: 34.05, longitude: -118.24, timezone: "America/Los_Angeles", temperature: 20, weatherCode: 0 },
    }));
  });
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const embeddedDate = await page.locator("#daily-almanac [data-daily-colors-date]").textContent();
  await page.locator('#daily-almanac .zhaowu-today-guide__tabs button').first().click();
  const almanacDate = await page.locator("#daily-almanac .zhaowu-today-card.is-date strong").textContent();
  expect(almanacDate).toBe("2026.09.30");
  await page.goto("/daily-colors", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#five-element-wardrobe [data-daily-colors-date]")).toHaveText(embeddedDate ?? "");
});

test("night Today keeps selected labels and wardrobe copy legible", async ({ page }) => {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "切換夜間模式" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-zw-theme", "night");

  const selectors = [
    '.zhaowu-today-guide__tabs button[aria-pressed="true"]',
    '[data-daily-colors-featured-head] small',
    '[data-daily-colors-featured-head] strong',
    '[data-daily-colors-featured-head] span',
    '[data-daily-colors-choices] button strong',
  ];
  for (const selector of selectors) {
    const element = page.locator(`#daily-almanac ${selector}`).first();
    await expect(element).toBeVisible();
    const luminance = await element.evaluate((node) => {
      const channels = getComputedStyle(node).color.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
      const linear = channels.map((value) => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    });
    expect(luminance, `${selector} should be light on the night surface`).toBeGreaterThan(0.5);
  }
});
