import { expect, test } from "@playwright/test";

test.use({
  launchOptions: {
    executablePath: process.env.CHROMIUM_PATH || "/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

test.describe("Guest account isolation and API defense (Real Browser)", () => {
  test("direct URL /account as unauthenticated guest renders no owner console, tabs, or customer data", async ({ page }) => {
    const networkRequests: { url: string; method: string }[] = [];
    page.on("request", (req) => {
      networkRequests.push({ url: req.url(), method: req.method() });
    });

    await page.goto("/account", { waitUntil: "networkidle" });

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
