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
