import { expect, test, type Page } from "@playwright/test";

const PAPER_ROUTES = ["/", "/tianji-dual", "/yizhangjing", "/daily-colors"] as const;
const SHARED_BIRTH = {
  year: 1988, month: 10, day: 4, hour: 4, minute: 40, timeUnknown: false, gender: "male", relation: "unset",
  city: { name: "Sydney", country: "Australia", display: "Sydney, Australia", timezone: "Australia/Sydney", latitude: -33.8688, longitude: 151.2093 },
  liveCity: null, ziPolicy: "midnight", useTrueSolar: true,
};
async function makeAppOfflineSafe(page: Page) { await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" })); }
async function seedPublicBirth(page: Page) {
  await page.addInitScript((record) => {
    localStorage.setItem("zhaowu.birth-record.v1", JSON.stringify(record));
    localStorage.setItem("zhaowu.birth-record-owner.v1", "__zhaowu_guest__");
  }, SHARED_BIRTH);
}
function alphaOf(value: string) {
  const rgba = value.match(/rgba?\(([^)]+)\)/);
  if (!rgba) return 1;
  const parts = rgba[1].split(",").map((part) => Number.parseFloat(part.trim()));
  return parts.length >= 4 && Number.isFinite(parts[3]) ? parts[3] : 1;
}

test.describe("iPhone Safari parchment application shell", () => {
  for (const route of PAPER_ROUTES) {
    test(`keeps the parchment shell contract on ${route}`, async ({ page }) => {
      await makeAppOfflineSafe(page);
      await seedPublicBirth(page);
      await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(await page.evaluate(() => window.innerWidth)).toBe(390);
      await expect(page.locator(".zhaowu-home-sheet-shell")).toBeVisible();
      await expect(page.locator(".zhaowu-site-wallpaper")).toHaveCount(0);
      await expect(page.getByTestId("auspicious-emblem-scatter")).toHaveCount(0);
      const backgroundImage = await page.locator("body").evaluate((node) => getComputedStyle(node).backgroundImage);
      expect(backgroundImage).not.toBe("none");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    });
  }

  test("home keeps the transparent BaZi hub and separate client-details paper card", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await seedPublicBirth(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#analysisForm")).toBeVisible();
    await expect(page.locator(".zhaowu-home-hero")).toHaveCount(0);
    await expect(page.locator(".zhaowu-ziwei-feature")).toHaveCount(0);

    const baziBackground = await page.locator(".zhaowu-bazi-hub").evaluate((node) => getComputedStyle(node).backgroundColor);
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

  test("home colour card opens the full daily-colors guide and lets the visitor override today's cue", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const homeCard = page.locator("#five-element-wardrobe");
    await expect(homeCard).toBeVisible();
    await expect(homeCard.getByRole("heading", { name: "每日穿衣｜五行色彩", exact: true })).toBeVisible();
    await expect(homeCard.locator("[data-daily-colors-today] > p").first()).toContainText("今日適合：");
    await homeCard.locator('[data-daily-color-id="hanxu"]').click();
    await expect(homeCard.locator("[data-daily-colors-quote]")).toContainText("涵虛");
    await homeCard.getByRole("link", { name: "查看完整建議", exact: true }).click();
    await expect(page).toHaveURL(/\/daily-colors$/);
    const pageCard = page.locator("#five-element-wardrobe");
    await expect(pageCard).toBeVisible();
    await expect(pageCard.getByText("不是改運、招財或古籍穿著律令")).toBeVisible();
    await pageCard.locator('[data-daily-color-id="liujin"]').click();
    await expect(pageCard.locator("[data-daily-colors-quote]")).toContainText("鏤金");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
});
