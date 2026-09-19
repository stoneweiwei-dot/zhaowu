import { expect, test, type Page } from "@playwright/test";

async function makeAppOfflineSafe(page: Page) {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
}

async function dismissInstallPrompt(page: Page) {
  const dismiss = page.getByRole("button", { name: "稍後再說", exact: true });
  await expect(dismiss).toBeVisible();
  await dismiss.click();
}

async function expectMobileViewportHealthy(page: Page) {
  expect(await page.evaluate(() => window.innerWidth)).toBe(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
}

async function expectNoOverlap(page: Page, upperSelector: string, lowerSelector: string) {
  const overlaps = await page.evaluate(({ upperSelector, lowerSelector }) => {
    const upper = document.querySelector(upperSelector)?.getBoundingClientRect();
    const lower = document.querySelector(lowerSelector)?.getBoundingClientRect();
    if (!upper || !lower) return true;
    return !(upper.right <= lower.left || upper.left >= lower.right || upper.bottom <= lower.top || upper.top >= lower.bottom);
  }, { upperSelector, lowerSelector });
  expect(overlaps).toBe(false);
}

async function fillKnownBirthData(page: Page) {
  await page.locator("#birth-year").fill("1988");
  await page.locator("#birth-month").fill("10");
  await page.locator("#birth-day").fill("4");
  await page.locator("#birth-hour").fill("4");
  await page.locator("#birth-minute").fill("40");
}

test.describe("iPhone Safari core customer flow", () => {
  test("Home exposes device-local birth entry without a public account login", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator("#analysisForm")).toBeVisible();
    await expect(page.getByRole("heading", { name: "客人資料", exact: true })).toBeVisible();
    await expect(page.locator("#analysis-question")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "登入", exact: true })).toHaveCount(0);
    await expect(page.getByText("子時換日", { exact: true })).toHaveCount(0);
    await expect(page.getByText("套用真太陽時校正", { exact: true })).toHaveCount(0);
    await expect(page.locator("[data-specialist-link]")).toHaveCount(0);

    await expect(page.getByRole("dialog", { name: "把昭梧存到手機桌面", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "顯示 iPhone 保存步驟", exact: true })).toBeVisible();
    await page.locator("#analysisForm").scrollIntoViewIfNeeded();
    await expect(page.locator('#analysisForm button[type="submit"]')).toHaveText("保存並排出四柱命盤");
    await expectMobileViewportHealthy(page);
  });

  test("Home language switching keeps birth-first controls usable", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("button", { name: "繁體中文", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { name: "客人資料", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "English", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Your birth details", exact: true })).toBeVisible();
    await expect(page.locator("#analysis-question")).toHaveCount(0);
    await expect(page.locator("#birth-year")).toBeVisible();
    await expect(page.locator("[data-specialist-link]")).toHaveCount(0);
    await page.getByRole("button", { name: "繁體中文", exact: true }).click();
    await expect(page.getByRole("heading", { name: "客人資料", exact: true })).toBeVisible();
    await expectMobileViewportHealthy(page);
  });

  test("Saved guest birth restores the chart immediately and edits replot it", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.addInitScript(() => {
      localStorage.setItem("zhaowu.birth-record.v1", JSON.stringify({
        year: 1988, month: 10, day: 4, hour: 4, minute: 40, timeUnknown: false,
        gender: "male", relation: "unset", ziPolicy: "midnight", useTrueSolar: true,
        city: { name: "Sydney", display: "Sydney", country: "AU", timezone: "Australia/Sydney", latitude: -33.87, longitude: 151.21 },
      }));
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const yearPillar = page.locator('#bazi [data-pillar="year"] strong');
    await expect(page.locator("#bazi [data-bazi-chart]")).toBeVisible();
    await expect(page.locator("#question-stage")).toBeVisible();
    await expect(page.locator("[data-unified-birth-report]")).toBeVisible();
    await expect(page.locator("[data-specialist-link]")).toHaveCount(0);
    const before = await yearPillar.textContent();

    await page.getByRole("button", { name: "修改資料", exact: true }).first().click();
    await page.locator("#birth-year").fill("1989");
    await page.getByRole("button", { name: "保存並排出四柱命盤", exact: true }).click();
    await expect(yearPillar).not.toHaveText(before ?? "");
    await expect(page.locator("#bazi [data-home-bazi-explanation]")).toBeVisible();
    await expectMobileViewportHealthy(page);
  });

  test("Jade Dragon is the single movable floating assistant with embedded music", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const guide = page.locator("[data-dragon-assistant]");
    await expect(guide).toBeVisible();
    await expect(guide).toHaveCSS("position", "fixed");
    await expect(page.locator('[data-mobile-floating-control="music"]')).toHaveCount(0);

    const trigger = page.getByRole("button", { name: "打開青玉小龍助手", exact: true });
    await expect(trigger).toBeVisible();
    const before = await trigger.boundingBox();
    expect(before).not.toBeNull();
    expect(before!.width).toBeLessThanOrEqual(72);
    expect(before!.height).toBeLessThanOrEqual(72);

    await trigger.click();
    const panel = page.getByRole("dialog", { name: "青玉小龍助手", exact: true });
    await expect(panel).toBeVisible();
    await expect(panel).toHaveCSS("position", "absolute");
    await expect(panel.locator("[data-dragon-music-controls]")).toHaveCount(1);
    await expect(panel.getByRole("button", { name: /上一首/ })).toBeVisible();
    await expect(panel.getByRole("button", { name: /下一首/ })).toBeVisible();
    await expect(panel.getByRole("button", { name: "循環播放", exact: true })).toBeVisible();
    await expect(panel.getByRole("button", { name: "隨機播放", exact: true })).toBeVisible();

    await panel.getByRole("button", { name: "關閉助手", exact: true }).click();
    await expectMobileViewportHealthy(page);
  });

  test("Login page remains reachable only for the independent owner key", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "站主登入", exact: true })).toBeVisible();
    await expect(page.getByRole("tab", { name: "註冊", exact: true })).toHaveCount(0);
    await expect(page.getByLabel("站主密鑰", { exact: true })).toBeVisible();
    await expect(page.locator('#login-secret[type="password"]')).toBeVisible();
    await expect(page.getByText(/一般使用者不需要登入/)).toBeVisible();
    await expectMobileViewportHealthy(page);
  });

  test("Analysis form blocks incomplete birth submissions instead of failing silently", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await fillKnownBirthData(page);
    await page.locator("#analysisForm").evaluate((form) => (form as HTMLFormElement).requestSubmit());
    await expect(page.getByText("請從搜尋結果選擇出生城市與國家。", { exact: true })).toBeVisible();
    await expect(page.locator("#analysis-question")).toHaveCount(0);
    await expectMobileViewportHealthy(page);
  });

  test("Birth save reveals the real chart before the question, then the answer leads", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await dismissInstallPrompt(page);
    await fillKnownBirthData(page);

    await page.locator("#birth-city").click();
    const firstCity = page.locator('#birth-city-results [role="option"]').first();
    await expect(firstCity).toBeVisible();
    await firstCity.click();
    await page.getByRole("button", { name: "保存並排出四柱命盤", exact: true }).click();

    await expect(page.locator(".zhaowu-birth-summary")).toBeVisible();
    await expect(page.locator("#bazi [data-bazi-chart]")).toBeVisible();
    await expect(page.locator("#bazi [data-pillar=year]")).toBeVisible();
    await expect(page.locator("#bazi [data-pillar=month]")).toBeVisible();
    await expect(page.locator("#bazi [data-pillar=day]")).toBeVisible();
    await expect(page.locator("#bazi [data-pillar=time]")).toBeVisible();
    await expect(page.locator("#bazi [data-home-bazi-explanation]")).toContainText("日主");
    await expect(page.locator("#bazi [data-home-bazi-explanation]")).toContainText("月令");
    await expect(page.locator("#bazi [data-home-bazi-explanation]")).toContainText("旺衰底盤");
    await expect(page.locator("#bazi [data-home-bazi-explanation]")).toContainText("格局方向");
    await expect(page.locator("[data-unified-birth-report]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "你的完整綜合報告", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "你真正想問的是什麼？", exact: true })).toBeVisible();
    const sectionOrder = await page.evaluate(() => ["customer-record", "bazi", "question-stage"].map((id) => document.getElementById(id)?.getBoundingClientRect().top ?? -1));
    expect(sectionOrder[0]).toBeLessThan(sectionOrder[1]);
    expect(sectionOrder[1]).toBeLessThan(sectionOrder[2]);
    const readable = await page.locator("#bazi [data-home-bazi-explanation] dd").first().evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize));
    expect(readable).toBeGreaterThanOrEqual(14);
    await expect(page.locator("#analysis-question")).toBeVisible();
    await page.locator("#analysis-question").fill("這份工作我應該繼續還是離開？");
    await page.getByRole("button", { name: "開始分析這個問題", exact: true }).click();

    await expect(page.locator("#result")).toBeVisible();
    await expect(page.locator("[data-primary-answer]")).toBeVisible();
    await expect(page.locator("[data-next-action]")).toBeVisible();
    await expect(page.locator("[data-technical-evidence]")).not.toHaveAttribute("open", "");
    await expect(page.locator('[data-owner-login-entry="true"]')).toBeVisible();
    await expect(page.locator(".zhaowu-header-login")).toHaveCount(0);
    await expectMobileViewportHealthy(page);
  });
});
