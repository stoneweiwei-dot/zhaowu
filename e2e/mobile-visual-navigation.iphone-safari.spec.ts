import { expect, test, type Page } from "@playwright/test";

const BIRTH = {
  year: 1988,
  month: 10,
  day: 4,
  hour: 4,
  minute: 40,
  timeUnknown: false,
  gender: "male",
  relation: "unset",
  city: {
    name: "Sanming",
    country: "China",
    display: "Sanming, China",
    timezone: "Asia/Shanghai",
    latitude: 26.2639,
    longitude: 117.6389,
  },
  liveCity: null,
  ziPolicy: "midnight",
  useTrueSolar: true,
};

async function makeAppOfflineSafe(page: Page) {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
}

async function dismissInstallPromptIfVisible(page: Page) {
  const button = page.getByRole("button", { name: "稍後再說", exact: true });
  if (await button.isVisible().catch(() => false)) await button.click();
}

test.describe("iPhone Safari visual and report navigation contract", () => {
  test("loading animation always has a visible animated fallback", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-intro-fallback]")).toBeVisible();
    await expect(page.locator(".zhaowu-lotus-intro__fallback-art")).toBeVisible();
    await expect(page.locator(".zhaowu-lotus-intro__fallback-copy")).toContainText(/昭梧|ZHAOWU/);
    const motion = await page.locator(".zhaowu-lotus-intro__flower").evaluate((element) => {
      const style = getComputedStyle(element);
      return { name: style.animationName, duration: style.animationDuration, iterations: style.animationIterationCount };
    });
    expect(motion.name).toContain("zw-intro-bloom");
    expect(motion.duration).not.toBe("0s");
    expect(motion.iterations).not.toBe("infinite");
  });

  test("language controls are readable and the selected option keeps dark text", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const traditional = page.getByRole("button", { name: "繁中", exact: true });
    await expect(traditional).toContainText("繁體");
    const metrics = await traditional.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        height: element.getBoundingClientRect().height,
        fontSize: parseFloat(style.fontSize),
        color: style.color,
        backgroundColor: style.backgroundColor,
      };
    });
    expect(metrics.height).toBeGreaterThanOrEqual(48);
    expect(metrics.fontSize).toBeGreaterThanOrEqual(16);
    expect(metrics.color).toBe("rgb(33, 31, 26)");
    expect(metrics.backgroundColor).toBe("rgb(234, 220, 194)");

    const simplified = page.getByRole("button", { name: "简中", exact: true });
    await simplified.click();
    await expect(simplified).toContainText("簡體");
    await expect(simplified).toHaveAttribute("aria-pressed", "true");
    await expect(simplified).toHaveCSS("color", "rgb(33, 31, 26)");

    const english = page.getByRole("button", { name: "EN", exact: true });
    await english.click();
    await expect(english).toContainText("ENG");
    await expect(english).toHaveAttribute("aria-pressed", "true");
    await expect(english).toHaveCSS("color", "rgb(33, 31, 26)");
  });

  test("every analysis portal is a real navigation target and opens its corresponding page", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.addInitScript((birth) => {
      window.localStorage.setItem("zhaowu.birth-record.v1", JSON.stringify(birth));
    }, BIRTH);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await dismissInstallPromptIfVisible(page);
    await expect(page.locator('[data-specialist-link="bazi"]')).toHaveAttribute("href", /#analysisForm|#result/);
    await expect(page.locator('[data-specialist-link="past"]')).toHaveAttribute("href", "/yizhangjing");

    const specialistRoutes = [
      ["ziwei", "/ziwei", "紫微斗數"],
      ["western", "/astrology", "西洋星座"],
      ["indian", "/indian-astrology", "印度古法占星"],
      ["qizheng", "/qizheng", "七政四餘"],
    ] as const;

    for (const [id, path, title] of specialistRoutes) {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      const portal = page.locator(`[data-specialist-link="${id}"]`);
      await expect(portal).toHaveJSProperty("tagName", "A");
      expect(await portal.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe("auto");
      await portal.scrollIntoViewIfNeeded();
      await portal.click();
      await expect(page).toHaveURL(new RegExp(`${path.replace("/", "\\/")}$`));
      await expect(page.locator("h1#specialist-title")).toHaveText(title);
      await expect(page.locator(".zhaowu-specialist-sections article").first()).toBeVisible();
    }

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.locator('[data-specialist-link="past"]').scrollIntoViewIfNeeded();
    await page.locator('[data-specialist-link="past"]').click();
    await expect(page).toHaveURL(/\/yizhangjing$/);
    await expect(page.getByRole("heading", { name: /前世今生/ }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "生成我的報告", exact: true })).toBeVisible();
  });
});
