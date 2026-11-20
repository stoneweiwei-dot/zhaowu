import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route(/ipwho\.is|open-meteo\.com|nominatim|geocoding/, route => route.abort());
});

async function openHomeToday(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "指引", exact: true }).click();
  await expect(page.locator("#daily-almanac")).toBeVisible();
}

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

test("home keeps almanac, dress colour and spirit slip in separate Today sections", async ({ page }) => {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await openHomeToday(page);

  const almanac = page.locator("#daily-almanac");
  await expect(almanac).toBeVisible();
  await expect(almanac.locator(".zhaowu-daily-details")).toHaveAttribute("open", "");
  await expect(almanac.locator(".zhaowu-daily-details > summary")).toHaveCount(1);
  await expect(almanac.locator(".zhaowu-daily-details > summary")).toBeHidden();
  await expect(almanac.locator(".zhaowu-today-section.is-almanac")).toBeVisible();
  await expect(almanac.locator(".zhaowu-today-section.is-wardrobe")).toBeVisible();
  await expect(almanac.locator(".zhaowu-today-section.is-spirit")).toBeVisible();
  const embed = almanac.locator('#five-element-wardrobe[data-daily-colors="embed"]');
  await expect(embed).toBeVisible();
  await expect(embed.locator("[data-daily-colors-featured-head] strong")).toBeVisible();
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
  await openHomeToday(page);
  const embeddedDate = await page.locator("#daily-almanac [data-daily-colors-date]").textContent();
  const almanacDate = await page.locator("#daily-almanac .zw-ink-datecard strong").textContent();
  expect(almanacDate).toBe("09/30");
  await page.goto("/daily-colors", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#five-element-wardrobe [data-daily-colors-date]")).toHaveText(embeddedDate ?? "");
});

test("a stale night preference cannot override the approved day-only Today surface", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("zhaowu.display-language", "zh-Hant");
    localStorage.setItem("zhaowu.theme.v1", "night");
  });
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await openHomeToday(page);
  await expect(page.locator("html")).not.toHaveAttribute("data-zw-theme", "night");

  const selectors = [
    '.zhaowu-today-section__head h2',
    '[data-daily-colors-featured-head] small',
    '[data-daily-colors-featured-head] strong',
    '[data-daily-colors-featured-head] span',
  ];
  for (const selector of selectors) {
    const element = page.locator(`#daily-almanac ${selector}`).first();
    await expect(element).toBeVisible();
    expect(await element.evaluate((node) => getComputedStyle(node).color)).not.toBe("rgba(0, 0, 0, 0)");
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
