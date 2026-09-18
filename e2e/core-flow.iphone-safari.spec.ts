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
    await expect(page.getByRole("link", { name: /前世今生/ })).toBeVisible();

    await expect(page.getByRole("dialog", { name: "把昭梧存到手機桌面", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "顯示 iPhone 保存步驟", exact: true })).toBeVisible();
    await page.locator("#analysisForm").scrollIntoViewIfNeeded();
    await expect(page.locator('#analysisForm button[type="submit"]')).toHaveText("儲存並排出八字");
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
    await expect(page.getByRole("link", { name: /Past & Present/ })).toBeVisible();
    await page.getByRole("button", { name: "繁體中文", exact: true }).click();
    await expect(page.getByRole("heading", { name: "客人資料", exact: true })).toBeVisible();
    await expectMobileViewportHealthy(page);
  });

  test("Jade Dragon stays in flow and never covers the consultation", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const guide = page.locator("[data-site-guide]");
    await expect(guide).toBeVisible();
    await expect(guide).toHaveCSS("position", "relative");
    await expectNoOverlap(page, "[data-site-guide]", "#analysisForm");
    await page.getByRole("button", { name: "打開青玉小龍導覽", exact: true }).click();
    const panel = page.getByRole("dialog", { name: "青玉小龍導覽", exact: true });
    await expect(panel).toBeVisible();
    await expect(panel).toHaveCSS("position", "static");
    await expectNoOverlap(page, ".zhaowu-dragon-guide-panel", "#analysisForm");
    await panel.getByRole("button", { name: "關閉導覽", exact: true }).click();
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

  test("Birth save reveals question, answer leads, and technical evidence stays secondary", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await dismissInstallPrompt(page);
    await fillKnownBirthData(page);

    await page.locator("#birth-city").click();
    const firstCity = page.locator('#birth-city-results [role="option"]').first();
    await expect(firstCity).toBeVisible();
    await firstCity.click();
    await page.getByRole("button", { name: "儲存並排出八字", exact: true }).click();

    await expect(page.locator(".zhaowu-birth-summary")).toBeVisible();
    await expect(page.getByRole("heading", { name: "客人八字命盤", exact: true })).toBeVisible();
    await expect(page.locator("#bazi .zhaowu-bazi-chart")).toBeVisible();
    await expect(page.locator("[data-home-bazi-explanation]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "你真正想問的是什麼？", exact: true })).toBeVisible();
    await expect(page.locator("#analysis-question")).toBeVisible();
    const sectionOrder = await page.evaluate(() => {
      const birth = document.querySelector("#customer-record");
      const bazi = document.querySelector("#bazi");
      const question = document.querySelector("#question-stage");
      if (!birth || !bazi || !question) return false;
      return Boolean(birth.compareDocumentPosition(bazi) & Node.DOCUMENT_POSITION_FOLLOWING)
        && Boolean(bazi.compareDocumentPosition(question) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(sectionOrder).toBe(true);
    await page.locator("#analysis-question").fill("這份工作我應該繼續還是離開？");
    await page.getByRole("button", { name: "開始分析這個問題", exact: true }).click();

    await expect(page.locator("#result")).toBeVisible();
    await expect(page.locator("[data-primary-answer]")).toBeVisible();
    await expect(page.locator("[data-next-action]")).toBeVisible();
    await expect(page.locator("[data-technical-evidence]")).not.toHaveAttribute("open", "");
    await expect(page.getByRole("link", { name: /登入|註冊/ })).toHaveCount(0);
    await expectMobileViewportHealthy(page);
  });
});
