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
