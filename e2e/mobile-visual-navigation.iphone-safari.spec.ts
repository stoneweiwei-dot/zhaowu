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
  test("loading animation uses the r148 poster when video is unavailable", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.addInitScript(() => {
      window.localStorage.setItem("zhaowu.intro.force", "1");
    });
    await page.route("**/intro/*.mp4", (route) => route.abort());
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-intro-fallback]")).toBeVisible();
    const poster = page.locator('[data-intro-fallback] img');
    await expect(poster).toBeVisible();
    await expect(poster).toHaveAttribute('src', '/intro/zhaowu-opening-r148.jpg');
    await expect.poll(() => poster.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(page.locator(".zhaowu-lotus-intro__fallback-copy")).toContainText(/昭梧|ZHAOWU/);
    await expect(page.locator('[data-intro-fallback] svg')).toHaveCount(0);
    await expect(page.locator("[data-intro-skip]")).toHaveCount(0);
  });

  test("D60 withholds interpretation until the recorded minute is confirmed", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.route("**/api/owner-session", (route) => route.fulfill({
      status: 200, contentType: "application/json", body: JSON.stringify({ authenticated: true }),
    }));
    await page.addInitScript((birth) => {
      localStorage.setItem('zhaowu.birth-record.v1', JSON.stringify(birth));
      Object.assign(window, { Astronomy: {
        GeoVector: (body: string) => ({ body }),
        Ecliptic: () => ({ elon: 125 }),
        SiderealTime: () => 3,
      } });
    }, BIRTH);
    await page.goto('/indian-astrology');
    await expect(page.locator('[data-d60-minute-gate]')).toBeVisible();
    await expect(page.locator('[data-d60-confirmed-record]')).toContainText('1988-10-04 · 04:40');
    await expect(page.locator('[data-d60-confirmed-record]')).toContainText('Sanming');
    await expect(page.getByRole('button', { name: /核心慣性/ })).toHaveCount(0);
    await page.getByRole('button', { name: /我確認這是可核對到分鐘的出生時間/ }).click();
    const theme = page.getByRole('button', { name: /核心慣性/ });
    const withheld = page.locator('[data-d60-withheld]');
    await expect(theme.or(withheld)).toBeVisible({ timeout: 15_000 });
    if (await theme.count()) {
      await theme.click();
      await expect(theme).toHaveAttribute('aria-expanded', 'true');
      await expect(page.getByText(/這裡看你遇到事情時最先啟動/)).toBeVisible();
    } else {
      await expect(withheld).toContainText(/不作判定/);
    }
  });

  test("master number insight is part of the personal numerology reading", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.route("**/api/owner-session", (route) => route.fulfill({
      status: 200, contentType: "application/json", body: JSON.stringify({ authenticated: true }),
    }));
    await page.addInitScript((birth) => {
      localStorage.setItem('zhaowu.birth-record.v1', JSON.stringify({ ...birth, year: 2000, month: 1, day: 8 }));
    }, BIRTH);
    await page.goto('/numerology');
    await expect(page.getByText(/11.*基礎數.*2|11.*基础数.*2/).first()).toBeVisible();
    await expect(page.getByText(/不是較高等級|不是较高等级/).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: '五项天赋', exact: true }).or(page.getByRole('heading', { name: '五項天賦', exact: true }))).toBeVisible();
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /你是少見的/ })).toHaveCount(0);
  });

  test("language controls are readable and expose the current active state", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const traditional = page.getByRole("button", { name: "繁體中文", exact: true });
    await expect(traditional).toHaveText("繁體");
    await expect(traditional).toHaveAttribute("aria-pressed", "true");
    const metrics = await traditional.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        height: element.getBoundingClientRect().height,
        fontSize: parseFloat(style.fontSize),
        color: style.color,
        backgroundColor: style.backgroundColor,
      };
    });
    expect(metrics.height).toBeGreaterThanOrEqual(44);
    expect(metrics.fontSize).toBeGreaterThanOrEqual(13);
    expect(metrics.color).toBe("rgb(255, 250, 240)");
    expect(metrics.backgroundColor).toBe("rgb(31, 78, 58)");

    await expect(page.getByRole("button", { name: "简体中文", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "日本語", exact: true })).toHaveCount(0);

    const english = page.getByRole("button", { name: "English", exact: true });
    await english.click();
    await expect(english).toHaveText("English");
    await expect(english).toHaveAttribute("aria-pressed", "true");
    await expect(english).toHaveCSS("color", "rgb(255, 250, 240)");
    await expect(english).toHaveCSS("background-color", "rgb(31, 78, 58)");

    await expect(page.getByRole("button", { name: "한국어", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "हिन्दी", exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });

  test("latest update is a dedicated readable page in both public languages", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const latest = page.getByRole("link", { name: /最新更新/ });
    await expect(latest).toBeVisible();
    expect((await latest.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    await latest.click();
    await expect(page).toHaveURL(/\/updates$/);
    await expect(page.locator("[data-updates-page]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "最新版本更新內容" })).toBeVisible();
    await expect(page.locator("[data-updates-page]")).not.toContainText(/[a-f0-9]{40}/i);

    await page.getByRole("button", { name: "English", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Latest release" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });

  test("homepage hides every specialist portal and delivers one integrated report", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.addInitScript((birth) => {
      window.localStorage.setItem("zhaowu.birth-record.v1", JSON.stringify(birth));
    }, BIRTH);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await dismissInstallPromptIfVisible(page);
    await expect(page.locator("[data-specialist-link]")).toHaveCount(0);
    await expect(page.locator("[data-unified-birth-report]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "你的昭梧命書", exact: true })).toBeVisible();
    await expect(page.locator("[data-unified-birth-report]")).not.toContainText(/紫微斗數|西洋星座|印度古法占星|七政四餘|前世今生|生命靈數/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
});
