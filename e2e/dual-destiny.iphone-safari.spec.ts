import { expect, test } from "@playwright/test";

test("iPhone Safari opens the real Dharma Palm Past & Present report", async ({ page }) => {
  await page.goto("/yizhangjing", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "前世今生・達摩一掌經" })).toBeVisible();
  await page.getByLabel("年", { exact: true }).fill("1988");
  await page.getByLabel("月", { exact: true }).fill("10");
  await page.getByLabel("日", { exact: true }).fill("4");
  await page.getByLabel("順行（傳統男命）").check();
  await page.getByLabel("出生時辰").selectOption("3");

  for (const field of [page.getByLabel("年", { exact: true }), page.getByLabel("月", { exact: true }), page.getByLabel("日", { exact: true }), page.getByLabel("出生時辰")]) {
    expect((await field.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(56);
  }

  await page.getByRole("button", { name: "生成我的報告" }).click();

  await expect(page.getByRole("heading", { name: "前四世・六道習性報告" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "前四世來自哪一道" })).toBeVisible();
  await expect(page.getByText("前四世", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("前三世", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("前二世", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("前一世", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/修羅道在四世中出現2次/)).toBeVisible();
  await expect(page.getByText(/被重複加強/)).toBeVisible();
  await expect(page.getByText("這一世的特徵", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("留到今生的習性", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("這份報告已保存在本裝置。")).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("zhaowu.specialist-history.v1") || "[]").length)).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
