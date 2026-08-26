import { expect, test } from "@playwright/test";

test("tea guardian quiz renders and completes on iPhone Safari", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });

  await page.goto("/tea-guardian");
  await expect(page.getByRole("heading", { name: "七題找到你真正適合的茶" })).toBeVisible();
  await expect(page.locator(".tea-question")).toHaveCount(7);

  for (const name of ["aroma", "body", "bite", "warmth", "caffeine", "moment", "intention"]) {
    await page.locator(`input[name="${name}"]`).first().check();
  }
  await page.getByRole("button", { name: "查看我的三個茶答案" }).click();
  await expect(page.getByRole("heading", { name: "你的茶仙評估" })).toBeVisible();
  await expect(page.locator(".tea-result-card")).toHaveCount(2);
  await expect(page.locator(".tea-result-image").first()).toBeVisible();
  await expect.poll(async () => page.locator(".tea-result-image").first().evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(consoleErrors).toEqual([]);
  await page.screenshot({ path: "test-results/tea-guardian-iphone.png", fullPage: true });
});

test("tea guardian English copy is complete and does not mix Chinese UI", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("zhaowu.locale", "en"));
  await page.goto("/tea-guardian");
  await expect(page.getByRole("heading", { name: "Seven questions to find your tea" })).toBeVisible();
  await expect(page.getByText("Which aroma should arrive first?")).toBeVisible();
  await expect(page.getByRole("button", { name: "Show my three tea matches" })).toBeVisible();
  await expect(page.getByText("第一口最想先聞到什麼？")).toHaveCount(0);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
