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
  });

  test("language controls are readable and the selected option keeps dark text", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const traditional = page.getByRole("button", { name: "繁中", exact: true });
    await expect(traditional).toContainText("繁體");
    const metrics = await traditional.evaluate((element) => {
      const style = getComputedStyle(element);
      return { height: element.getBoundingClientRect().height, fontSize: parseFloat(style.fontSize), color: style.color };
    });
    expect(metrics.height).toBeGreaterThanOrEqual(44);
    expect(metrics.fontSize).toBeGreaterThanOrEqual(15);
    expect(metrics.color).not.toBe("rgb(255, 255, 255)");

    const simplified = page.getByRole("button", { name: "简中", exact: true });
    await simplified.click();
    await expect(simplified).toContainText("簡體");
    await expect(simplified).toHaveAttribute("aria-pressed", "true");

    const english = page.getByRole("button", { name: "EN", exact: true });
    await english.click();
    await expect(english).toContainText("ENG");
    await expect(english).toHaveAttribute("aria-pressed", "true");
  });

  test("every analysis portal is a real navigation target and opens its report", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.addInitScript((birth) => {
      window.localStorage.setItem("zhaowu.birth-record.v1", JSON.stringify(birth));
    }, BIRTH);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await dismissInstallPromptIfVisible(page);
    await expect(page.locator('[data-specialist-link="bazi"]')).toHaveAttribute("href", /#analysisForm|#result/);

    const routes = [
      ["ziwei", "/ziwei", "紫微斗數"],
      ["western", "/astrology", "西洋星座"],
      ["indian", "/indian-astrology", "印度古法占星"],
      ["qizheng", "/qizheng", "七政四餘"],
      ["past", "/yizhangjing", "前世今生"],
    ] as const;

    for (const [id, path, title] of routes) {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.locator(`[data-specialist-link="${id}"]`).scrollIntoViewIfNeeded();
      await page.locator(`[data-specialist-link="${id}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${path.replace("/", "\\/")}$`));
      await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
      await expect(page.locator(".zhaowu-specialist-sections article").first()).toBeVisible();
    }
  });
});
