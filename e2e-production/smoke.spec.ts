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

  test("home renders the birth form with no runtime error and no horizontal overflow", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // In the new design (PR #601), the form is hidden until the user opens it via nav
    const formNavButton = page.getByRole("button", { name: /命書|Destiny|命书/ });
    await formNavButton.click();
    await expect(page.getByRole("heading", { name: /錄入生辰|Enter your birth record|录入生辰/, exact: false })).toBeVisible({ timeout: 20_000 });
    for (const id of ["#birth-year", "#birth-month", "#birth-day", "#birth-hour", "#birth-minute", "#birth-city"]) {
      await expect(page.locator(id)).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    expect(pageErrors).toEqual([]);
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
