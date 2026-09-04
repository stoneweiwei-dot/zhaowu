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

type WriteCall = { method: string; id: string | null; status: string | null };
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "access-control-allow-headers": "authorization, apikey, content-type, prefer, x-client-info",
  "access-control-expose-headers": "content-range",
};

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({ status, contentType: "application/json", headers: CORS, body: JSON.stringify(body) });
}
async function noContent(route: Route) { await route.fulfill({ status: 204, headers: CORS, body: "" }); }
async function installSession(page: Page) {
  await page.addInitScript((session) => localStorage.setItem("zhaowu.supabase.session.v1", JSON.stringify(session)), SESSION);
}
function parsePayload(rawText: string | null) {
  if (!rawText) return null;
  try {
    const raw = JSON.parse(rawText) as Record<string, unknown> | Array<Record<string, unknown>> | null;
    return Array.isArray(raw) ? (raw[0] ?? null) : raw;
  } catch { return null; }
}
async function mockAuthenticatedCloud(page: Page, writes: WriteCall[]) {
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
      const method = request.method();
      if (method === "GET") return json(route, []);
      const payload = parsePayload(request.postData());
      const queryId = url.searchParams.get("id")?.replace(/^eq\./, "") ?? null;
      const bodyId = typeof payload?.id === "string" ? payload.id : null;
      const id = bodyId ?? queryId;
      const status = typeof payload?.status === "string" ? payload.status : null;
      writes.push({ method, id, status });
      return json(route, [{ id: id ?? "generated-report", ...(payload ?? {}), created_at: "2026-08-26T00:00:00.000Z", updated_at: "2026-08-26T00:00:00.000Z" }]);
    }
    return json(route, []);
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
  const dismiss = page.getByRole("button", { name: "稍後再說", exact: true });
  await expect(dismiss).toBeVisible();
  await dismiss.click();
}
async function mobileHealthy(page: Page) {
  expect(await page.evaluate(() => window.innerWidth)).toBe(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
}

test("Signed-in member can persist the full report on one durable record", async ({ page }) => {
  const writes: WriteCall[] = [];
  await installSession(page);
  await mockAuthenticatedCloud(page, writes);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await dismissInstallPrompt(page);
  await expect(page.getByRole("link", { name: "我的昭梧", exact: true }).first()).toBeVisible();
  await fillKnownBirthData(page);
  await page.getByRole("button", { name: "交卷，看答案", exact: true }).click();
  await expect(page.locator("#result")).toBeVisible();

  const saveButton = page.getByRole("button", { name: "更新已保存報告", exact: true });
  await expect(saveButton).toBeVisible();
  await page.getByRole("button", { name: "查看完整報告", exact: true }).click();
  await expect(page.getByRole("heading", { name: "你的完整分析", exact: true })).toBeVisible();

  // report_ready is a best-effort background sync. The explicit Save action is
  // the durable customer boundary and must PATCH this same record to full_ready.
  await expect(saveButton).toBeEnabled();
  await saveButton.click();
  await expect.poll(
    () => writes.some((call) => call.method === "PATCH" && call.status === "full_ready"),
    { timeout: 10_000 },
  ).toBe(true);

  const fullReady = writes.find((call) => call.method === "PATCH" && call.status === "full_ready");
  expect(fullReady?.id).toBeTruthy();
  const persistedIds = new Set(writes.filter((call) => ["POST", "PATCH"].includes(call.method) && call.id).map((call) => call.id));
  expect(persistedIds.size).toBe(1);
  await expect(saveButton).toBeEnabled();
  await expect(page.getByText(/保存失敗|雲端同步暫時失敗/)).toHaveCount(0);
  await mobileHealthy(page);
});

test("Full report stays available when Supabase persistence fails", async ({ page }) => {
  await installSession(page);
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
    if (url.pathname.endsWith("/report_requests")) return json(route, { message: "temporary persistence outage" }, 503);
    return json(route, []);
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await dismissInstallPrompt(page);
  await expect(page.getByRole("link", { name: "我的昭梧", exact: true }).first()).toBeVisible();
  await fillKnownBirthData(page);
  await page.getByRole("button", { name: "交卷，看答案", exact: true }).click();
  await expect(page.locator("#result")).toBeVisible();
  await page.getByRole("button", { name: "查看完整報告", exact: true }).click();
  await expect(page.getByRole("heading", { name: "你的完整分析", exact: true })).toBeVisible();
  await expect(page.getByText("完整報告已整理完成，但雲端同步暫時失敗；畫面內容不受影響。", { exact: true })).toBeVisible();
  await mobileHealthy(page);
});