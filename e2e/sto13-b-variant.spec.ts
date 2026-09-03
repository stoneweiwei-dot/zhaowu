import { expect, test, type Page, type Route } from "@playwright/test";

const OWNER = { id: "owner-test", email: "owner@example.test", user_metadata: { name: "STO-13 Owner" } };
const SESSION = {
  access_token: "test",
  refresh_token: "test",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: "bearer",
  user: OWNER,
};
const PROFILE = {
  id: OWNER.id,
  email: OWNER.email,
  display_name: "STO-13 Owner",
  is_owner: true,
  owner_archive_id: null,
  birth_data: null,
};

function asset(index: number) {
  const day = String(28 - (index % 20)).padStart(2, "0");
  return {
    id: `background-${index}`,
    source: "upload",
    name: `background-${index}.webp`,
    storage_path: `2026-08-${day}/background-${index}.webp`,
    content_type: "image/webp",
    enabled: true,
    days_of_week: [],
    start_date: null,
    end_date: null,
    theme: "daily-rotation",
    created_at: `2026-08-${day}T00:00:00.000Z`,
    updated_at: `2026-08-${day}T00:00:00.000Z`,
  };
}

const REAL_REPORT = {
  id: "report-real",
  public_code: "REAL-STO13",
  user_id: "customer-real",
  user_email: "real-customer@example.test",
  alias: "正式客戶報告",
  record_kind: "analysis",
  status: "full_ready",
  access_mode: "member",
  payment_tier: "full",
  payment_status: "paid",
  context: { question: "正式客戶問題" },
  engine_snapshot: null,
  mother_draft: null,
  paid_report: null,
  visual_profile: null,
  image_path: null,
  image_error: null,
  created_at: "2026-08-31T12:00:00.000Z",
  updated_at: "2026-08-31T12:00:00.000Z",
};
const QA_REPORT = {
  ...REAL_REPORT,
  id: "report-qa",
  public_code: "QA-STO13",
  user_email: "qa-only@example.test",
  alias: "QA 隔離報告",
  record_kind: "qa",
  access_mode: "test",
  context: { question: "不得出現在正式清單", qa: true },
};

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "access-control-allow-headers": "authorization, apikey, content-type, prefer, x-client-info",
  "access-control-expose-headers": "content-range",
};

async function json(route: Route, body: unknown, headers: Record<string, string> = {}, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    headers: { ...CORS, ...headers },
    body: status === 204 ? "" : JSON.stringify(body),
  });
}

async function mockOwnerBackend(page: Page) {
  const backgroundPages: Array<{ limit: string | null; offset: string | null }> = [];
  const reportQueries: string[] = [];
  let storedImagesRequested = 0;
  let uploadCount = 0;

  await page.addInitScript((session) => localStorage.setItem("zhaowu.supabase.session.v1", JSON.stringify(session)), SESSION);

  await page.route("**/storage/v1/object/**", async (route) => {
    const method = route.request().method();
    if (method === "OPTIONS") return json(route, {}, {}, 204);
    if (method === "POST") {
      uploadCount += 1;
      return json(route, { Key: `sto13-upload-${uploadCount}.png` });
    }
    if (method === "GET") {
      storedImagesRequested += 1;
      return route.fulfill({
        status: 200,
        contentType: "image/svg+xml",
        headers: CORS,
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="#c9b693"/></svg>',
      });
    }
    return json(route, {});
  });

  await page.route("**/rest/v1/**", async (route) => {
    const request = route.request();
    if (request.method() === "OPTIONS") return json(route, {}, {}, 204);
    const url = new URL(request.url());

    if (url.pathname.endsWith("/profiles")) return json(route, [PROFILE]);
    if (url.pathname.endsWith("/site_settings")) return json(route, [{ key: "migration_state", value: { ready: true } }]);
    if (url.pathname.endsWith("/release_history")) return json(route, []);

    if (url.pathname.endsWith("/background_assets")) {
      if (request.method() === "POST") {
        const body = request.postDataJSON() as { name: string; storage_path: string };
        return json(route, [{ ...asset(100 + uploadCount), name: body.name, storage_path: body.storage_path }]);
      }
      if (request.method() !== "GET") return json(route, []);
      if (url.searchParams.get("enabled") === "eq.true") return json(route, [asset(0), asset(1), asset(2)]);

      const limit = url.searchParams.get("limit");
      const offset = url.searchParams.get("offset");
      backgroundPages.push({ limit, offset });
      const start = Number(offset ?? 0);
      const size = Number(limit ?? 12);
      return json(route, Array.from({ length: Math.min(size, 25 - start) }, (_, i) => asset(start + i)), {
        "content-range": `${start}-${Math.min(24, start + size - 1)}/25`,
      });
    }

    if (url.pathname.endsWith("/report_requests")) {
      reportQueries.push(url.search);
      if (url.searchParams.has("id")) return json(route, [REAL_REPORT]);
      return json(route, [REAL_REPORT, QA_REPORT]);
    }

    return json(route, []);
  });

  return { backgroundPages, reportQueries, getStoredImagesRequested: () => storedImagesRequested, getUploadCount: () => uploadCount };
}

