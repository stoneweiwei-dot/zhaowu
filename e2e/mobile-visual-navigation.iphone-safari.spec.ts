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
  test("loading animation uses the owner's loaded poster when video is unavailable", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.route("**/intro/*.mp4", (route) => route.abort());
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-intro-fallback]")).toBeVisible();
    const poster = page.locator('[data-intro-fallback] img');
    await expect(poster).toBeVisible();
    await expect(poster).toHaveAttribute('src', '/intro/owner-lotus-bloom-r53.jpg');
    await expect.poll(() => poster.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(page.locator(".zhaowu-lotus-intro__fallback-copy")).toContainText(/昭梧|ZHAOWU/);
    await expect(page.locator('[data-intro-fallback] svg')).toHaveCount(0);
  });

  test("D60 renders and expands using the current precise birth record", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.addInitScript((birth) => {
      localStorage.setItem('zhaowu.birth-record.v1', JSON.stringify(birth));
      // Stub only the external ephemeris boundary, not the application's D60 flow.
      Object.assign(window, { Astronomy: {
        GeoVector: (body: string) => ({ body }),
        Ecliptic: () => ({ elon: 125 }),
        SiderealTime: () => 3,
      } });
    }, BIRTH);
    await page.goto('/indian-astrology');
    const theme = page.getByRole('button', { name: /核心慣性/ });
    await expect(theme).toBeVisible();
    await theme.click();
    await expect(theme).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText(/這裡看你遇到事情時最先啟動/)).toBeVisible();
  });

  test("master number insight is part of the personal numerology reading", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.addInitScript((birth) => {
      localStorage.setItem('zhaowu.birth-record.v1', JSON.stringify({ ...birth, year: 2000, month: 1, day: 8 }));
    }, BIRTH);
    await page.goto('/numerology');
    await expect(page.locator('[data-master-number-insight]')).toContainText('11／2');
    await expect(page.getByRole('heading', { name: '强项', exact: true }).or(page.getByRole('heading', { name: '強項', exact: true }))).toBeVisible();
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /你是少見的/ })).toHaveCount(0);
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
    expect(metrics.height).toBeGreaterThanOrEqual(40);
    expect(metrics.fontSize).toBeGreaterThanOrEqual(11);
    expect(metrics.color).toBe("rgb(32, 61, 52)");
    expect(metrics.backgroundColor).toBe("rgba(62, 103, 86, 0.1)");

    const simplified = page.getByRole("button", { name: "简中", exact: true });
    await simplified.click();
    await expect(simplified).toContainText("簡體");
    await expect(simplified).toHaveAttribute("aria-pressed", "true");
    await expect(simplified).toHaveCSS("color", "rgb(32, 61, 52)");

    const english = page.getByRole("button", { name: "EN", exact: true });
    await english.click();
    await expect(english).toContainText("ENG");
    await expect(english).toHaveAttribute("aria-pressed", "true");
    await expect(english).toHaveCSS("color", "rgb(32, 61, 52)");
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
