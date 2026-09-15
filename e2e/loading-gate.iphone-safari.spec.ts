import { expect, test, type Page } from "@playwright/test";

const GATE =
  '[role="status"][aria-label*="昭梧"], [role="status"][aria-label*="Zhaowu"]';

type GateTrace = {
  mountedAt: number | null;
  removedAt: number | null;
};

async function forceBrokenIntro(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("zhaowu.intro.force", "1");
    window.localStorage.setItem("zhaowu.intro.broken", "1");
  });
}

async function traceGateLifecycle(page: Page) {
  await page.addInitScript((selector) => {
    const trace: GateTrace = { mountedAt: null, removedAt: null };
    Object.defineProperty(window, "__zhaowuGateTrace", {
      value: trace,
      configurable: true,
    });

    const observer = new MutationObserver(() => {
      const gate = document.querySelector(selector);
      if (gate && trace.mountedAt === null) trace.mountedAt = performance.now();
      if (!gate && trace.mountedAt !== null && trace.removedAt === null) {
        trace.removedAt = performance.now();
        observer.disconnect();
      }
    });
    observer.observe(document, { childList: true, subtree: true });
  }, GATE);
}

async function gateDuration(page: Page) {
  return page.evaluate(() => {
    const trace = (window as typeof window & { __zhaowuGateTrace: GateTrace }).__zhaowuGateTrace;
    if (trace.mountedAt === null || trace.removedAt === null) return null;
    return trace.removedAt - trace.mountedAt;
  });
}

const routes = [
  {
    path: "/",
    heading: "客人資料",
    action: "下一步 · 輸入問題",
    actionRole: "button",
  },
  {
    path: "/login",
    heading: "站主登入",
    action: "站主密鑰",
    actionRole: "textbox",
  },
] as const;

test.describe("iPhone Safari startup fallback", () => {
  for (const route of routes) {
    test(`${route.path} stays usable when Supabase readiness hangs if the user skips`, async ({ page }) => {
      await forceBrokenIntro(page);
      await traceGateLifecycle(page);
      await page.route("**/rest/v1/site_settings?**", () => new Promise<void>(() => undefined));

      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      const heading = page.getByRole("heading", { name: route.heading, exact: true });
      const gate = page.locator(GATE);
      const skip = page.locator("[data-intro-skip]");

      await expect(gate).toBeVisible();
      await expect(heading).toBeAttached();
      await expect(skip).toBeVisible();
      const box = await skip.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.x + box!.width).toBeGreaterThan(300);
      expect(box!.y).toBeGreaterThan(700);
      if (await skip.isVisible().catch(() => false)) {
        await skip.click({ force: true, timeout: 2_000 }).catch(() => undefined);
      }
      await expect(gate).toHaveCount(0, { timeout: 4_000 });
      await expect(heading).toBeVisible();
      await expect(page.getByRole(route.actionRole, { name: route.action, exact: true }).first()).toBeVisible();

      const duration = await gateDuration(page);
      expect(duration).not.toBeNull();
      expect(duration!).toBeLessThanOrEqual(8_000);
      expect(await page.evaluate(() => window.innerWidth)).toBe(390);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    });
  }

  test("a failed video keeps Loading visible then fails open without waiting ten seconds", async ({ page }) => {
    await forceBrokenIntro(page);
    await traceGateLifecycle(page);
    await page.route("**/rest/v1/site_settings?**", (route) => route.fulfill({ status: 503, body: "unavailable" }));

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const gate = page.locator(GATE);
    await expect(gate).toBeVisible();
    await expect(gate.locator("video")).toHaveAttribute("src", "/intro/missing-force-fail.mp4");
    await expect(page.locator("[data-intro-skip]")).toBeVisible();
    await expect(gate).toHaveCount(0, { timeout: 5_000 });
    await expect(page.getByRole("heading", { name: "客人資料", exact: true })).toBeVisible();

    const duration = await gateDuration(page);
    expect(duration).not.toBeNull();
    expect(duration!).toBeGreaterThanOrEqual(1_100);
    expect(duration!).toBeLessThanOrEqual(4_000);
  });
});
