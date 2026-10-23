import { expect, test } from "@playwright/test";

const EXPECT_SHA = (process.env.EXPECT_SHA || "").trim();

// When a real Safari assertion fails, record only public, guest-visible page
// landmarks. No credentials, cookies, local storage, response bodies or secrets.
test.afterEach(async ({ page }, info) => {
  if (info.status === info.expectedStatus) return;
  try {
    const publicState = await page.evaluate(() => ({
      pathname: location.pathname,
      title: document.title,
      language: document.documentElement.lang,
      bodyExcerpt: (document.body?.innerText ?? "").slice(0, 420),
      pageReady: document.readyState,
      mainCount: document.querySelectorAll("main").length,
      formCount: document.querySelectorAll("#birth-form").length,
      loginCount: document.querySelectorAll("[data-owner-only-login]").length,
      guideCount: document.querySelectorAll("[data-home-tree]").length,
      discoverCount: document.querySelectorAll("[data-zhaowu-discover-link]").length,
    }));
    console.log("PRODUCTION_SAFARI_FAILURE_LANDMARKS", JSON.stringify(publicState));
  } catch (error) {
    console.log("PRODUCTION_SAFARI_DIAGNOSTIC_UNAVAILABLE", String(error));
  }
});

test.describe("production smoke (iPhone Safari)", () => {
  test("production serves the exact commit that was just pushed", async ({ request }) => {
    const res = await request.get("/release.json", { headers: { "cache-control": "no-cache" } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.release).toBe("string");
    if (EXPECT_SHA) expect(body.release).toBe(EXPECT_SHA);
  });

  test("home keeps four working entry points and opens the birth form", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // The public home was redesigned as a four-step Song editorial guide. The former
    // flush-hero and top-level birth-heading selectors are no longer the contract.
    const guide = page.locator("[data-home-tree]");
    await expect(guide).toBeVisible({ timeout: 20_000 });
    for (const entrance of ["form", "today", "quiz", "notes"]) {
      await expect(guide.locator('[data-home-card="' + entrance + '"]')).toHaveCount(1);
    }
    await expect(page.getByRole("radio", { name: "English", exact: true })).toBeVisible();
    await expect(page.getByRole("radio", { name: "繁體中文", exact: true })).toBeVisible();
    await expect(page.getByRole("radio", { name: "简体中文", exact: true })).toBeVisible();

    await guide.locator('[data-home-card="form"] .ph-tree-primary').click();
    await expect(page.locator("#birth-form")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("#zhaowu-customer-title")).toBeVisible({ timeout: 20_000 });
    for (const id of ["#birth-year", "#birth-month", "#birth-day", "#birth-hour", "#birth-minute", "#birth-city"]) {
      await expect(page.locator(id)).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
    expect(pageErrors).toEqual([]);
  });

  test("daily colours keep all five choices inside the phone viewport without a swipe rail", async ({ page }) => {
    await page.goto("/daily-colors", { waitUntil: "domcontentloaded" });
    const choices = page.locator("#five-element-wardrobe [data-daily-colors-choices]");
    await expect(choices).toBeVisible({ timeout: 20_000 });
    await expect(choices.locator("button")).toHaveCount(5);

    const layout = await choices.evaluate((node) => {
      const list = node.getBoundingClientRect();
      const children = Array.from(node.querySelectorAll("button")).map((button) => button.getBoundingClientRect());
      return {
        overflow: node.scrollWidth - node.clientWidth,
        inside: children.every((rect) => rect.left >= list.left - 1 && rect.right <= list.right + 1),
      };
    });
    expect(layout.overflow).toBeLessThanOrEqual(1);
    expect(layout.inside).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });

  test("animated login keeps real sign-in controls and reaches the separate /about page", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#login-title")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("#owner-account")).toBeVisible();
    await expect(page.locator("#login-secret")).toBeVisible();
    await expect(page.locator("[data-login-film-stage]")).toBeVisible();
    await expect(page.locator("video[data-login-film-video]")).toHaveAttribute("src", /\/login-films\/.*\.mp4/);
    await expect(page.locator("[data-login-film-controls]")).toBeVisible();
    const next = page.getByRole("button", { name: /下一段動畫|下一段动画|Next animation/ });
    await next.click();
    await expect(page.locator("[data-login-film-stage]")).toHaveAttribute("data-current-film", "dragon-portrait");

    await page.locator("[data-zhaowu-discover-link] a").click();
    await expect(page).toHaveURL(/\/about\/?$/);
    await expect(page.locator("[data-zhaowu-features-page]")).toBeVisible();
    expect(await page.locator("[data-feature-number]").count()).toBeGreaterThanOrEqual(7);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
    expect(pageErrors).toEqual([]);
  });

  test("all four login film assets are delivered by the canonical host", async ({ request }) => {
    for (const name of ["flute-dragon", "dragon-portrait", "lotus-sunlight", "imperial-cat"]) {
      for (const ext of ["mp4", "jpg"]) {
        const url = "/login-films/" + name + "." + ext;
        const response = await request.get(url, { headers: { Range: "bytes=0-2047" } });
        expect([200, 206], url + " status").toContain(response.status());
        expect(response.headers()["content-type"], url + " content type").toMatch(ext === "mp4" ? /video\/mp4/ : /image\/jpeg/);
      }
    }
  });

  test("built JS and CSS assets referenced by index.html are served", async ({ request }) => {
    const html = await (await request.get("/")).text();
    const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g)].map((match) => match[1]);
    expect(assets.length).toBeGreaterThan(1);
    for (const asset of assets) {
      const res = await request.get(asset);
      expect(res.status(), asset).toBe(200);
    }
  });

  test("music library API answers with a track list", async ({ request }) => {
    const res = await request.get("/api/owner-music");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.tracks)).toBe(true);
  });
});

