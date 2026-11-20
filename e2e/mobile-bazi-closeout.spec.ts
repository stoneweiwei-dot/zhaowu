import { expect, test, type Page } from "@playwright/test";

async function isolate(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem("zhaowu.display-language", "zh-Hant");
    localStorage.setItem("zhaowu.intro.seen.public.v1", "1");
  });
  await page.route("**/api/owner-session", route => route.fulfill({ json: { authenticated: false } }));
  await page.route("**/rest/v1/**", route => route.fulfill({ status: 503, body: "offline-test" }));
  await page.route(/ipwho\.is|open-meteo\.com|nominatim|geocoding/, route => route.abort());
}

async function openBirthForm(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "命書", exact: true }).click();
  for (const [field, value] of Object.entries({ year: "1995", month: "6", day: "15" })) {
    await page.locator(`#birth-${field}`).fill(value);
  }
  await page.locator("#time-unknown").check();
  await page.locator("#birth-gender").selectOption("unspecified");
}

test("390px birth city blur confirms the first result and keeps the book funnel visible", async ({ page }) => {
  await isolate(page);
  await openBirthForm(page);
  await page.locator("#birth-city").fill("台北");
  await expect(page.locator("#birth-city-results [role=option]").first()).toBeVisible();
  await page.locator("#birth-year").click();
  await expect(page.locator("[data-city-confirmed]")).toContainText("臺北");

  await page.getByRole("button", { name: "生成我的命書", exact: true }).click();
  await expect(page.locator("#bazi")).toBeVisible();
  await expect(page.getByRole("alert", { name: /請從搜尋結果/ })).toHaveCount(0);

  const art = await page.locator(".zhaowu-bazi-plain__art").boundingBox();
  const secondPlainLine = await page.locator(".zhaowu-bazi-plain li").nth(1).boundingBox();
  const chartFold = await page.locator("[data-fold=chart]").boundingBox();
  const unlock = await page.locator("[data-bazi-reading-locked]").boundingBox();
  const next = await page.locator(".zw-flow-next").boundingBox();
  expect(art?.height).toBeLessThanOrEqual(33);
  expect(secondPlainLine!.y + secondPlainLine!.height).toBeLessThan(844);
  expect(chartFold!.y).toBeLessThan(844);
  expect(unlock!.y).toBeLessThan(844);
  expect(next!.y).toBeGreaterThan(unlock!.y + unlock!.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("missing birthplace fails open with an explicit standard-time warning", async ({ page }) => {
  await isolate(page);
  await openBirthForm(page);
  await page.getByRole("button", { name: "生成我的命書", exact: true }).click();
  await expect(page.locator("#bazi [data-location-fallback]").first()).toContainText("未校正真太陽時");
  await expect(page.locator("#bazi")).toBeVisible();
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
  await page.getByRole("button", { name: "生成我的命書", exact: true }).click();

  await expect(page.locator("[data-fold=terms]")).toBeVisible();
  await page.locator(".zhaowu-bazi-full-details > summary").click();
  const report = page.locator("[data-unified-birth-report]");
  await expect(report).toBeVisible();
  await report.getByRole("button", { name: "漫畫命書", exact: true }).click();
  await expect(report.locator('[data-report-mode="comic-lite"]')).toBeVisible();
  await expect(report.locator("[data-comic-scene]")).toHaveCount(6);
  await expect(report.locator("[data-comic-scene] img").first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
