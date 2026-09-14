import { expect, test, type Page, type Route } from "@playwright/test";

const USER = { id: "save-test", email: "save@example.test", user_metadata: { name: "保存流程測試會員" } };
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
  display_name: "保存流程測試會員",
  is_owner: false,
  owner_archive_id: null,
  birth_data: null,
};
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "access-control-allow-headers": "authorization, apikey, content-type, prefer, x-client-info",
};

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({ status, contentType: "application/json", headers: CORS, body: JSON.stringify(body) });
}
async function noContent(route: Route) { await route.fulfill({ status: 204, headers: CORS, body: "" }); }
async function installSession(page: Page) {
  await page.addInitScript((session) => localStorage.setItem("zhaowu.supabase.session.v1", JSON.stringify(session)), SESSION);
}
async function mockAuthenticatedCloud(page: Page, reportStatus = 200) {
  await page.route("**/auth/v1/**", async (route) => {
    const request = route.request();
    if (request.method() === "OPTIONS") return noContent(route);
    const url = new URL(request.url());
    if (url.pathname.endsWith("/user")) return json(route, USER);
    if (url.pathname.endsWith("/token")) return json(route, SESSION);
    return json(route, {});
  });
  await page.route("**/rest/v1/**", async (route) => {
    const request = route.request();
    if (request.method() === "OPTIONS") return noContent(route);
    const url = new URL(request.url());
    if (url.pathname.endsWith("/profiles")) return json(route, [PROFILE]);
    if (url.pathname.endsWith("/site_settings")) return json(route, [{ key: "migration_state", value: { ready: true } }]);
    if (url.pathname.endsWith("/report_requests")) {
      if (request.method() === "GET") return json(route, []);
      if (reportStatus >= 400) return json(route, { message: "temporary persistence outage" }, reportStatus);
      const raw = request.postData();
      let payload: Record<string, unknown> = {};
      try { payload = raw ? JSON.parse(raw) as Record<string, unknown> : {}; } catch { payload = {}; }
      const queryId = url.searchParams.get("id")?.replace(/^eq\./, "") ?? null;
      return json(route, [{ id: payload.id ?? queryId ?? "generated-report", ...payload, created_at: "2026-08-26T00:00:00.000Z", updated_at: "2026-08-26T00:00:00.000Z" }]);
    }
    return json(route, []);
  });
}
async function fillKnownBirthData(page: Page) {
  await page.locator("#birth-year").fill("1988");
  await page.locator("#birth-month").fill("10");
  await page.locator("#birth-day").fill("4");
  await page.locator("#birth-hour").fill("4");
  await page.locator("#birth-minute").fill("40");
  await page.locator("#birth-city").click();
  const firstCity = page.locator('#birth-city-results [role="option"]').first();
  await expect(firstCity).toBeVisible();
  await firstCity.click();
}
async function dismissInstallPrompt(page: Page) {
  const dismiss = page.getByRole("button", { name: "稍後再說", exact: true });
  await expect(dismiss).toBeVisible();
  await dismiss.click();
}
async function mobileHealthy(page: Page) {
  expect(await page.evaluate(() => window.innerWidth)).toBe(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
}

test("Guest saves the birth record without a self-Q&A sheet", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await dismissInstallPrompt(page);
  await fillKnownBirthData(page);
  await page.getByRole("button", { name: "保存生辰", exact: true }).click();
  await expect(page.locator(".zhaowu-birth-summary")).toBeVisible();
  await expect(page.locator("#analysis-question")).toHaveCount(0);
  await expect(page.getByText("此刻，你最想了解什麼？", { exact: true })).toHaveCount(0);
  await mobileHealthy(page);
});

test("Guest birth record stays on the phone without Supabase persistence", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await dismissInstallPrompt(page);
  await fillKnownBirthData(page);
  await page.getByRole("button", { name: "保存生辰", exact: true }).click();
  await expect(page.locator(".zhaowu-birth-summary")).toBeVisible();
  await expect(page.locator('[data-specialist-link="indian"]')).toBeVisible();
  await mobileHealthy(page);
});
});