function visibleHeading(page: Page, text: string) {
  return page.locator("h2:visible").filter({ hasText: text }).first();
}

function visibleLanguageButton(page: Page, text: string) {
  return page.locator("button:visible").filter({ hasText: text }).first();
}

test.describe("STO-13 approved B variant", () => {
  test("keeps owner and customer surfaces simple, lazy and QA-isolated", async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const failedRequests: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${request.url()}`));

    const backend = await mockOwnerBackend(page);
    await page.goto("/account", { waitUntil: "networkidle" });

    const backgroundHeading = visibleHeading(page, "首頁背景管理");
    await expect(backgroundHeading).toBeVisible();
    const backgroundSection = backgroundHeading.locator("xpath=ancestor::section[1]");
    await expect(backgroundSection.locator("[data-background-card]")).toHaveCount(1);
    expect(backend.backgroundPages[0]).toEqual({ limit: "1", offset: "0" });
    expect(backend.getStoredImagesRequested()).toBeLessThanOrEqual(2);

    await backgroundSection.getByRole("button", { name: /查看上傳歷史/ }).click();
    await expect(backgroundSection.locator("[data-background-card]")).toHaveCount(12);
    expect(backend.backgroundPages.some((query) => query.limit === "12" && query.offset === "0")).toBe(true);

    const uploadInput = backgroundSection.locator('input[type="file"][multiple]');
    await uploadInput.setInputFiles([
      { name: "sto13-a.png", mimeType: "image/png", buffer: Buffer.from("a") },
      { name: "sto13-b.png", mimeType: "image/png", buffer: Buffer.from("b") },
      { name: "sto13-c.png", mimeType: "image/png", buffer: Buffer.from("c") },
    ]);
    await expect(backgroundSection.getByRole("progressbar")).toHaveCount(3);
    await expect.poll(() => backend.getUploadCount()).toBe(3);
    for (const progress of await backgroundSection.getByRole("progressbar").all()) await expect(progress).toHaveAttribute("aria-valuenow", "100");

    const accountMain = page.locator("main:visible").last();
    await expect(accountMain.getByText("正式客戶報告", { exact: true })).toBeVisible();
    await expect(accountMain.getByText("QA 隔離報告", { exact: true })).toHaveCount(0);
    expect(backend.reportQueries.some((query) => query.includes("record_kind.not.in.%28test%2Cqa%2Ce2e%29") || query.includes("record_kind.not.in.(test,qa,e2e)"))).toBe(true);

    const primary = accountMain.locator("[data-report-primary-actions]").first();
    await expect(primary.locator(":scope > button")).toHaveCount(2);
    await primary.locator("button").first().click();
    const secondary = accountMain.locator("[data-report-secondary-actions]").first();
    await expect(secondary).toBeVisible();
    await expect(secondary).not.toHaveAttribute("open", /.*/);

    await visibleLanguageButton(page, "简中").click();
    await expect(visibleHeading(page, "首页背景管理")).toBeVisible();
    await visibleLanguageButton(page, "EN").click();
    await expect(visibleHeading(page, "Homepage backgrounds")).toBeVisible();
    await visibleLanguageButton(page, "繁中").click();

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
});