test.describe("guest account isolation and API defense (iPhone Safari)", () => {
  test("direct URL /account as unauthenticated guest renders no owner console, tabs, or customer data", async ({ page }) => {
    const networkRequests: { url: string; method: string }[] = [];
    page.on("request", (req) => {
      networkRequests.push({ url: req.url(), method: req.method() });
    });

    await page.goto("/account", { waitUntil: "domcontentloaded" });

    // 1. Verify owner console DOM markers are strictly absent
    await expect(page.locator("[data-owner-console=\"true\"]")).toHaveCount(0);
    await expect(page.locator("[data-owner-independent-console]")).toHaveCount(0);
    await expect(page.locator("nav[role=\"tablist\"]")).toHaveCount(0);
    await expect(page.locator("[data-owner-bulk-toolbar]")).toHaveCount(0);
    await expect(page.locator("[data-owner-selectable-file]")).toHaveCount(0);

    // 2. Verify no admin titles or customer report tables are visible
    await expect(page.getByText("昭梧後台", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Zhaowu console", { exact: true })).toHaveCount(0);
    await expect(page.getByText("客戶已上傳報告", { exact: true })).toHaveCount(0);
    await expect(page.getByText("所有人報告", { exact: true })).toHaveCount(0);
    await expect(page.getByText("所有人报告", { exact: true })).toHaveCount(0);
    await expect(page.getByText("All reports", { exact: true })).toHaveCount(0);

    // 3. Verify no /api/owner-data requests were dispatched during page load
    // Public site-skin GET is required for all guests to see the shared visual theme.
    // Block privileged owner mutations and private data reads instead.
    const privilegedCalls = networkRequests.filter((r) => {
      const url = new URL(r.url);
      return url.pathname === "/api/owner-data" &&
        !(r.method === "GET" && url.searchParams.get("view") === "site-skin");
    });
    expect(privilegedCalls).toHaveLength(0);
  });

  test("browser fetch cannot read management data or trigger mutations without authentication", async ({ page }) => {
    await page.goto("/account", { waitUntil: "domcontentloaded" });

    // APIRequestContext shares this browser's guest cookies, but avoids WebKit's
    // page.evaluate fetch race while the unauthenticated /account view hydrates.
    // All requests remain anonymous; denied mutations cannot change any data.
    const sessionRes = await page.request.get("/api/owner-session");
    const sessionBody = await sessionRes.json().catch(() => ({}));
    const probe = async (body: Record<string, unknown>) => {
      const response = await page.request.post("/api/owner-data", { data: body, headers: { Origin: new URL(page.url()).origin } });
      return { status: response.status(), body: await response.json().catch(() => ({})) };
    };
    const results = {
      session: { status: sessionRes.status(), body: sessionBody },
      list: await probe({ action: "report.list", limit: 20 }),
      get: await probe({ action: "report.get", id: "probe-secret-id" }),
      delete: await probe({ action: "report.delete", id: "probe-secret-id" }),
      gallery: await probe({ action: "gallery.delete", id: "asset-1" }),
      wallpaper: await probe({ action: "background.setWallpaper", id: "bg-1" }),
    };

    // Session remains guest
    expect(results.session.status).toBe(200);
    expect(results.session.body.authenticated).toBe(false);

    // Read actions rejected with 401 OWNER_REQUIRED and no data leak
    expect(results.list.status).toBe(401);
    expect(results.list.body.error).toBe("OWNER_REQUIRED");
    expect(results.list.body.items).toBeUndefined();

    expect(results.get.status).toBe(401);
    expect(results.get.body.error).toBe("OWNER_REQUIRED");
    expect(results.get.body.item).toBeUndefined();

    // Mutation actions rejected with 401 OWNER_REQUIRED and no changes triggered
    expect(results.delete.status).toBe(401);
    expect(results.delete.body.error).toBe("OWNER_REQUIRED");

    expect(results.gallery.status).toBe(401);
    expect(results.gallery.body.error).toBe("OWNER_REQUIRED");

    expect(results.wallpaper.status).toBe(401);
    expect(results.wallpaper.body.error).toBe("OWNER_REQUIRED");
  });
});
