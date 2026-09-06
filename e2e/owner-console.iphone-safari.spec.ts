import { expect, test, type Page } from "@playwright/test";

const OWNER = {
  id: "owner-e2e",
  email: "owner@example.test",
  user_metadata: { name: "SDW" },
};

const SESSION = {
  access_token: "owner-e2e-session",
  refresh_token: "owner-e2e-refresh",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: "bearer",
  user: OWNER,
};

async function installOwner(page: Page) {
  await page.addInitScript((session) => {
    localStorage.setItem("zhaowu.supabase.session.v1", JSON.stringify(session));
  }, SESSION);

  await page.route("**/rest/v1/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/profiles")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([{
          id: OWNER.id,
          email: OWNER.email,
          display_name: "SDW",
          is_owner: true,
          owner_archive_id: null,
          birth_data: null,
        }]),
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
}

async function mobileHealthy(page: Page) {
  expect(await page.evaluate(() => window.innerWidth)).toBe(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
}

test("owner account starts as a compact management dashboard instead of an expanded wall", async ({ page }) => {
  await installOwner(page);
  await page.goto("/account", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "昭梧站主後台", exact: true })).toBeVisible();
  const dashboard = page.locator("[data-owner-console-dashboard]");
  await expect(dashboard).toBeVisible();
  await expect(dashboard.getByRole("button", { name: /背景音樂/ })).toBeVisible();
  await expect(dashboard.getByRole("button", { name: /首頁背景/ })).toBeVisible();
  await expect(dashboard.getByRole("link", { name: /總圖庫/ })).toBeVisible();
  await expect(dashboard.getByRole("button", { name: /客戶報告/ })).toBeVisible();

  const backgrounds = page.locator("main > section").filter({ hasText: "BACKGROUND LIBRARY" });
  const reports = page.locator("main > section").filter({ hasText: "REPORTS" });
  await expect(backgrounds).toBeHidden();
  await expect(reports).toBeHidden();

  await dashboard.getByRole("button", { name: /首頁背景/ }).click();
  await expect(backgrounds).toBeVisible();
  await expect(reports).toBeHidden();
  await mobileHealthy(page);
});

test("owner Gallery keeps the image library collapsed until requested", async ({ page }) => {
  await installOwner(page);
  await page.goto("/gallery", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "昭梧總圖庫", exact: true })).toBeVisible();
  const drawer = page.locator("[data-owner-gallery-drawer]");
  await expect(drawer).toBeVisible();
  await expect(drawer).not.toHaveAttribute("open", "");
  await expect(page.getByText("圖片預設收合，不再整頁鋪開。需要管理時再展開。", { exact: true })).toBeVisible();
  await mobileHealthy(page);
});
