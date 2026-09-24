import { expect, test } from "@playwright/test";

const GLOBAL_GATE =
  '[role="status"][aria-label*="昭梧"], [role="status"][aria-label*="Zhaowu"]';

test.describe("iPhone Safari login-only animation", () => {
  test("home never mounts the retired global intro", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("zhaowu.intro.force", "1");
      window.localStorage.removeItem("zhaowu.intro.seen.r148");
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(GLOBAL_GATE)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "錄入生辰", exact: true })).toBeVisible();
    expect(await page.evaluate(() => window.innerWidth)).toBe(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });

  test("login animation plays once per sign-in flow and never follows route navigation", async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.removeItem("zhaowu.login-animation.seen.session.v1");
    });
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.locator(GLOBAL_GATE)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "站主登入", exact: true })).toBeVisible();
    const media = page.locator('[data-login-animation="first-login-visit"]');
    await expect(media).toBeVisible();
    await expect(media).toHaveAttribute("src", /\/intro\/(?:owner-immortal-ascent-r123|[^"']+)\.mp4/);
    await expect(page.locator(".stone-login-sound")).toBeVisible();
    await page.goto("/updates", { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-login-animation="first-login-visit"]')).toHaveCount(0);
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-login-animation="first-login-visit"]')).toHaveCount(0);
    await expect(page.locator('[data-login-stage-static="true"]')).toBeVisible();
    await expect(page.locator(".stone-login-sound")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
});
