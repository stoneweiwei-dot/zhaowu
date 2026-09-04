import { expect, test, type Page, type Route } from "@playwright/test";

const TEST_USER = {
  id: "user-e2e-member",
  email: "member-e2e@zhaowu.test",
  user_metadata: { name: "測試會員" },
};

const TEST_SESSION = {
  access_token: "e2e-access-token",
  refresh_token: "e2e-refresh-token",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: "bearer",
  user: TEST_USER,
};

const TEST_PROFILE = {
  id: TEST_USER.id,
  email: TEST_USER.email,
  display_name: "測試會員",
  is_owner: false,
  owner_archive_id: null,
  birth_data: { year: 1988, month: 10, day: 4, hour: 4, minute: 40 },
};

const TEST_REPORT = {
  id: "e2e-report-001",
  user_email: TEST_USER.email,
  alias: "會員流程測試報告",
  record_kind: "analysis",
  status: "full_ready",
  access_mode: "member",
  payment_tier: "full",
  payment_status: "not_required",
  context: {
    question: "會員流程測試報告",
    cityLabel: "Sydney, Australia",
    dayMaster: "壬水",
    ganZhiLine: "戊辰 辛酉 壬辰 壬寅",
    createdAt: "2026-08-26T00:00:00.000Z",
  },
  created_at: "2026-08-26T00:00:00.000Z",
  updated_at: "2026-08-26T00:00:00.000Z",
};

async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

async function mockMemberBackend(page: Page) {
  await page.route("**/rest/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname.endsWith("/profiles")) {
      return fulfillJson(route, [TEST_PROFILE]);
    }

    if (url.pathname.endsWith("/site_settings")) {
      return fulfillJson(route, [{ key: "migration_state", value: { ready: true } }]);
    }

    return fulfillJson(route, []);
  });

  await page.route("**/rest/v1/report_requests**", async (route) => {
    if (route.request().method() === "GET") return fulfillJson(route, [TEST_REPORT]);
    return fulfillJson(route, []);
  });
}

async function mockAuthBackend(page: Page, onPasswordGrant?: () => void) {
  await page.route("**/auth/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname.endsWith("/token")) {
      const grantType = url.searchParams.get("grant_type");
      if (grantType === "password") onPasswordGrant?.();
      if (grantType === "password" || grantType === "refresh_token") {
        return fulfillJson(route, {
          access_token: TEST_SESSION.access_token,
          refresh_token: TEST_SESSION.refresh_token,
          expires_in: TEST_SESSION.expires_in,
          token_type: TEST_SESSION.token_type,
          user: TEST_USER,
        });
      }
    }

    if (url.pathname.endsWith("/user")) return fulfillJson(route, TEST_USER);
    if (url.pathname.endsWith("/logout")) return fulfillJson(route, {});
    return fulfillJson(route, {});
  });
}

async function expectMobileViewportHealthy(page: Page) {
  expect(await page.evaluate(() => window.innerWidth)).toBe(390);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
}

test.describe("iPhone Safari authenticated member flow", () => {
  test("Password login persists the session, returns to BaZi, and keeps Account available", async ({ page }) => {
    await mockMemberBackend(page);

    let passwordGrantCalled = false;
    await mockAuthBackend(page, () => { passwordGrantCalled = true; });

    await page.goto("/login", { waitUntil: "domcontentloaded" });
    const loginSheet = page.locator(".stone-login-sheet");
    await expect(loginSheet).toBeVisible();
    const loginLayout = await loginSheet.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        width: rect.width,
        left: rect.left,
        right: rect.right,
        position: style.position,
        opacity: Number(style.opacity),
      };
    });
    expect(loginLayout.position).toBe("relative");
    expect(loginLayout.opacity).toBeGreaterThanOrEqual(0.95);
    expect(loginLayout.width).toBeGreaterThanOrEqual(320);
    expect(loginLayout.left).toBeGreaterThanOrEqual(0);
    expect(loginLayout.right).toBeLessThanOrEqual(390);
    await expect(page.getByRole("tab", { name: "登入", exact: true })).toHaveAttribute("aria-selected", "true");
    await expectMobileViewportHealthy(page);

    await page.locator("#login-email").fill(TEST_USER.email);
    await page.locator("#login-password").fill("correct-password");
    await page.locator(".stone-login-form button[type=submit]").click();

    await expect.poll(() => passwordGrantCalled).toBe(true);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("link", { name: "我的昭梧", exact: true }).first()).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem("zhaowu.supabase.session.v1"));
    expect(stored).toContain(TEST_SESSION.access_token);

    await page.goto("/account", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByText("會員流程測試報告", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "登入", exact: true })).toHaveCount(0);
    await expectMobileViewportHealthy(page);
  });

  test("A valid stored session restores Account without sending the member back to login", async ({ page }) => {
    await page.addInitScript((session) => {
      localStorage.setItem("zhaowu.supabase.session.v1", JSON.stringify(session));
    }, TEST_SESSION);
    await mockMemberBackend(page);
    await mockAuthBackend(page);

    await page.goto("/account", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByRole("heading", { name: "我的昭梧", exact: true })).toBeVisible();
    await expect(page.getByText("會員流程測試報告", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "登入", exact: true })).toHaveCount(0);
    await expectMobileViewportHealthy(page);
  });
});
