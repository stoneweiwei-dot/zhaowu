import { expect, test, type Page } from "@playwright/test";

const PAPER_ROUTES = ["/", "/account", "/tianji-dual", "/yizhangjing"] as const;
async function makeAppOfflineSafe(page: Page) { await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" })); }
function alphaOf(value: string) {
  const rgba = value.match(/rgba?\(([^)]+)\)/);
  if (!rgba) return 1;
  const parts = rgba[1].split(",").map((part) => Number.parseFloat(part.trim()));
  return parts.length >= 4 && Number.isFinite(parts[3]) ? parts[3] : 1;
}

async function gotoStable(page: Page, route: string) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await page.goto(route, { waitUntil: "domcontentloaded" });
    } catch (error) {
      if (attempt === 1) throw error;
      await page.waitForTimeout(80);
      continue;
    }
    await page.waitForTimeout(80);
    if (new URL(page.url()).pathname === route) return;
  }
  expect(new URL(page.url()).pathname).toBe(route);
}

test.describe("iPhone Safari parchment application shell", () => {
  test("keeps dynamic wallpaper and loose scatter out of every application route", async ({ page }) => {
    await makeAppOfflineSafe(page);
    for (const route of PAPER_ROUTES) {
      await gotoStable(page, route);
      expect(await page.evaluate(() => window.innerWidth)).toBe(390);
      await expect(page.locator(".zhaowu-home-sheet-shell")).toBeVisible();
      await expect(page.locator(".zhaowu-site-wallpaper")).toHaveCount(0);
      await expect(page.getByTestId("auspicious-emblem-scatter")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    }
  });

  test("every application page keeps the approved Song landscape on the page background", async ({ page }) => {
    await makeAppOfflineSafe(page);
    for (const route of PAPER_ROUTES) {
      await gotoStable(page, route);
      const backgroundImage = await page.locator("body").evaluate((node) => getComputedStyle(node).backgroundImage);
      expect(backgroundImage).toContain("wallpaper-song.jpg");
    }

    await gotoStable(page, "/");
    await expect(page.locator(".zhaowu-home-intro").first()).toBeVisible();
    await expect(page.locator(".zhaowu-home-hero")).toHaveCount(0);
    await expect(page.locator(".zhaowu-ziwei-feature")).toHaveCount(0);

    const formBackground = await page.locator("#analysisForm").evaluate((node) => getComputedStyle(node).backgroundColor);
    expect(alphaOf(formBackground)).toBeGreaterThanOrEqual(0.98);
  });

  test("does not fetch owner wallpaper assets for application shell rendering", async ({ page }) => {
    let backgroundReads = 0;
    await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
    await page.route("**/rest/v1/background_assets?**", (route) => {
      backgroundReads += 1;
      return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });
    await gotoStable(page, "/account");
    await page.waitForTimeout(250);
    expect(backgroundReads).toBe(0);
  });
});
