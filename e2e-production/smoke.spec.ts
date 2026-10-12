import { expect, test } from "@playwright/test";

const EXPECT_SHA = (process.env.EXPECT_SHA || "").trim();

test.describe("production smoke (iPhone Safari)", () => {
  test("production serves the exact commit that was just pushed", async ({ request }) => {
    const res = await request.get("/release.json", { headers: { "cache-control": "no-cache" } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.release).toBe("string");
    if (EXPECT_SHA) expect(body.release).toBe(EXPECT_SHA);
  });

  test("home keeps compact utility chrome, a flush hero, and an accessible birth form", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "一份生辰，讀成一本昭梧命書", exact: true })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("link", { name: /最新更新/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "English", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "繁體中文", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "简体中文", exact: true })).toBeVisible();
    await expect(page.locator(".zhaowu-site-header .zhaowu-header-owner-login")).toHaveCount(0);

    const heroGap = await page.evaluate(() => {
      const header = document.querySelector(".zhaowu-site-header");
      const hero = document.querySelector(".zw-hero-gallery");
      if (!(header instanceof HTMLElement) || !(hero instanceof HTMLElement)) return 999;
      return hero.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
    });
    expect(Math.abs(heroGap)).toBeLessThanOrEqual(2);

    await page.getByRole("button", { name: "命書", exact: true }).click();
    await expect(page.getByRole("heading", { name: "錄入生辰", exact: true })).toBeVisible({ timeout: 20_000 });
    for (const id of ["#birth-year", "#birth-month", "#birth-day", "#birth-hour", "#birth-minute", "#birth-city"]) {
      await expect(page.locator(id)).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
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

  test("login page renders", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "站主登入", exact: true })).toBeVisible({ timeout: 20_000 });
    expect(pageErrors).toEqual([]);
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
    const ownerDataCalls = networkRequests.filter((r) => r.url.includes("/api/owner-data"));
    expect(ownerDataCalls).toHaveLength(0);
  });

  test("browser fetch cannot read management data or trigger mutations without authentication", async ({ page }) => {
    await page.goto("/account", { waitUntil: "domcontentloaded" });

    const results = await page.evaluate(async () => {
      // 1. Check session probe
      const sessionRes = await fetch("/api/owner-session");
      const sessionBody = await sessionRes.json().catch(() => ({}));

      // 2. Attempt unauthorized report listing (read)
      const listRes = await fetch("/api/owner-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "report.list", limit: 20 }),
      });
      const listBody = await listRes.json().catch(() => ({}));

      // 3. Attempt unauthorized single report fetch (read)
      const getRes = await fetch("/api/owner-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "report.get", id: "probe-secret-id" }),
      });
      const getBody = await getRes.json().catch(() => ({}));

      // 4. Attempt unauthorized report deletion (mutation)
      const deleteRes = await fetch("/api/owner-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "report.delete", id: "probe-secret-id" }),
      });
      const deleteBody = await deleteRes.json().catch(() => ({}));

      // 5. Attempt unauthorized gallery deletion (mutation)
      const galleryRes = await fetch("/api/owner-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "gallery.delete", id: "asset-1" }),
      });
      const galleryBody = await galleryRes.json().catch(() => ({}));

      // 6. Attempt unauthorized wallpaper update (mutation)
      const wallpaperRes = await fetch("/api/owner-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "background.setWallpaper", id: "bg-1" }),
      });
      const wallpaperBody = await wallpaperRes.json().catch(() => ({}));

      return {
        session: { status: sessionRes.status, body: sessionBody },
        list: { status: listRes.status, body: listBody },
        get: { status: getRes.status, body: getBody },
        delete: { status: deleteRes.status, body: deleteBody },
        gallery: { status: galleryRes.status, body: galleryBody },
        wallpaper: { status: wallpaperRes.status, body: wallpaperBody },
      };
    });

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
