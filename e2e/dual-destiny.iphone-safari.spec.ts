import { expect, test } from "@playwright/test";

test("iPhone Safari can complete the dual chart without cloud services", async ({ page }) => {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
  await page.goto("/tianji-dual", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "一次輸入，同看外在格局與內在底色", exact: true })).toBeVisible();
  const fields = page.locator(".dual-fields select");
  await fields.nth(0).selectOption("1988");
  await fields.nth(1).selectOption("10");
  await fields.nth(2).selectOption("4");
  await fields.nth(3).selectOption("4");
  await page.getByRole("button", { name: "啟動雙軌命盤", exact: true }).click();

  await expect(page.getByRole("heading", { name: "雙軌結果", exact: true })).toBeVisible();
  await expect(page.getByText("軌道 A · 外在立足", { exact: true })).toBeVisible();
  await expect(page.getByText("軌道 B · 內在底色", { exact: true })).toBeVisible();
  await expect(page.getByText("融合星評", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
