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

test.describe("iPhone Safari owner-only authentication boundary", () => {
  test("an unverified legacy member session is rejected from Account", async ({ page }) => {
    await installStoredSession(page);
    await page.goto("/account", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByRole("heading", { name: "昭梧站主後台", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "站主登入", exact: true })).toBeVisible();
    await expect(page.getByText(USER.email, { exact: false })).toHaveCount(0);
    await mobileHealthy(page);
  });

  test("an unverified legacy member session does not create an Account entry on Home", async ({ page }) => {
    await installStoredSession(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("link", { name: "站主登入", exact: true }).first()).toBeVisible();
    await expect(page.locator('a[href="/account"]')).toHaveCount(0);
    await expect(page.getByText(USER.email, { exact: false })).toHaveCount(0);
    await mobileHealthy(page);
  });
});
