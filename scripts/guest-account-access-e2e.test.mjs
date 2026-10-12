import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ownerDataHandler from "../api/owner-data.js";
import ownerSessionHandler from "../api/owner-session.js";

function createMockResponse() {
  const headers = {};
  let statusCode = 200;
  let jsonBody = null;

  return {
    status(code) {
      statusCode = code;
      return this;
    },
    setHeader(key, value) {
      headers[key] = value;
      return this;
    },
    json(body) {
      jsonBody = body;
      return { status: statusCode, headers, body: jsonBody };
    },
    get result() {
      return { status: statusCode, headers, body: jsonBody };
    },
  };
}

test("API: GET /api/owner-session reports unauthenticated for guests", async () => {
  const req = {
    method: "GET",
    headers: {
      host: "stone-zhaowu-official.vercel.app",
    },
  };
  const res = createMockResponse();
  await ownerSessionHandler(req, res);

  assert.equal(res.result.status, 200);
  assert.equal(res.result.body.authenticated, false);
});

test("API: POST /api/owner-session rejects unauthenticated requests with 401 or 403", async () => {
  // Cross-origin attempt
  const crossReq = {
    method: "POST",
    headers: {
      origin: "https://malicious-site.example.com",
      host: "stone-zhaowu-official.vercel.app",
    },
    body: { action: "social.status" },
  };
  const crossRes = createMockResponse();
  await ownerSessionHandler(crossReq, crossRes);
  assert.equal(crossRes.result.status, 403);
  assert.equal(crossRes.result.body.error, "ORIGIN_REJECTED");

  // Same-origin attempt without owner session cookie
  const guestReq = {
    method: "POST",
    headers: {
      origin: "https://stone-zhaowu-official.vercel.app",
      host: "stone-zhaowu-official.vercel.app",
      "sec-fetch-site": "same-origin",
      cookie: "some_guest_id=12345",
    },
    body: { action: "social.status" },
  };
  const guestRes = createMockResponse();
  await ownerSessionHandler(guestReq, guestRes);
  assert.equal(guestRes.result.status, 401);
  assert.equal(guestRes.result.body.ok, false);
  assert.equal(guestRes.result.body.error, "OWNER_REQUIRED");
});

test("API: POST /api/owner-data strictly protects all management actions from unauthenticated callers", async () => {
  const criticalActions = [
    { action: "report.list", payload: { limit: 50, offset: 0 } },
    { action: "report.get", payload: { id: "customer-secret-report" } },
    { action: "report.delete", payload: { id: "customer-secret-report" } },
    { action: "gallery.list", payload: {} },
    { action: "gallery.delete", payload: { id: "asset-1" } },
    { action: "background.list", payload: {} },
    { action: "background.delete", payload: { id: "bg-1" } },
    { action: "background.setWallpaper", payload: { id: "bg-1" } },
  ];

  for (const { action, payload } of criticalActions) {
    // 1. Cross-origin attack must receive 403
    const crossReq = {
      method: "POST",
      headers: {
        origin: "https://attacker.org",
        host: "stone-zhaowu-official.vercel.app",
      },
      body: { action, ...payload },
    };
    const crossRes = createMockResponse();
    await ownerDataHandler(crossReq, crossRes);
    assert.equal(crossRes.result.status, 403, `action ${action} must reject cross-origin`);
    assert.equal(crossRes.result.body.error, "ORIGIN_REJECTED");

    // 2. Same-origin guest without owner secret must receive 401 OWNER_REQUIRED
    const guestReq = {
      method: "POST",
      headers: {
        origin: "https://stone-zhaowu-official.vercel.app",
        host: "stone-zhaowu-official.vercel.app",
        "sec-fetch-site": "same-origin",
        cookie: "guest_session=random_user_token",
      },
      body: { action, ...payload },
    };
    const guestRes = createMockResponse();
    await ownerDataHandler(guestReq, guestRes);
    assert.equal(guestRes.result.status, 401, `action ${action} must require owner secret`);
    assert.equal(guestRes.result.body.ok, false);
    assert.equal(guestRes.result.body.error, "OWNER_REQUIRED");
    // Ensure no report data leaked
    assert.equal(guestRes.result.body.items, undefined);
    assert.equal(guestRes.result.body.item, undefined);
  }
});

