import { expect, test, type Page } from "@playwright/test";

async function isolate(page: Page, language = "zh-Hant") {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(locale => {
    localStorage.setItem("zhaowu.display-language", locale);
    localStorage.setItem("zhaowu.intro.seen.public.v1", "1");
  }, language);
  await page.route("**/api/owner-session", route => route.fulfill({ json: { authenticated: false } }));
  await page.route("**/rest/v1/**", route => route.fulfill({ status: 503, body: "offline-test" }));
  await page.route(/ipwho\.is|open-meteo\.com|nominatim|geocoding/, route => route.abort());
}

async function openBirthForm(page: Page) {
  await page.goto("/#birth-form", { waitUntil: "domcontentloaded" });
  for (const [field, value] of Object.entries({ year: "1995", month: "6", day: "15" })) {
    await page.locator(`#birth-${field}`).fill(value);
  }
  await page.locator("#time-unknown").check();
  await page.locator("#birth-gender").selectOption("unspecified");
}

test("390px guest chart shows four columns, both free items and the existing unlock", async ({ page }) => {
  await isolate(page);
  await openBirthForm(page);
  await page.locator("#birth-city").fill("台北");
  await expect(page.locator("#birth-city-results [role=option]").first()).toBeVisible();
  await page.locator("#birth-city-results [role=option]").first().click();
  await expect(page.locator("[data-city-confirmed]")).toContainText("臺北");

  await page.getByRole("button", { name: "生成我的命書", exact: true }).click();
  await expect(page.locator("#bazi")).toBeVisible();
  await expect(page.getByRole("alert", { name: /請從搜尋結果/ })).toHaveCount(0);

  await test.info().attach("390px generated chart", { body: await page.locator('[data-result-section="01"]').screenshot(), contentType: "image/png" });
  const board = page.locator('[data-result-section="01"] [data-bazi-chart]');
  await expect(board.locator("[data-pillar]")).toHaveCount(4);
  const columns = await board.locator("[data-pillar]").evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().top));
  expect(new Set(columns).size).toBe(1);
  await expect(board.locator('[data-pillar="time"] [data-element]')).toHaveCount(0);
  await expect(page.locator("#bazi [data-plain-item]")).toHaveCount(2);
  await expect(page.locator("#bazi [data-unified-birth-report]")).toHaveCount(0);
  await expect(page.locator("#bazi [data-bazi-reading-locked]")).toBeVisible();
  await expect(page.locator("#bazi [data-free-atlas-symbol] summary img").first()).toBeVisible();
  await page.locator('[data-result-section="06"] a[href="#bazi-reading"]').click();
  await expect(page.locator("[data-bazi-reading-locked]")).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("a restored standard-time record labels the location fallback", async ({ page }) => {
  await isolate(page);
  await page.addInitScript(() => localStorage.setItem("zhaowu.birth-record.v1", JSON.stringify({
    year: 1995, month: 6, day: 15, hour: 12, minute: 0, timeUnknown: true, gender: "unspecified", relation: "unset",
    city: { name: "未提供出生地", display: "地點未確認", country: "", latitude: 39.9042, longitude: 120, timezone: "Asia/Shanghai", standardTimeFallback: true },
  })));
  await page.route("**/atlas/**", route => route.abort());
  await page.goto("/#birth-form");
  const card = page.locator("[data-free-atlas-symbol]").first();
  await card.locator("summary").scrollIntoViewIfNeeded();
  await expect(card.locator(".is-fallback")).toHaveCount(1);
  await card.locator("summary").click();
  await expect(card.locator(".zw-free-atlas__words p").first()).toBeVisible();
  await expect(page.locator('[data-result-section="01"] [data-location-fallback]')).toContainText("未校正真太陽時");
});

test("public navigation uses local reports while account remains owner-only", async ({ page }) => {
  await isolate(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: "登入", exact: true })).toHaveCount(0);
  await expect(page.locator('.ph-bottom-nav a[href="/history"]')).toContainText("我的");
  await expect(page.getByText(/無需註冊，報告會加密保存在這台裝置的瀏覽器/)).toHaveCount(1);

  await page.goto("/account", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "站主登入", exact: true })).toBeVisible();
});

test("the paid Destiny Book still exposes the six-frame comic report on mobile", async ({ page }) => {
  await isolate(page);
  await page.addInitScript(() => {
    localStorage.setItem("zhaowu.report-access-sessions.v1", JSON.stringify(["cs_test_mobilecomic123456789"]));
  });
  await page.route("**/functions/v1/stripe-checkout?**", route => route.fulfill({
    json: { ok: true, paid: true, pending: false, product: "system", system: "bazi" },
  }));
  await openBirthForm(page);
  await page.locator("#birth-city").click();
  await page.locator('#birth-city-results [role="option"]').first().click();
  await page.getByRole("button", { name: "生成我的命書", exact: true }).click();

  await expect(page.locator('[data-result-section="03"] [data-plain-item="inner"]')).toBeVisible();
  await expect(page.locator('[data-report-mode="formal"]')).toBeVisible();
  const report = page.locator("[data-unified-birth-report]");
  await expect(report).toBeVisible();
  await report.getByRole("button", { name: "漫畫命書", exact: true }).click();
  await expect(report.locator('[data-report-mode="comic-lite"]')).toBeVisible();
  await expect(report.locator("[data-comic-scene]")).toHaveCount(6);
  await expect(report.locator("[data-comic-scene] img").first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

for (const [locale, heading, generate] of [
  ["zh-Hans", "我的八字命盘", "生成我的命书"],
  ["en", "My BaZi chart", "Generate my Destiny Book"],
]) {
  test("mobile chart and free readings in " + locale, async ({ page }) => {
    await isolate(page, locale);
    await openBirthForm(page);
    await page.locator("#birth-city").click();
    await page.locator("#birth-city-results [role=option]").first().click();
    await page.getByRole("button", { name: generate, exact: true }).click();
    await expect(page.locator("#bazi-title-01")).toContainText(heading);
    await expect(page.locator("#bazi [data-plain-item]")).toHaveCount(2);
    await expect(page.locator("#bazi [data-unified-birth-report]")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}
