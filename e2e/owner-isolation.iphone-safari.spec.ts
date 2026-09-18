import { expect, test, type Page } from "@playwright/test";

async function forceGuestOwnerState(page: Page) {
  await page.route("**/api/owner-session", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ authenticated: false }),
    }),
  );
  await page.route("**/rest/v1/**", (route) =>
    route.fulfill({ status: 503, body: "offline-test" }),
  );
}

for (const path of ["/account", "/gallery"] as const) {
  test(`guest cannot enter owner-only ${path}`, async ({ page }) => {
    await forceGuestOwnerState(page);
    await page.goto(path, { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("#analysisForm")).toBeVisible();
    await expect(page.locator("[data-owner-independent-console]")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /登入|註冊|Sign in|Register/ })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}
