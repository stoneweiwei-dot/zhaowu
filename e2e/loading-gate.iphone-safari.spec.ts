import { expect, test, type Page } from "@playwright/test";

// A shell self-repair reload can legitimately interrupt a navigation; retry once on that
// specific error so the test asserts the login-animation contract, not reload timing.
async function gotoSettled(page: Page, url: string) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
  } catch (error) {
    if (!/interrupted by another navigation/i.test(String(error))) throw error;
    await page.waitForLoadState("load");
    await page.goto(url, { waitUntil: "domcontentloaded" });
  }
}

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

  test("login animation plays once per local day, can be skipped, and never follows route navigation", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.locator(GLOBAL_GATE)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "站主登入", exact: true })).toBeVisible();
    const media = page.locator('[data-login-animation="first-login-visit"]');
    await expect(media).toBeVisible();
    await expect(media).toHaveAttribute("src", /\/intro\/(?:owner-immortal-ascent-r123|[^"']+)\.mp4/);
    await expect(page.locator(".stone-login-sound")).toBeVisible();
    await expect(page.locator('[data-login-animation-skip="true"]')).toBeVisible();
    await page.locator('[data-login-animation-skip="true"]').click();
    await expect(page.locator('[data-login-stage-static="true"]')).toBeVisible();
    await page.goto("/updates", { waitUntil: "domcontentloaded" });
    // main.tsx may self-heal the shell (controllerchange reload / release-param replace)
    // right after domcontentloaded; let /updates fully settle before navigating again.
    await expect(page.locator("[data-updates-page]")).toBeVisible();
    await page.waitForLoadState("load");
    await expect(page.locator('[data-login-animation="first-login-visit"]')).toHaveCount(0);
    await gotoSettled(page, "/login");
    await expect(page.locator('[data-login-animation="first-login-visit"]')).toHaveCount(0);
    await expect(page.locator('[data-login-stage-static="true"]')).toBeVisible();
    await expect(page.locator(".stone-login-sound")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
});
