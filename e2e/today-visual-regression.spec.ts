import { expect, test, type Page } from "@playwright/test";

/**
 * Real-browser screenshot regression for the homepage "Today" module.
 * Covers tabs, five-element wardrobe and the Jade Dragon assistant at
 * phone / tablet / desktop widths, day and night.
 *
 * Determinism: fixed clock, no network for visitor/weather/sky data, Traditional
 * Chinese, animations disabled, install prompt hidden. Baselines live in
 * e2e/__screenshots__ and are generated on the Linux CI runner:
 *   npm run test:visual:update   (or the "Update visual baselines" workflow)
 */
const FIXED_TIME = new Date("2026-09-29T10:00:00+10:00");
const VIEWPORTS = [
  { name: "phone", width: 390, height: 844 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "desktop", width: 1440, height: 900 },
] as const;
const THEMES = ["day", "night"] as const;

async function openToday(page: Page, theme: (typeof THEMES)[number], viewport: (typeof VIEWPORTS)[number], opts: { hideDragon: boolean }) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.clock.setFixedTime(FIXED_TIME);
  await page.addInitScript((t) => {
    localStorage.setItem("zhaowu.display-language", "zh-Hant");
    if (t === "night") localStorage.setItem("zhaowu.theme.v1", "night");
    else localStorage.removeItem("zhaowu.theme.v1");
  }, theme);
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
  await page.route(/ipwho\.is|open-meteo\.com|nominatim|geocoding/, (route) => route.abort());
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#daily-almanac")).toBeVisible();
  await expect(page.locator('#daily-almanac [data-daily-color-swatch] i').first()).toBeVisible();
  await page.addStyleTag({
    content: `
      *, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }
      [aria-labelledby="home-install-title"] { display: none !important; }
      ${opts.hideDragon ? ".zhaowu-dragon-guide { display: none !important; }" : ""}
    `,
  });
  await page.evaluate(() => document.fonts.ready);
}

for (const viewport of VIEWPORTS) {
  for (const theme of THEMES) {
    test.describe(`Today visual baseline · ${viewport.name} · ${theme}`, () => {
      test("tabs", async ({ page }) => {
        await openToday(page, theme, viewport, { hideDragon: true });
        const tabs = page.locator("#daily-almanac .zhaowu-today-guide__tabs");
        await expect(tabs).toBeVisible();
        await expect(tabs).toHaveScreenshot(`today-tabs-${viewport.name}-${theme}.png`, { maxDiffPixelRatio: 0.01 });
      });

      test("five-element wardrobe", async ({ page }) => {
        await openToday(page, theme, viewport, { hideDragon: true });
        const wardrobe = page.locator("#daily-almanac #five-element-wardrobe");
        await wardrobe.scrollIntoViewIfNeeded();
        await expect(wardrobe).toBeVisible();
        await expect(wardrobe).toHaveScreenshot(`today-wardrobe-${viewport.name}-${theme}.png`, { maxDiffPixelRatio: 0.01 });
      });

      test("almanac page and spirit slip tab", async ({ page }) => {
        await openToday(page, theme, viewport, { hideDragon: true });
        const guide = page.locator("#daily-almanac");
        await guide.locator('.zhaowu-today-guide__tabs button').nth(0).click();
        await expect(guide.locator(".zhaowu-today-guide__grid")).toBeVisible();
        await expect(guide.locator(".zhaowu-today-guide__expanded")).toHaveScreenshot(`today-almanac-${viewport.name}-${theme}.png`, { maxDiffPixelRatio: 0.01 });
        await guide.locator('.zhaowu-today-guide__tabs button').nth(2).click();
        const spirit = guide.locator(".zhaowu-today-guide__spirit");
        await expect(spirit).toBeVisible();
        await expect(guide.locator(".zhaowu-today-guide__expanded")).toHaveScreenshot(`today-spirit-${viewport.name}-${theme}.png`, { maxDiffPixelRatio: 0.01 });
      });

      test("jade dragon assistant (closed and open)", async ({ page }) => {
        await openToday(page, theme, viewport, { hideDragon: false });
        const dragon = page.locator(".zhaowu-dragon-guide");
        await expect(dragon).toBeVisible();
        await expect(dragon).toHaveScreenshot(`today-dragon-closed-${viewport.name}-${theme}.png`, { maxDiffPixelRatio: 0.01 });
        await page.locator(".zhaowu-dragon-guide-trigger").click();
        const panel = page.locator(".zhaowu-dragon-guide-panel");
        await expect(panel).toBeVisible();
        await expect(panel).toHaveScreenshot(`today-dragon-open-${viewport.name}-${theme}.png`, { maxDiffPixelRatio: 0.01 });
      });
    });
  }
}
