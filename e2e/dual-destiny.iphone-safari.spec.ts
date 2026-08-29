import { expect, test } from "@playwright/test";

async function pseudoText(page: import("@playwright/test").Page, selector: string) {
  return page.locator(selector).evaluate((element) => {
    const value = getComputedStyle(element, "::after").content;
    return value.replace(/^['\"]|['\"]$/g, "");
  });
}

test("iPhone Safari can complete Past & Present with local birthplace correction and without cloud services", async ({ page }) => {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
  await page.goto("/tianji-dual", { waitUntil: "domcontentloaded" });

  await expect(page.locator(".dual-hero h1")).toBeVisible();
  expect(await pseudoText(page, ".dual-hero h1")).toBe("前世今生");

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
  await expect(page.locator(".dual-results .dual-section-title h2")).toBeVisible();
  expect(await pseudoText(page, ".dual-results .dual-section-title h2")).toBe("前世今生總覽");
  expect(await pseudoText(page, ".dual-side-card:nth-child(1) h3")).toBe("今生的表現");
  expect(await pseudoText(page, ".dual-side-card:nth-child(2) h3")).toBe("前世留下的慣性");
  expect(await pseudoText(page, ".dual-details summary")).toBe("查看傳統計算依據");
  await expect(page.getByText("融合星評", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
