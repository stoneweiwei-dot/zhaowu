import { expect, test, type Page } from "@playwright/test";

const PAPER_ROUTES = ["/", "/ziwei", "/qizheng"] as const;
async function makeAppOfflineSafe(page: Page) { await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" })); }
function alphaOf(value: string) {
  const rgba = value.match(/rgba?\(([^)]+)\)/);
  if (!rgba) return 1;
  const parts = rgba[1].split(",").map((part) => Number.parseFloat(part.trim()));
  return parts.length >= 4 && Number.isFinite(parts[3]) ? parts[3] : 1;
}

test.describe("iPhone Safari parchment application shell", () => {
  for (const route of PAPER_ROUTES) {
    test(`keeps wallpaper/scatter out and parchment present on ${route}`, async ({ page }) => {
      await makeAppOfflineSafe(page);
      if (route !== "/") {
        await page.route("**/api/owner-session", (request) => request.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ authenticated: true }),
        }));
      }
      await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(await page.evaluate(() => window.innerWidth)).toBe(390);
      await expect(page.locator(".zhaowu-home-sheet-shell")).toBeVisible();
      await expect(page.locator(".zhaowu-site-wallpaper")).toHaveCount(0);
      await expect(page.getByTestId("auspicious-emblem-scatter")).toHaveCount(0);
      const backgroundImage = await page.locator("body").evaluate((node) => getComputedStyle(node).backgroundImage);
      expect(backgroundImage).not.toBe("none");
      await expect(page.locator("header .zhaowu-brand-link")).toBeVisible();
      await expect(page.locator("header .zhaowu-brand-seal")).toBeHidden();
      await expect(page.locator("header .zhaowu-brand-name")).toBeVisible();
      const wordmarkSize = await page.locator("header .zhaowu-brand-name").evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize));
      expect(wordmarkSize).toBeGreaterThanOrEqual(20);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    });
  }

  test("r163 keeps an opaque client record separate from the non-empty Bazi stage", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#analysisForm")).toBeVisible();
    await expect(page.locator(".zhaowu-home-hero")).toHaveCount(0);
    await expect(page.locator(".zhaowu-ziwei-feature")).toHaveCount(0);
    await expect(page.locator("#bazi.zhaowu-bazi-stage")).toBeVisible();
    await expect(page.locator("#bazi .zhaowu-bazi-pending").getByRole("button", { name: "保存並生成昭梧命書", exact: true })).toBeVisible();
    await expect(page.locator("#bazi .zhaowu-bazi-pending p")).toHaveCount(0);
    const customerBackground = await page.locator("#customer-record").evaluate((node) => getComputedStyle(node).backgroundColor);
    expect(alphaOf(customerBackground)).toBe(1);
    await expect(page.locator("#customer-record #bazi")).toHaveCount(0);
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
    test(`Today Guide leads the primary chart flow without overlap at ${width}px`, async ({ page }) => {
      await makeAppOfflineSafe(page);
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/", { waitUntil: "domcontentloaded" });
      const almanac = page.locator("#daily-almanac");
      const customer = page.locator("#customer-record");
      const bazi = page.locator("#bazi");
      for (const section of [customer, bazi]) await expect(section).toBeVisible();
      await expect(almanac).toHaveCount(0);
      await expect(page.locator(".zhaowu-question-sheet")).toHaveCount(0);
      await page.getByRole("button", { name: /^今日/ }).click();
      await expect(almanac).toBeVisible();
      await expect(almanac.locator("details[open]")).toHaveCount(1);
      const boxes = await Promise.all([almanac, customer, bazi].map((section) => section.boundingBox()));
      expect(boxes.every(Boolean)).toBe(true);
      for (let i = 1; i < boxes.length; i += 1) expect(boxes[i]!.y).toBeGreaterThanOrEqual(boxes[i - 1]!.y + boxes[i - 1]!.height);
      const titleSize = await customer.locator("h2").evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize));
      expect(titleSize).toBeLessThanOrEqual(28);
      await expect(page.locator("header .zhaowu-brand-seal")).toBeHidden();
      await expect(page.locator("header .zhaowu-brand-name")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    });
  }
});
