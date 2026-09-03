import { expect, test, type Page, type Route } from "@playwright/test";

const USER = { id: "member-test", email: "member@example.test", user_metadata: { name: "測試會員" } };
const SESSION = {
  access_token: "test",
  refresh_token: "test",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: "bearer",
  user: USER,
};
const PROFILE = {
  id: USER.id,
  email: USER.email,
  display_name: "測試會員",
  is_owner: false,
  owner_archive_id: null,
  birth_data: { year: 1988, month: 10, day: 4, hour: 4, minute: 40 },
};
const REPORT = {
  id: "report-test",
  user_email: USER.email,
  alias: "會員流程測試報告",
  record_kind: "analysis",
  status: "full_ready",
  access_mode: "member",
  payment_tier: "full",
  payment_status: "not_required",
  context: { question: "會員流程測試報告", cityLabel: "Sydney, Australia", dayMaster: "壬水" },
  created_at: "2026-08-26T00:00:00.000Z",
  updated_at: "2026-08-26T00:00:00.000Z",
};

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "access-control-allow-headers": "authorization, apikey, content-type, prefer",
  "access-control-expose-headers": "content-range",
};

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({ status, contentType: "application/json", headers: CORS, body: status === 204 ? "" : JSON.stringify(body) });
}

async function mockBackend(page: Page) {
  await page.route("**/rest/v1/**", async (route) => {
    const request = route.request();
    if (request.method() === "OPTIONS") return json(route, {}, 204);
    const url = new URL(request.url());
    if (url.pathname.endsWith("/profiles")) return json(route, [PROFILE]);
    if (url.pathname.endsWith("/report_requests")) return json(route, request.method() === "GET" ? [REPORT] : []);
    if (url.pathname.endsWith("/site_settings")) return json(route, [{ key: "migration_state", value: { ready: true } }]);
    return json(route, []);
  });
}

async function mobileHealthy(page: Page) {
  expect(await page.evaluate(() => window.innerWidth)).toBe(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
}

test.describe("iPhone Safari authenticated member flow", () => {
  test("login persists the session and keeps Account available", async ({ page }) => {
    await mockBackend(page);
    let grantCalled = false;
    await page.route(/\/auth\/v1\/token\?grant_type=password$/, async (route) => {
      if (route.request().method() === "OPTIONS") return json(route, {}, 204);
      grantCalled = true;
      return json(route, { access_token: SESSION.access_token, refresh_token: SESSION.refresh_token, expires_in: 3600, token_type: "bearer", user: USER });
    });

    await page.goto("/login", { waitUntil: "domcontentloaded" });
    const sheet = page.locator(".stone-login-sheet");
    await expect(sheet).toBeVisible();
    const layout = await sheet.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, left: rect.left, right: rect.right, position: getComputedStyle(element).position };
    });
    expect(layout.position).toBe("relative");
    expect(layout.width).toBeGreaterThanOrEqual(320);
    expect(layout.left).toBeGreaterThanOrEqual(0);
    expect(layout.right).toBeLessThanOrEqual(390);

    await page.locator("#login-email").fill(USER.email);
    await page.locator("#login-password").fill("test-password");
    await page.locator(".stone-login-form button[type=submit]").click();
    await expect.poll(() => grantCalled).toBe(true);
    await expect(page).toHaveURL(/\/$/);
    expect(await page.evaluate(() => localStorage.getItem("zhaowu.supabase.session.v1"))).toContain(USER.id);

    await page.goto("/account", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByText("會員流程測試報告", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "登入", exact: true })).toHaveCount(0);
    await mobileHealthy(page);
  });

  test("a stored session restores Account without redirecting to login", async ({ page }) => {
    await page.addInitScript((session) => localStorage.setItem("zhaowu.supabase.session.v1", JSON.stringify(session)), SESSION);
    await mockBackend(page);
    await page.goto("/account", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByRole("heading", { name: "我的昭梧", exact: true })).toBeVisible();
    await expect(page.getByText("會員流程測試報告", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "登入", exact: true })).toHaveCount(0);
    await mobileHealthy(page);
  });
});