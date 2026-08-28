import { expect, test, type Page, type Route } from "@playwright/test";

const TEST_USER = {
  id: "user-e2e-save",
  email: "save-e2e@zhaowu.test",
  user_metadata: { name: "保存流程測試會員" },
};

const TEST_SESSION = {
  access_token: "e2e-save-access-token",
  refresh_token: "e2e-save-refresh-token",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: "bearer",
  user: TEST_USER,
};

const TEST_PROFILE = {
  id: TEST_USER.id,
  email: TEST_USER.email,
  display_name: "保存流程測試會員",
  is_owner: false,
  owner_archive_id: null,
  birth_data: null,
};

type WriteCall = {
  method: string;
  id: string | null;
  status: string | null;
};

async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

async function fillKnownBirthData(page: Page) {
  await page.locator("#analysis-question").fill("我現在最應該先處理什麼？");
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
  const dismiss = page.getByRole("button", { name: "已加入，不再提示", exact: true });
  await expect(dismiss).toBeVisible();
  await dismiss.click();
}

async function expectMobileViewportHealthy(page: Page) {
  expect(await page.evaluate(() => window.innerWidth)).toBe(390);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
}

test("Signed-in member can generate and persist one full report record", async ({ page }) => {
  const writes: WriteCall[] = [];

  await page.addInitScript((session) => {
    localStorage.setItem("zhaowu.supabase.session.v1", JSON.stringify(session));
  }, TEST_SESSION);

  await page.route("**/rest/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname.endsWith("/profiles")) {
      return fulfillJson(route, [TEST_PROFILE]);
    }

    if (url.pathname.endsWith("/site_settings")) {
      return fulfillJson(route, [{ key: "migration_state", value: { ready: true } }]);
    }

    if (url.pathname.endsWith("/report_requests")) {
      const method = request.method();
      if (method === "GET") return fulfillJson(route, []);

      const rawPayload = request.postDataJSON() as Record<string, unknown> | Array<Record<string, unknown>> | null;
      const payload = Array.isArray(rawPayload) ? (rawPayload[0] ?? null) : rawPayload;
      const queryId = url.searchParams.get("id")?.replace(/^eq\./, "") ?? null;
      const bodyId = typeof payload?.id === "string" ? payload.id : null;
      const id = bodyId ?? queryId;
      const status = typeof payload?.status === "string" ? payload.status : null;
      writes.push({ method, id, status });

      return fulfillJson(route, [{
        id: id ?? "e2e-generated-report",
        ...(payload ?? {}),
        created_at: "2026-08-26T00:00:00.000Z",
        updated_at: "2026-08-26T00:00:00.000Z",
      }]);
    }

    return fulfillJson(route, []);
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await dismissInstallPrompt(page);
  await fillKnownBirthData(page);
  await page.getByRole("button", { name: "開始分析", exact: true }).click();

  const result = page.locator("#result");
  await expect(result).toBeVisible();
  await expect(page.getByRole("button", { name: "更新已保存報告", exact: true })).toBeVisible();
  await expect.poll(() => writes.some((call) => call.method === "POST" && call.status === "engine_ready")).toBe(true);

  const engineReady = writes.find((call) => call.method === "POST" && call.status === "engine_ready");
  expect(engineReady?.id).toBeTruthy();

  await page.getByRole("button", { name: "查看完整報告", exact: true }).click();
  await expect(page.getByRole("heading", { name: "你的完整分析", exact: true })).toBeVisible();
  await expect.poll(() => writes.some((call) => call.method === "PATCH" && call.status === "report_ready")).toBe(true);

  const reportReady = writes.find((call) => call.method === "PATCH" && call.status === "report_ready");
  expect(reportReady?.id).toBe(engineReady?.id);

  await page.getByRole("button", { name: "更新已保存報告", exact: true }).click();
  await expect(page.getByText("完整報告已保存到同一筆記錄。", { exact: true })).toBeVisible();
  await expect.poll(() => writes.some((call) => call.method === "PATCH" && call.status === "full_ready")).toBe(true);

  const fullReady = writes.find((call) => call.method === "PATCH" && call.status === "full_ready");
  expect(fullReady?.id).toBe(engineReady?.id);
  await expectMobileViewportHealthy(page);
});

test("Full report stays available when Supabase persistence fails", async ({ page }) => {
  await page.addInitScript((session) => {
    localStorage.setItem("zhaowu.supabase.session.v1", JSON.stringify(session));
  }, TEST_SESSION);

  await page.route("**/rest/v1/**", async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname.endsWith("/profiles")) {
      return fulfillJson(route, [TEST_PROFILE]);
    }

    if (url.pathname.endsWith("/site_settings")) {
      return fulfillJson(route, [{ key: "migration_state", value: { ready: true } }]);
    }

    if (url.pathname.endsWith("/report_requests")) {
      return fulfillJson(route, { message: "temporary persistence outage" }, 503);
    }

    return fulfillJson(route, []);
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await dismissInstallPrompt(page);
  await fillKnownBirthData(page);
  await page.getByRole("button", { name: "開始分析", exact: true }).click();

  await expect(page.locator("#result")).toBeVisible();
  await expect(page.getByRole("heading", { name: "我現在最應該先處理什麼？", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "查看完整報告", exact: true }).click();

  await expect(page.getByRole("heading", { name: "你的完整分析", exact: true })).toBeVisible();
  await expect(page.getByText("完整報告已整理完成，但雲端同步暫時失敗；畫面內容不受影響。", { exact: true })).toBeVisible();
  await expectMobileViewportHealthy(page);
});
