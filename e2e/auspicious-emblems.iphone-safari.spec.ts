import { expect, test, type Page } from "@playwright/test";

const PAPER_ROUTES = ["/", "/yizhangjing", "/ziwei", "/qizheng"] as const;
async function makeAppOfflineSafe(page: Page) { await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" })); }
function alphaOf(value: string) {
  const rgba = value.match(/rgba?\(([^)]+)\)/);
  if (!rgba) return 1;
  const parts = rgba[1].split(",").map((part) => Number.parseFloat(part.trim()));
  return parts.length >= 4 && Number.isFinite(parts[3]) ? parts[3] : 1;
}

test.describe("iPhone Safari parchment application shell", () => {
  test("keeps dynamic wallpaper and loose scatter out of representative application routes", async ({ page }) => {
    await makeAppOfflineSafe(page);
    for (const route of PAPER_ROUTES) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(await page.evaluate(() => window.innerWidth)).toBe(390);
      await expect(page.locator(".zhaowu-home-sheet-shell")).toBeVisible();
      await expect(page.locator(".zhaowu-site-wallpaper")).toHaveCount(0);
      await expect(page.getByTestId("auspicious-emblem-scatter")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    }
  });

  test("representative application pages keep an explicit parchment background", async ({ page }) => {
    await makeAppOfflineSafe(page);
    for (const route of PAPER_ROUTES) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const backgroundImage = await page.locator("body").evaluate((node) => getComputedStyle(node).backgroundImage);
      expect(backgroundImage).not.toBe("none");
    }

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#analysisForm")).toBeVisible();
    await expect(page.locator(".zhaowu-home-hero")).toHaveCount(0);
    await expect(page.locator(".zhaowu-ziwei-feature")).toHaveCount(0);

    const baziBackground = await page.locator(".zhaowu-bazi-hub").evaluate((node) => getComputedStyle(node).backgroundColor);
    // r85 replaces the nested tinted Bazi card with a flat section below a
    // separate parchment-backed client record. The page wallpaper is retained.
    expect(alphaOf(baziBackground)).toBe(0);
    const customerBackground = await page.locator("#customer-record").evaluate((node) => getComputedStyle(node).backgroundColor);
    expect(alphaOf(customerBackground)).toBeCloseTo(0.78, 2);
    await expect(page.locator("#customer-record .zhaowu-bazi-hub")).toHaveCount(0);
  });

  test("does not fetch owner wallpaper assets for application shell rendering", async ({ page }) => {
    let backgroundReads = 0;
    await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
    await page.route("**/rest/v1/background_assets?**", (route) => {
      backgroundReads += 1;
      return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });
    await page.goto("/account", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(250);
    expect(backgroundReads).toBe(0);
  });

  for (const width of [390, 430]) {
    test(`r85 keeps the almanac compact and client details separate at ${width}px`, async ({ page }) => {
      await makeAppOfflineSafe(page);
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/", { waitUntil: "domcontentloaded" });
      const almanac = page.locator("#daily-almanac");
      const question = page.locator(".zhaowu-question-sheet");
      const customer = page.locator("#customer-record");
      const bazi = page.locator("#bazi");
      for (const section of [almanac, question, customer, bazi]) {
        await expect(section).toBeVisible();
      }
      await expect(almanac.locator("details[open]")).toHaveCount(0);
      const boxes = await Promise.all([almanac, question, customer, bazi].map((section) => section.boundingBox()));
      expect(boxes.every(Boolean)).toBe(true);
      expect(boxes[0]!.height).toBeLessThan(260);
      for (let i = 1; i < boxes.length; i += 1) {
        expect(boxes[i]!.y).toBeGreaterThanOrEqual(boxes[i - 1]!.y + boxes[i - 1]!.height);
      }
      const titleSize = await question.locator("h2").evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize));
      expect(titleSize).toBeLessThanOrEqual(28);
      await expect(page.locator("header .zhaowu-brand-seal__image")).toHaveAttribute("src", "/brand-ui/logo-primary.svg");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    });
  }
});
