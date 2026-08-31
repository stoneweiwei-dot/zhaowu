import { expect, test, type Page } from "@playwright/test";

async function makeAppOfflineSafe(page: Page) {
  await page.route("**/rest/v1/**", (route) =>
    route.fulfill({ status: 503, body: "offline-test" }),
  );
}

async function dismissInstallPrompt(page: Page) {
  const dismiss = page.getByRole("button", {
    name: "已加入，不再提示",
    exact: true,
  });
  await expect(dismiss).toBeVisible();
  await dismiss.click();
}

async function expectMobileViewportHealthy(page: Page) {
  expect(await page.evaluate(() => window.innerWidth)).toBe(390);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
}

async function expectNoOverlap(page: Page, upperSelector: string, lowerSelector: string) {
  const overlaps = await page.evaluate(
    ({ upperSelector, lowerSelector }) => {
      const upper = document.querySelector(upperSelector)?.getBoundingClientRect();
      const lower = document.querySelector(lowerSelector)?.getBoundingClientRect();
      if (!upper || !lower) return true;
      return !(
        upper.right <= lower.left ||
        upper.left >= lower.right ||
        upper.bottom <= lower.top ||
        upper.top >= lower.bottom
      );
    },
    { upperSelector, lowerSelector },
  );
  expect(overlaps).toBe(false);
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
  test("Home exposes the analysis entry and survives backend degradation", async ({
    page,
  }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator("#analysisForm .zhaowu-quiz-topics")).toHaveCount(0);
    await expect(page.locator("#analysisForm .zhaowu-quiz-states")).toHaveCount(0);

    await expect(page.locator("#analysisForm")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "前世今生", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "交卷，先看答案", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("子時換日", { exact: true })).toHaveCount(0);
    await expect(
      page.getByText("套用真太陽時校正", { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "登入", exact: true }).first(),
    ).toBeVisible();

    await expect(
      page.getByRole("dialog", { name: "把昭梧加入主畫面", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "查看加入步驟", exact: true }),
    ).toBeVisible();
    await page.locator("#analysisForm").scrollIntoViewIfNeeded();
    await expect(page.locator("#analysisForm")).toBeInViewport();
    await expect(
      page.locator('#analysisForm button[type="submit"]'),
    ).toBeVisible();
    await expectMobileViewportHealthy(page);
  });

  test("Home language switching keeps the main controls usable", async ({
    page,
  }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: "简中", exact: true }).click();
    await expect(page.locator("#analysisForm")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "交卷，先看答案", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "前世今生", exact: true }),
    ).toBeVisible();

    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.locator("#analysisForm")).toBeVisible();
    await expect(page.locator("#analysis-question")).toBeVisible();
    await expect(page.locator("#birth-year")).toBeVisible();
    await expect(page.locator("#birth-month")).toBeVisible();
    await expect(page.locator("#birth-day")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Past & Present", exact: true }),
    ).toBeVisible();

    await page.getByRole("button", { name: "繁中", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "交卷，先看答案", exact: true }),
    ).toBeVisible();
    await expect(
      page.locator('#analysisForm button[type="submit"]'),
    ).toBeVisible();
    await expectMobileViewportHealthy(page);
  });

  test("Jade Dragon stays in flow and never covers the quiz or article prose", async ({
    page,
  }) => {
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
    await expect(panel.getByText("性格兩面", { exact: true })).toHaveCount(0);

    await panel.getByRole("button", { name: "關閉導覽", exact: true }).click();
    const firstIllustratedArticle = page.locator("#life-view details").filter({
      has: page.locator("[data-life-view-art-fragment]"),
    }).first();
    await firstIllustratedArticle.locator("summary").click();
    const fragment = firstIllustratedArticle.locator("[data-life-view-art-fragment]").first();
    await expect(fragment).toBeVisible();
    await expect(fragment.locator("img")).toHaveCSS("object-fit", "cover");
    const fragmentBox = await fragment.boundingBox();
    expect(fragmentBox?.width ?? 0).toBeGreaterThanOrEqual(180);
    expect(fragmentBox?.width ?? 999).toBeLessThanOrEqual(240);
    await expectMobileViewportHealthy(page);
  });

  test("Login page remains reachable and exposes email credentials", async ({
    page,
  }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: "登入昭梧", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Email", exact: true }),
    ).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expectMobileViewportHealthy(page);
  });

  test("Signed-out Account degrades to a clear login path", async ({
    page,
  }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/account", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: "我的昭梧", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "登入", exact: true }).first(),
    ).toBeVisible();
    await expectMobileViewportHealthy(page);
  });

  test("Analysis form blocks incomplete submissions instead of failing silently", async ({
    page,
  }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await fillKnownBirthData(page);

    await page
      .locator("#analysisForm form")
      .evaluate((form) => (form as HTMLFormElement).requestSubmit());

    await expect(
      page.getByText("請從搜尋結果選擇出生城市與國家。", { exact: true }),
    ).toBeVisible();
    await expect(page.locator("#analysisForm")).toBeVisible();
    await expectMobileViewportHealthy(page);
  });

  test("Free analysis completes end-to-end without cloud availability", async ({
    page,
  }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await dismissInstallPrompt(page);
    await fillKnownBirthData(page);

    await page.locator("#birth-city").click();
    const firstCity = page
      .locator('#birth-city-results [role="option"]')
      .first();
    await expect(firstCity).toBeVisible();
    await firstCity.click();

    await page.getByRole("button", { name: "交卷，看答案", exact: true }).click();

    const result = page.locator("#result");
    await expect(result).toBeVisible();
    await expect(page.locator("#analysisForm")).toHaveClass(/is-compact/);
    await expect(
      page.getByRole("button", { name: "調整資料", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("已套用真太陽時校正", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("子時不換日（以午夜為界）", { exact: true }),
    ).toBeVisible();
    await expect(page.locator("#analysis-question")).toHaveCount(0);
    await expect(page.locator("#birth-city")).toBeVisible();
    await expect(page.locator("#current-city")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "我現在最應該先處理什麼？",
        exact: true,
      }),
    ).toBeVisible();
    await expect(result.locator("article").first()).not.toBeEmpty();
    await expect(
      page.getByRole("button", { name: "查看完整報告", exact: true }),
    ).toBeVisible();
    await expectMobileViewportHealthy(page);
  });
});
