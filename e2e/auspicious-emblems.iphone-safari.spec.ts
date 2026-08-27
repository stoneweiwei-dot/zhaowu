import { expect, test, type Page } from "@playwright/test";

const DECORATED_ROUTES = ["/login", "/account", "/tianji-dual", "/yizhangjing"] as const;

async function makeAppOfflineSafe(page: Page) {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
}

async function expectAuspiciousEmblemsHealthy(page: Page, route: (typeof DECORATED_ROUTES)[number]) {
  const scatter = page.getByTestId("auspicious-emblem-scatter");
  await expect(scatter).toBeAttached();
  expect(await scatter.evaluate((node) => getComputedStyle(node).pointerEvents)).toBe("none");

  const scatterZIndex = await scatter.evaluate((node) => Number.parseInt(getComputedStyle(node).zIndex || "0", 10));
  expect(scatterZIndex).toBeGreaterThanOrEqual(20);

  const contentLayer = route === "/login"
    ? page.locator(".zhaowu-login-shell > div.relative.z-10").first()
    : page.locator(".zhaowu-app-frame").first();
  await expect(contentLayer).toBeAttached();
  const contentZIndex = await contentLayer.evaluate((node) => Number.parseInt(getComputedStyle(node).zIndex || "0", 10));
  expect(scatterZIndex).toBeGreaterThan(contentZIndex);

  const emblems = scatter.locator("img.zhaowu-random-emblem");
  await expect(emblems).toHaveCount(6);
  await expect.poll(async () => emblems.evaluateAll((nodes) =>
    nodes.every((node) => {
      const image = node as HTMLImageElement;
      return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
    }),
  )).toBe(true);

  const sources = await emblems.evaluateAll((nodes) => nodes.map((node) => (node as HTMLImageElement).getAttribute("src")));
  expect(new Set(sources).size).toBe(6);
  expect(sources.every((source) => Boolean(source?.startsWith("/ornaments/generated/") && source.endsWith(".webp")))).toBe(true);
  expect(sources.some((source) => source?.includes("/emblems/") || source?.endsWith(".svg"))).toBe(false);

  for (let index = 0; index < 4; index += 1) {
    const emblem = emblems.nth(index);
    await expect(emblem).toBeVisible();
    expect(await emblem.evaluate((node) => getComputedStyle(node).pointerEvents)).toBe("none");
    expect(await emblem.evaluate((node) => Number.parseFloat(getComputedStyle(node).opacity))).toBeGreaterThanOrEqual(0.92);
    const box = await emblem.boundingBox();
    expect(box).not.toBeNull();
    if (!box) continue;
    expect(box.width).toBeGreaterThanOrEqual(72);
    expect(box.height).toBeGreaterThanOrEqual(72);
    const visibleWidth = Math.min(390, box.x + box.width) - Math.max(0, box.x);
    const visibleHeight = Math.min(844, box.y + box.height) - Math.max(0, box.y);
    expect(visibleWidth).toBeGreaterThanOrEqual(46);
    expect(visibleHeight).toBeGreaterThanOrEqual(46);
  }

  await expect(emblems.nth(4)).toBeHidden();
  await expect(emblems.nth(5)).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
}

test.describe("iPhone Safari homepage sheet and route ornaments", () => {
  test("keeps painterly WebP ornaments on non-home routes without blocking content", async ({ page }) => {
    await makeAppOfflineSafe(page);

    for (const route of DECORATED_ROUTES) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(await page.evaluate(() => window.innerWidth)).toBe(390);
      await expectAuspiciousEmblemsHealthy(page, route);
    }
  });

  test("renders the homepage as one closed parchment sheet with no wallpaper or loose emblem scatter", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    expect(await page.evaluate(() => window.innerWidth)).toBe(390);
    await expect(page.locator(".zhaowu-home-sheet-shell")).toBeVisible();
    await expect(page.locator(".zhaowu-site-wallpaper")).toHaveCount(0);
    await expect(page.getByTestId("auspicious-emblem-scatter")).toHaveCount(0);

    const frame = page.locator(".zhaowu-home-app-frame").first();
    await expect(frame).toBeVisible();
    const frameBox = await frame.boundingBox();
    expect(frameBox).not.toBeNull();
    if (frameBox) {
      expect(frameBox.x).toBeLessThanOrEqual(1);
      expect(frameBox.width).toBeGreaterThanOrEqual(388);
    }

    const shellAlpha = await page.locator(".zhaowu-home-sheet-shell").evaluate((node) => {
      const value = getComputedStyle(node).backgroundColor;
      const rgba = value.match(/rgba?\(([^)]+)\)/);
      if (!rgba) return 1;
      const parts = rgba[1].split(",").map((part) => Number.parseFloat(part.trim()));
      return parts.length >= 4 && Number.isFinite(parts[3]) ? parts[3] : 1;
    });
    expect(shellAlpha).toBe(1);

    const hero = page.locator(".zhaowu-home-hero").first();
    await expect(hero).toBeVisible();
    const heroAlpha = await hero.evaluate((node) => {
      const value = getComputedStyle(node).backgroundColor;
      const rgba = value.match(/rgba?\(([^)]+)\)/);
      if (!rgba) return 1;
      const parts = rgba[1].split(",").map((part) => Number.parseFloat(part.trim()));
      return parts.length >= 4 && Number.isFinite(parts[3]) ? parts[3] : 1;
    });
    expect(heroAlpha).toBe(1);

    await expect(page.locator(".zhaowu-specialist-mark")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });

  test("keeps owner-managed wallpaper available away from the homepage", async ({ page }) => {
    await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));

    let backgroundReads = 0;
    await page.route("**/rest/v1/background_assets?**", (route) => {
      backgroundReads += 1;
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "11111111-1111-4111-8111-111111111111",
            source: "upload",
            name: "owner-wallpaper.webp",
            storage_path: "2026-08-27/owner-wallpaper.webp",
            content_type: "image/webp",
            enabled: true,
            days_of_week: [],
            start_date: null,
            end_date: null,
            theme: "wallpaper",
            created_at: "2026-08-27T00:00:00.000Z",
            updated_at: "2026-08-27T00:00:00.000Z",
          },
        ]),
      });
    });

    await page.goto("/tianji-dual", { waitUntil: "domcontentloaded" });
    await expect.poll(() => backgroundReads).toBeGreaterThan(0);

    const wallpaper = page.locator(".zhaowu-site-wallpaper");
    await expect(wallpaper).toBeAttached();
    await expect(wallpaper).toHaveAttribute("style", /zhaowu-backgrounds.*owner-wallpaper\.webp/);

    const reportSurfaceAlpha = await page.evaluate(() => {
      const report = document.createElement("section");
      report.className = "zhaowu-focused-report";
      const card = document.createElement("article");
      card.className = "zhaowu-report-section";
      report.append(card);
      document.body.append(report);
      const parseAlpha = (value: string) => {
        const rgba = value.match(/rgba?\(([^)]+)\)/);
        if (!rgba) return 1;
        const parts = rgba[1].split(",").map((part) => Number.parseFloat(part.trim()));
        return parts.length >= 4 && Number.isFinite(parts[3]) ? parts[3] : 1;
      };
      const value = {
        report: parseAlpha(getComputedStyle(report).backgroundColor),
        card: parseAlpha(getComputedStyle(card).backgroundColor),
      };
      report.remove();
      return value;
    });
    expect(reportSurfaceAlpha.report).toBeGreaterThanOrEqual(0.94);
    expect(reportSurfaceAlpha.card).toBeGreaterThanOrEqual(0.94);
  });
});
