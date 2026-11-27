import { expect, test, type Page } from "@playwright/test";

async function makeAppOfflineSafe(page: Page) {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
}

async function dismissInstallPromptIfVisible(page: Page) {
  const button = page.getByRole("button", { name: "稍後再說", exact: true });
  if (await button.isVisible().catch(() => false)) await button.click();
}

test.describe("iPhone Safari 390px Homepage Navigation and View Switching", () => {
  test.use({
    viewport: { width: 390, height: 844 },
  });

  test("homepage renders four navigation cells and allows switching between dedicated views and returning home", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await dismissInstallPromptIfVisible(page);

    const cards = page.locator("[data-home-card]");
    await expect(page.locator("[data-home-card='today']")).toHaveCount(0);
    const flow = page.locator("[data-home-card='wuxing']");
    await expect(page.locator("[data-home-birth-entry]")).toBeVisible();
    await expect(cards).toHaveCount(4);
    for (const card of await cards.all()) await expect(card.locator(".zw-entry")).toBeVisible();

    await flow.locator(".zw-entry").click();
    await flow.getByRole("button", { name: /看今天的黃曆|看今天的黄历|Open today’s almanac/ }).click();
    await expect(page.locator("[data-subview-header]")).toBeVisible();
    await expect(page.locator("#home-today-guide")).toBeVisible();
    await expect(cards).toHaveCount(0); // main portals hidden in dedicated view

    // Click back to home
    const backBtn = page.locator("[data-subview-back]");
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(cards).toHaveCount(4);
    await expect(flow.locator(".zw-entry")).toBeVisible();
    await flow.locator(".zw-entry").click();
    await flow.locator('[aria-controls="ph-tree-branch-element-lore"]').click();
    await flow.getByRole("button", { name: /五行香氣譜|五行香气谱|Scent map/ }).click();
    await expect(page.locator("[data-subview-header]")).toBeVisible();
    await expect(page.locator(".zhaowu-home-fun-grid")).toBeVisible();

    // Return to home again
    await page.locator("[data-subview-back]").click();
    await expect(page.locator("[data-home-card='quiz'] .zw-entry")).toBeVisible();
  });

  test("direct URL hash #today opens dedicated today view immediately", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/#today", { waitUntil: "domcontentloaded" });
    await dismissInstallPromptIfVisible(page);

    await expect(page.locator("[data-subview-header]")).toBeVisible();
    await expect(page.locator("#home-today-guide")).toBeVisible();
  });

  test("direct URL hash #quiz opens dedicated quiz view immediately", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/#quiz", { waitUntil: "domcontentloaded" });
    await dismissInstallPromptIfVisible(page);

    await expect(page.locator("[data-subview-header]")).toBeVisible();
    await expect(page.locator(".zhaowu-home-fun-grid")).toBeVisible();
  });

  test("direct URL hash #notes opens dedicated notes view immediately", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/#notes", { waitUntil: "domcontentloaded" });
    await dismissInstallPromptIfVisible(page);

    await expect(page.locator("[data-subview-header]")).toBeVisible();
  });
});
