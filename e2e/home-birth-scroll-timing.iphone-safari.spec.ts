import { expect, test, type Page } from "@playwright/test";

async function makeAppOfflineSafe(page: Page) {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
}

async function dismissInstallPromptIfVisible(page: Page) {
  const button = page.getByRole("button", { name: "稍後再說", exact: true });
  if (await button.isVisible().catch(() => false)) await button.click();
}

test.describe("iPhone Safari 390px smooth scroll and keyboard focus timing", () => {
  test.use({
    viewport: { width: 390, height: 844 },
  });

  test("clicking birth entry CTA triggers smooth scroll and safely focuses birth-year after RAF and delay", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await dismissInstallPromptIfVisible(page);

    // Initial state: form is not yet visible in DOM
    const birthForm = page.locator("#birth-form");
    await expect(birthForm).toHaveCount(0);

    // Find and click the hero CTA ticket
    const entryButton = page.locator("[data-home-birth-entry]");
    await expect(entryButton).toBeVisible();
    await entryButton.click();

    // After click: Form mounts in DOM
    await expect(birthForm).toBeVisible({ timeout: 5000 });

    // The year input field should become visible
    const birthYearInput = page.locator("#birth-year");
    await expect(birthYearInput).toBeVisible();

    // Verify focus is acquired after the 350ms timing delay (preventing iOS keyboard jump during scroll)
    await expect(birthYearInput).toBeFocused({ timeout: 5000 });

    // Verify bounding box on 390px viewport: input should be comfortably in view
    const box = await birthYearInput.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeLessThan(844);
    }
  });

  test("direct URL with #birth-form hash expands form without popping keyboard prematurely", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/#birth-form", { waitUntil: "domcontentloaded" });
    await dismissInstallPromptIfVisible(page);

    // Form should auto-expand via hash
    const birthForm = page.locator("#birth-form");
    await expect(birthForm).toBeVisible({ timeout: 5000 });

    // Wait 500ms for initial load to settle
    await page.waitForTimeout(500);

    // On mobile Safari, initial hash visit must not force keyboard focus
    const birthYearInput = page.locator("#birth-year");
    await expect(birthYearInput).toBeVisible();
    await expect(birthYearInput).not.toBeFocused();
  });

  test("fallback anchor #analysis also expands form for legacy compatibility", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/#analysis", { waitUntil: "domcontentloaded" });
    await dismissInstallPromptIfVisible(page);

    const birthForm = page.locator("#birth-form");
    await expect(birthForm).toBeVisible({ timeout: 5000 });
  });
});