test("Direct URL /account: Unauthenticated visitor view is isolated and renders no admin data or operations", async () => {
  const accountRoute = await readFile(new URL("../src/routes/account.tsx", import.meta.url), "utf8");

  // 1. Check strict authentication branch in AccountPage:
  // When !user, return guest view with memberTitle and login link only.
  const guestCheckRegex = /if\s*\(!user\)\s*\{\s*return\s*\(\s*<main className="mx-auto max-w-xl">[\s\S]*?<\/main>\s*\);\s*\}/;
  assert.match(accountRoute, guestCheckRegex, "Must have early return for !user");

  // 2. Ensure guest return never references owner console data-attributes
  const guestMatch = accountRoute.match(guestCheckRegex)?.[0] ?? "";
  assert.doesNotMatch(guestMatch, /data-owner-console/);
  assert.doesNotMatch(guestMatch, /data-owner-independent-console/);
  assert.doesNotMatch(guestMatch, /OwnerGalleryManager/);
  assert.doesNotMatch(guestMatch, /OwnerLoginVisualsManager/);
  assert.doesNotMatch(guestMatch, /SocialPublisherPage/);
  assert.doesNotMatch(guestMatch, /OwnerThemeSkinsManager/);
  assert.doesNotMatch(guestMatch, /data-owner-bulk-toolbar/);
  assert.doesNotMatch(guestMatch, /listOwnerReportPage/);

  // 3. Ensure listOwnerReportPage is strictly gated behind user.isOwner
  assert.match(accountRoute, /const page = user\.isOwner \? await listOwnerReportPage\(\) : null/);
  assert.match(accountRoute, /if \(nextOffset === null \|\| moreBusy \|\| !user\?\.isOwner\) return/);

  // 4. Ensure bulk delete is strictly gated behind user.isOwner
  assert.match(accountRoute, /if \(!session \|\| !user\?\.isOwner/);
});

test("Client-side bridge: unauthenticated sessions never issue ownerData calls", async () => {
  const bridge = await readFile(new URL("../src/lib/bridge/supabase-rest.ts", import.meta.url), "utf8");
  const client = await readFile(new URL("../src/lib/owner-data-client.ts", import.meta.url), "utf8");

  // Ensure isOwnerCookieSession strictly verifies access token
  assert.match(client, /export function isOwnerCookieAccessToken\(token\?: string \| null\) \{\s*return token === OWNER_COOKIE_ACCESS_TOKEN;\s*\}/);
  assert.match(client, /export function isOwnerCookieSession\(session\?:/);

  // Ensure normal customer listReportRecords falls back to base without calling ownerData
  assert.match(bridge, /if \(!isOwnerCookieSession\(session\)\) return base\.listReportRecords\(session, isOwner\);/);
  assert.match(bridge, /if \(!isOwnerCookieSession\(session\)\) return base\.getReportRecord\(session, id\);/);
  assert.match(bridge, /if \(!isOwnerCookieSession\(session\)\) return base\.deleteReportRecord\(session, id\);/);
});

test("Real Browser: unauthenticated guest accessing /account directly receives no admin UI and management API blocks read/mutation", async (t) => {
  const chromiumPath = process.env.CHROMIUM_PATH || "/bin/chromium";
  let chromium;
  try {
    const pw = await import("@playwright/test");
    chromium = pw.chromium;
  } catch {
    t.skip("Playwright not available in this runtime");
    return;
  }

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      executablePath: chromiumPath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  } catch (err) {
    t.skip(`Chromium launch skipped: ${err.message}`);
    return;
  }

  try {
    const page = await browser.newPage();
    const networkRequests = [];
    page.on("request", (req) => {
      networkRequests.push({ url: req.url(), method: req.method() });
    });

    const targetUrl = process.env.TARGET_URL || "https://stone-zhaowu-official.vercel.app/account";
    await page.goto(targetUrl, { waitUntil: "networkidle" });

    // 1. Verify owner console DOM markers are absent
    const ownerConsoleCount = await page.locator("[data-owner-console=\"true\"]").count();
    const ownerTabsCount = await page.locator("nav[role=\"tablist\"]").count();
    const bulkToolbarCount = await page.locator("[data-owner-bulk-toolbar]").count();
    const allReportsTextCount = await page.getByText("所有人報告", { exact: true }).count();

    assert.equal(ownerConsoleCount, 0, "No owner console DOM element should exist for guest");
    assert.equal(ownerTabsCount, 0, "No owner tablist should exist for guest");
    assert.equal(bulkToolbarCount, 0, "No owner bulk toolbar should exist for guest");
    assert.equal(allReportsTextCount, 0, "No '所有人報告' text should appear for guest");

    // 2. Verify network calls during load
    const ownerDataCalls = networkRequests.filter((r) => r.url.includes("/api/owner-data"));
    assert.equal(ownerDataCalls.length, 0, "Zero /api/owner-data calls during guest /account load");

    // 3. Browser-context API calls: unauthenticated fetch cannot read or mutate
    const evalResult = await page.evaluate(async () => {
      const sessionRes = await fetch("/api/owner-session");
      const session = await sessionRes.json().catch(() => ({}));

      const listRes = await fetch("/api/owner-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "report.list", limit: 20 }),
      });
      const list = await listRes.json().catch(() => ({}));

      const deleteRes = await fetch("/api/owner-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "report.delete", id: "unauthorized-probe-id" }),
      });
      const del = await deleteRes.json().catch(() => ({}));

      return {
        sessionStatus: sessionRes.status,
        authenticated: session.authenticated,
        listStatus: listRes.status,
        listError: list.error,
        listItems: list.items,
        deleteStatus: deleteRes.status,
        deleteError: del.error,
      };
    });

    assert.equal(evalResult.sessionStatus, 200);
    assert.equal(evalResult.authenticated, false);
    assert.equal(evalResult.listStatus, 401);
    assert.equal(evalResult.listError, "OWNER_REQUIRED");
    assert.equal(evalResult.listItems, undefined);
    assert.equal(evalResult.deleteStatus, 401);
    assert.equal(evalResult.deleteError, "OWNER_REQUIRED");
  } finally {
    await browser.close();
  }
});
