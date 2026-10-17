import { expect, test } from "@playwright/test";

test("unpaid iPhone visitors never see the premium poetic afterword", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("zhaowu.locale", "zh-Hant");
    localStorage.setItem("zhaowu.birth-record.v1", JSON.stringify({
      year: 1990, month: 6, day: 15, hour: 10, minute: 30, timeUnknown: false,
      gender: "male", relation: "unset",
      city: { name: "Sydney", display: "Sydney", country: "AU", timezone: "Australia/Sydney", latitude: -33.87, longitude: 151.21 },
    }));
    // Browser flags / edited localStorage must not constitute a paid entitlement.
    localStorage.setItem("zhaowu.poetry.zenith", "true");
    localStorage.setItem("zhaowu.report.access.level", "bundle");
  });
  await page.route("**/api/owner-session", (route) => route.fulfill({
    status: 200, contentType: "application/json", body: JSON.stringify({ authenticated: false }),
  }));
  await page.goto("/numerology", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-report-access="quick"]')).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('[data-premium-poetic-afterword="true"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("verified-owner preview renders the literary afterword at the end without mobile overflow", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("zhaowu.locale", "zh-Hant");
    localStorage.setItem("zhaowu.birth-record.v1", JSON.stringify({
      year: 1990, month: 6, day: 15, hour: 10, minute: 30, timeUnknown: false,
      gender: "male", relation: "unset",
      city: { name: "Sydney", display: "Sydney", country: "AU", timezone: "Australia/Sydney", latitude: -33.87, longitude: 151.21 },
    }));
  });
  // This mocked owner response tests DOM layout only; it is not payment-auth evidence.
  await page.route("**/api/owner-session", (route) => route.fulfill({
    status: 200, contentType: "application/json", body: JSON.stringify({ authenticated: true }),
  }));
  await page.goto("/numerology", { waitUntil: "domcontentloaded" });
  const afterword = page.locator('[data-premium-poetic-afterword="true"]');
  await expect(afterword).toBeVisible({ timeout: 20_000 });
  await expect(afterword.getByRole("link")).toHaveAttribute("href", /wikisource\.org/);
  await expect(afterword).toContainText("詩證天機");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
