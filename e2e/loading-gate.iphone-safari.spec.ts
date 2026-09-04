import { expect, test, type Page } from "@playwright/test";

const GATE =
  '[role="status"][aria-label*="昭梧"], [role="status"][aria-label*="Zhaowu"]';

type GateTrace = {
  mountedAt: number | null;
  removedAt: number | null;
};

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
    heading: "四柱八字",
    action: "交卷，看答案",
    actionRole: "button",
  },
  {
    path: "/login",
    heading: "登入昭梧",
    action: "Email",
    actionRole: "textbox",
  },
  { path: "/account", heading: "我的昭梧", action: "登入", actionRole: "link" },
] as const;

test.describe("iPhone Safari startup fallback", () => {
  for (const route of routes) {
    test(`${route.path} stays usable when Supabase readiness hangs`, async ({ page }) => {
      await traceGateLifecycle(page);
      await page.route("**/rest/v1/site_settings?**", () => new Promise<void>(() => undefined));

      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      const heading = page.getByRole("heading", { name: route.heading, exact: true });
      const gate = page.locator(GATE);

      await expect(gate).toBeVisible();
      await expect(heading).toBeAttached();
      await expect(gate).toHaveCount(0, { timeout: 4_300 });
      await expect(heading).toBeVisible();
      await expect(page.getByRole(route.actionRole, { name: route.action, exact: true }).first()).toBeVisible();

      const duration = await gateDuration(page);
      expect(duration).not.toBeNull();
      expect(duration!).toBeLessThanOrEqual(4_000);
      expect(await page.evaluate(() => window.innerWidth)).toBe(390);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    });
  }

  test("a failed readiness response keeps Loading visible before failing open", async ({ page }) => {
    await traceGateLifecycle(page);
    await page.route("**/rest/v1/site_settings?**", (route) => route.fulfill({ status: 503, body: "unavailable" }));

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const gate = page.locator(GATE);
    await expect(gate).toBeVisible();
    await expect(gate.locator("video")).toHaveAttribute("src", "/intro/twin-lotus-restored-r26.mp4");
    await page.waitForTimeout(900);
    await expect(gate).toBeVisible();
    await expect(gate).toHaveCount(0, { timeout: 3_400 });
    await expect(page.getByRole("heading", { name: "四柱八字", exact: true })).toBeVisible();

    const duration = await gateDuration(page);
    expect(duration).not.toBeNull();
    expect(duration!).toBeGreaterThanOrEqual(1_100);
    expect(duration!).toBeLessThanOrEqual(4_000);
  });
});
