import { expect, test, type Page } from "@playwright/test";

async function makeAppOfflineSafe(page: Page) {
  await page.route("**/rest/v1/**", (route) =>
    route.fulfill({ status: 503, body: "offline-test" }),
  );
}

async function dismissInstallPromptIfVisible(page: Page) {
  const dismiss = page.getByRole("button", { name: "稍後再說", exact: true });
  if (await dismiss.isVisible().catch(() => false)) await dismiss.click();
}

test("guest birth survives reload and is reused by a specialist reading without login", async ({ page }) => {
  await makeAppOfflineSafe(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await dismissInstallPromptIfVisible(page);

  await page.locator("#birth-year").fill("1988");
  await page.locator("#birth-month").fill("10");
  await page.locator("#birth-day").fill("4");
  await page.locator("#birth-hour").fill("4");
  await page.locator("#birth-minute").fill("40");
  await page.locator("#birth-gender").selectOption("male");

  await page.locator("#birth-city").click();
  const firstCity = page.locator('#birth-city-results [role="option"]').first();
  await expect(firstCity).toBeVisible();
  await firstCity.click();

  await page.locator("#analysisForm").evaluate((form) =>
    (form as HTMLFormElement).requestSubmit(),
  );
  await expect(page.locator(".zhaowu-birth-summary")).toBeVisible();
  await expect(page.locator("#analysis-question")).toBeVisible();
  await expect(page.getByRole("link", { name: /登入|註冊/ })).toHaveCount(0);

  const storedBeforeReload = await page.evaluate(() =>
    window.localStorage.getItem("zhaowu.birth-record.v1"),
  );
  expect(storedBeforeReload).toBeTruthy();
  expect(storedBeforeReload).toContain('"minute":40');

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator(".zhaowu-birth-summary")).toBeVisible();
  await expect(page.locator("#analysis-question")).toBeVisible();
  await expect(page.locator(".zhaowu-birth-summary")).toContainText("1988");

  const storedAfterReload = await page.evaluate(() =>
    window.localStorage.getItem("zhaowu.birth-record.v1"),
  );
  expect(storedAfterReload).toBe(storedBeforeReload);

  await page.goto("/indian-astrology", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-d60-minute-gate]")).toBeVisible();
  await expect(page.locator("[data-d60-confirmed-record]")).toContainText("1988-10-04 · 04:40");
  await expect(page.getByRole("link", { name: /登入|註冊/ })).toHaveCount(0);

  expect(await page.evaluate(() =>
    document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )).toBe(true);
});
