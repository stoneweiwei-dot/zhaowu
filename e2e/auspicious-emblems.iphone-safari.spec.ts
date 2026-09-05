import { expect, test, type Page } from "@playwright/test";

const PAPER_ROUTES = ["/", "/account", "/tianji-dual", "/yizhangjing"] as const;
async function makeAppOfflineSafe(page: Page) { await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" })); }
function alphaOf(value: string) {
  const rgba = value.match(/rgba?\(([^)]+)\)/);
  if (!rgba) return 1;
  const parts = rgba[1].split(",").map((part) => Number.parseFloat(part.trim()));
  return parts.length >= 4 && Number.isFinite(parts[3]) ? parts[3] : 1;
}

test.describe("iPhone Safari parchment application shell", () => {
  test("keeps dynamic wallpaper and loose scatter out of every application route", async ({ page }) => {
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

  test("every application page keeps an explicit parchment background", async ({ page }) => {
    await makeAppOfflineSafe(page);
    for (const route of PAPER_ROUTES) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator(".zhaowu-home-sheet-shell")).toBeVisible();
      const backgroundImage = await page.locator("body").evaluate((node) => getComputedStyle(node).backgroundImage);
      expect(backgroundImage).not.toBe("none");
    }

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#analysisForm")).toBeVisible();
    await expect(page.locator(".zhaowu-home-hero")).toHaveCount(0);
    await expect(page.locator(".zhaowu-ziwei-feature")).toHaveCount(0);

    const formBackground = await page.locator("#analysisForm").evaluate((node) => getComputedStyle(node).backgroundColor);
    const alpha = alphaOf(formBackground);
    // r55 deliberately thins only the homepage paper so the selected artwork remains visible.
    expect(alpha).toBeGreaterThanOrEqual(0.55);
    expect(alpha).toBeLessThanOrEqual(0.62);
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
});
