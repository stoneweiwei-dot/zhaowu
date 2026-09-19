import { expect, test, type Page } from "@playwright/test";

const USER = {
  id: "member-test",
  email: "member@example.test",
  user_metadata: { name: "測試會員" },
};

const SESSION = {
  access_token: "e2e-session",
  refresh_token: "e2e-refresh",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: "bearer",
  user: USER,
};

async function installStoredSession(page: Page) {
  await page.addInitScript((session) => {
    localStorage.setItem("zhaowu.supabase.session.v1", JSON.stringify(session));
  }, SESSION);
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
}

async function mobileHealthy(page: Page) {
  expect(await page.evaluate(() => window.innerWidth)).toBe(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
}

test.describe("iPhone Safari member vs owner account flow", () => {
  test("a stored member session cannot unlock the independent owner console", async ({ page }) => {
    await installStoredSession(page);
    await page.goto("/account", { waitUntil: "domcontentloaded" });

    await expect(page.locator("[data-owner-independent-console]")).toHaveCount(0);
    await expect(page.getByText("OWNER CONSOLE", { exact: true })).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "客人資料", exact: true })).toBeVisible();
    await mobileHealthy(page);
  });

  test("a stored member session still leaves the public home birth form available", async ({ page }) => {
    await installStoredSession(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "客人資料", exact: true })).toBeVisible();
    await mobileHealthy(page);
  });
});
