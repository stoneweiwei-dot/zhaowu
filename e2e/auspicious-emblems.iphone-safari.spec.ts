import { expect, test, type Page } from "@playwright/test";

const PAPER_ROUTES = ["/", "/account", "/tianji-dual", "/yizhangjing"] as const;

async function makeAppOfflineSafe(page: Page) {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
}

function alphaOf(value: string) {
  const rgba = value.match(/rgba?\(([^)]+)\)/);
  if (!rgba) return 1;
  const parts = rgba[1].split(",").map((part) => Number.parseFloat(part.trim()));
  return parts.length >= 4 && Number.isFinite(parts[3]) ? parts[3] : 1;
}

test.describe("iPhone Safari parchment application shell", () => {
  test("keeps every application route wallpaper-free and removes loose emblem scatter", async ({ page }) => {
    await makeAppOfflineSafe(page);

    for (const route of PAPER_ROUTES) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(await page.evaluate(() => window.innerWidth)).toBe(390);

      const shell = page.locator(".zhaowu-home-sheet-shell");
      await expect(shell).toBeVisible();
      await expect(page.locator(".zhaowu-site-wallpaper")).toHaveCount(0);
      await expect(page.getByTestId("auspicious-emblem-scatter")).toHaveCount(0);

      const shellAlpha = await shell.evaluate((node) => getComputedStyle(node).backgroundColor);
      expect(alphaOf(shellAlpha)).toBe(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    }
  });

  test("keeps the homepage full-width and readable without wallpaper gutters", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const frame = page.locator(".zhaowu-home-app-frame").first();
    await expect(frame).toBeVisible();
    const frameBox = await frame.boundingBox();
    expect(frameBox).not.toBeNull();
    if (frameBox) {
      expect(frameBox.x).toBeLessThanOrEqual(1);
      expect(frameBox.width).toBeGreaterThanOrEqual(388);
    }

    const hero = page.locator(".zhaowu-home-hero").first();
    await expect(hero).toBeVisible();
    const heroBackground = await hero.evaluate((node) => getComputedStyle(node).backgroundColor);
    expect(alphaOf(heroBackground)).toBe(1);
    await expect(page.locator(".zhaowu-specialist-mark")).toHaveCount(0);
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
    await expect(page.locator(".zhaowu-site-wallpaper")).toHaveCount(0);
  });
});
