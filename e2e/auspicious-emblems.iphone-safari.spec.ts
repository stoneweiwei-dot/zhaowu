import { expect, test, type Page } from "@playwright/test";

const CORE_ROUTES = ["/", "/login", "/account", "/tianji-dual", "/yizhangjing"] as const;

async function makeAppOfflineSafe(page: Page) {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
}

async function expectAuspiciousEmblemsHealthy(page: Page, route: (typeof CORE_ROUTES)[number]) {
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

  for (let index = 0; index < 4; index += 1) {
    const emblem = emblems.nth(index);
    await expect(emblem).toBeVisible();
    expect(await emblem.evaluate((node) => getComputedStyle(node).pointerEvents)).toBe("none");
    expect(await emblem.evaluate((node) => Number.parseFloat(getComputedStyle(node).opacity))).toBeGreaterThanOrEqual(0.8);
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

test.describe("iPhone Safari auspicious emblem scatter", () => {
  test("renders above page material without blocking core routes", async ({ page }) => {
    await makeAppOfflineSafe(page);

    for (const route of CORE_ROUTES) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(await page.evaluate(() => window.innerWidth)).toBe(390);
      await expectAuspiciousEmblemsHealthy(page, route);
    }
  });
});
