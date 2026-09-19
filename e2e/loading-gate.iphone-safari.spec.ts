import { expect, test, type Page } from "@playwright/test";

const GATE =
  '[role="status"][aria-label*="昭梧"], [role="status"][aria-label*="Zhaowu"]';

type GateTrace = {
  mountedAt: number | null;
  removedAt: number | null;
};

async function forceIntro(page: Page, broken = false) {
  await page.addInitScript(({ broken }) => {
    window.localStorage.setItem("zhaowu.intro.force", "1");
    if (broken) window.localStorage.setItem("zhaowu.intro.broken", "1");
    else window.localStorage.removeItem("zhaowu.intro.broken");
  }, { broken });
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
    heading: "錄入生辰",
    action: "保存並生成昭梧命書",
    actionRole: "button",
  },
  {
    path: "/login",
    heading: "站主登入",
    action: "站主密碼",
    actionRole: "textbox",
  },
] as const;

test.describe("iPhone Safari five-second opening", () => {
  test("plays the r148 opening for at least five seconds and exposes no skip control", async ({ page }) => {
    await forceIntro(page);
    await traceGateLifecycle(page);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const gate = page.locator(GATE);
    await expect(gate).toBeVisible();
    await expect(gate).toHaveAttribute("data-intro-motion", "zhaowu-opening-r148");
    await expect(gate.locator("video")).toHaveAttribute("src", "/intro/zhaowu-opening-r148.mp4");
    await expect(page.locator("[data-intro-skip]")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "錄入生辰", exact: true })).toBeAttached();

    await expect(gate).toHaveCount(0, { timeout: 8_500 });
    await expect(page.getByRole("heading", { name: "錄入生辰", exact: true })).toBeVisible();

    const duration = await gateDuration(page);
    expect(duration).not.toBeNull();
    expect(duration!).toBeGreaterThanOrEqual(5_000);
    expect(duration!).toBeLessThanOrEqual(8_500);
    expect(await page.evaluate(() => window.innerWidth)).toBe(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });

  for (const route of routes) {
    test(`${route.path} keeps the full five-second poster fallback when video/bootstrap fail`, async ({ page }) => {
      await forceIntro(page, true);
      await traceGateLifecycle(page);
      await page.route("**/rest/v1/site_settings?**", () => new Promise<void>(() => undefined));

      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      const heading = page.getByRole("heading", { name: route.heading, exact: true });
      const gate = page.locator(GATE);

      await expect(gate).toBeVisible();
      await expect(heading).toBeAttached();
      await expect(gate.locator("video")).toHaveAttribute("src", "/intro/missing-force-fail.mp4");
      await expect(page.locator("[data-intro-skip]")).toHaveCount(0);

      await expect(gate).toHaveCount(0, { timeout: 8_500 });
      await expect(heading).toBeVisible();
      await expect(page.getByRole(route.actionRole, { name: route.action, exact: true }).first()).toBeVisible();

      const duration = await gateDuration(page);
      expect(duration).not.toBeNull();
      expect(duration!).toBeGreaterThanOrEqual(5_000);
      expect(duration!).toBeLessThanOrEqual(8_500);
      expect(await page.evaluate(() => window.innerWidth)).toBe(390);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    });
  }
});
