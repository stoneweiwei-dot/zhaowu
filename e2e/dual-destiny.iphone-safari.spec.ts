import { expect, test } from "@playwright/test";

test("iPhone Safari can complete the dual chart with local birthplace correction and without cloud services", async ({ page }) => {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
  await page.goto("/tianji-dual", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "一個人，兩種反應", exact: true })).toBeVisible();
  const fields = page.locator(".dual-fields select");
  await fields.nth(0).selectOption("1988");
  await fields.nth(1).selectOption("10");
  await fields.nth(2).selectOption("4");
  await fields.nth(3).selectOption("4");
  await fields.nth(4).selectOption("40");

  const birthplace = page.getByLabel("出生地");
  await birthplace.fill("Sydney");
  await expect(page.locator("#dual-birth-city-results button").first()).toBeVisible();
  await page.locator("#dual-birth-city-results button").first().click();
  await expect(birthplace).toHaveValue("雪梨，澳洲");

  await page.getByRole("button", { name: "看結果", exact: true }).click();

  await expect(page.getByText(/已按出生地校正 雪梨，澳洲/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "你的兩種反應", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "平時怎樣做事", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "壓力來時的反應", exact: true })).toBeVisible();
  await expect(page.getByText("查看傳統盤面", { exact: true })).toBeVisible();
  await expect(page.getByText("融合星評", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
