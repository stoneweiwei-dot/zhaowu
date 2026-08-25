import { expect, test, type Page } from "@playwright/test";

async function makeAppOfflineSafe(page: Page) {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
}

async function expectMobileViewportHealthy(page: Page) {
  expect(await page.evaluate(() => window.innerWidth)).toBe(390);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
}

async function fillKnownBirthData(page: Page) {
  await page.locator("#analysis-question").fill("我現在最應該先處理什麼？");
  await page.locator("#birth-year").fill("1988");
  await page.locator("#birth-month").fill("10");
  await page.locator("#birth-day").fill("4");
  await page.locator("#birth-hour").fill("4");
  await page.locator("#birth-minute").fill("40");
}

test.describe("iPhone Safari core customer flow", () => {
  test("Home exposes the analysis entry and survives backend degradation", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "昭梧", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "開始我的分析", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "先回答你真正想問的事", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "登入", exact: true }).first()).toBeVisible();

    await page.getByRole("link", { name: "開始我的分析", exact: true }).click();
    await expect(page.locator("#analysisForm")).toBeInViewport();
    await expectMobileViewportHealthy(page);
  });

  test("Home language switching keeps the main controls usable", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: "简中", exact: true }).click();
    await expect(page.getByRole("link", { name: "开始我的分析", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "先回答你真正想问的事", exact: true })).toBeVisible();

    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.locator("#analysisForm")).toBeVisible();
    await expect(page.locator("#analysis-question")).toBeVisible();
    await expect(page.locator("#birth-year")).toBeVisible();
    await expect(page.locator("#birth-month")).toBeVisible();
    await expect(page.locator("#birth-day")).toBeVisible();

    await page.getByRole("button", { name: "繁中", exact: true }).click();
    await expect(page.getByRole("link", { name: "開始我的分析", exact: true })).toBeVisible();
    await expectMobileViewportHealthy(page);
  });

  test("Login page remains reachable and exposes email credentials", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "登入昭梧", exact: true })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Email", exact: true })).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expectMobileViewportHealthy(page);
  });

  test("Signed-out Account degrades to a clear login path", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/account", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "我的昭梧", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "登入", exact: true }).first()).toBeVisible();
    await expectMobileViewportHealthy(page);
  });

  test("Analysis form blocks incomplete submissions instead of failing silently", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await fillKnownBirthData(page);

    await page.locator("#analysisForm form").evaluate((form) =>
      (form as HTMLFormElement).requestSubmit(),
    );

    await expect(page.getByText("請從搜尋結果選擇出生城市與國家。", { exact: true })).toBeVisible();
    await expect(page.locator("#analysisForm")).toBeVisible();
    await expectMobileViewportHealthy(page);
  });

  test("Free analysis completes end-to-end without cloud availability", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await fillKnownBirthData(page);

    await page.locator("#birth-city").click();
    const firstCity = page.getByRole("option").first();
    await expect(firstCity).toBeVisible();
    await firstCity.click();

    await page.getByRole("button", { name: "開始分析", exact: true }).click();

    const result = page.locator("#result");
    await expect(result).toBeVisible();
    await expect(page.getByRole("heading", { name: "我現在最應該先處理什麼？", exact: true })).toBeVisible();
    await expect(result.locator("article").first()).not.toBeEmpty();
    await expect(page.getByRole("button", { name: "查看完整報告", exact: true })).toBeVisible();
    await expectMobileViewportHealthy(page);
  });
});
