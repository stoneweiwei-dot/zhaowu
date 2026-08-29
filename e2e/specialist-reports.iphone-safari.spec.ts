import { expect, test, type Page } from "@playwright/test";

async function fillBirth(page: Page, prefix: "qz" | "ziwei") {
  await page.getByLabel("年", { exact: true }).fill("1988");
  await page.getByLabel("月", { exact: true }).fill("10");
  await page.getByLabel("日", { exact: true }).fill("4");
  await page.getByLabel("時", { exact: true }).fill("4");
  await page.getByLabel("分", { exact: true }).fill("40");
  const city = page.getByLabel("出生地");
  await city.fill("Sydney");
  await expect(page.locator("." + prefix + "-city-results button").first()).toBeVisible();
  await page.locator("." + prefix + "-city-results button").first().click();
  await expect(city).toHaveValue("雪梨，澳洲");
}

test("Seven Luminaries uses one large mobile form and returns only a plain report", async ({ page }) => {
  await page.goto("/qizheng", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "你的七政命局報告" })).toBeVisible();
  await fillBirth(page, "qz");
  expect((await page.getByLabel("年", { exact: true }).boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(56);
  await page.getByRole("button", { name: "生成我的報告" }).click();
  await expect(page.getByRole("heading", { name: "你的個人報告" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "命局性情" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "被加強的慣性" })).toBeVisible();
  await expect(page.locator(".qz-wheel, .qz-body, .qz-policy")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("Zi Wei opens normally and returns a customer report without a technical chart", async ({ page }) => {
  await page.goto("/ziwei", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "你的紫微報告" })).toBeVisible();
  await fillBirth(page, "ziwei");
  expect((await page.getByLabel("年", { exact: true }).boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(56);
  await page.getByRole("button", { name: "生成我的報告" }).click();
  await expect(page.getByRole("heading", { name: "性格底色" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "事業與做事方式" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "當前人生階段" })).toBeVisible();
  await expect(page.locator(".ziwei-chart-board, .ziwei-technical")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
