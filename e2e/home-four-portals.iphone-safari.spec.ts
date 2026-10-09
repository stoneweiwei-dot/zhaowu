import { expect, test, type Page } from "@playwright/test";

async function makeAppOfflineSafe(page: Page) {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
}

async function dismissInstallPromptIfVisible(page: Page) {
  const button = page.getByRole("button", { name: "稍後再說", exact: true });
  if (await button.isVisible().catch(() => false)) await button.click();
}

test.describe("iPhone Safari 390px Four Portals Navigation and View Switching", () => {
  test.use({
    viewport: { width: 390, height: 844 },
  });

  test("homepage renders four big portals and allows switching between dedicated views and returning home", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await dismissInstallPromptIfVisible(page);

    // Initial state: four portal cards visible on home screen
    const portalForm = page.locator("[data-home-card='form']");
    const portalToday = page.locator("[data-home-card='today']");
    const portalQuiz = page.locator("[data-home-card='quiz']");
    const portalNotes = page.locator("[data-home-card='notes']");

    await expect(portalForm).toBeVisible();
    await expect(portalToday).toBeVisible();
    await expect(portalQuiz).toBeVisible();
    await expect(portalNotes).toBeVisible();

    // 1. Click Today portal -> switches to dedicated today view
    await portalToday.click();
    await expect(page.locator("[data-subview-header]")).toBeVisible();
    await expect(page.locator("#home-today-guide")).toBeVisible();
    await expect(portalToday).toHaveCount(0); // main portals hidden in dedicated view

    // Click back to home
    const backBtn = page.locator("[data-subview-back]");
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    // Verify returned to home: four cards visible again
    await expect(portalForm).toBeVisible();
    await expect(portalToday).toBeVisible();

    // 2. Click Quiz portal -> switches to dedicated quiz view
    await portalQuiz.click();
    await expect(page.locator("[data-subview-header]")).toBeVisible();
    await expect(page.locator(".zhaowu-home-fun-grid")).toBeVisible();

    // Return to home again
    await page.locator("[data-subview-back]").click();
    await expect(portalQuiz).toBeVisible();
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
