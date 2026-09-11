import { expect, test } from "@playwright/test";

const SUPABASE_HOST = "plgpxusmemnmzckbwtiv.supabase.co";
const GENERIC_402 = /^Failed to load resource: the server responded with a status of 402/;

function isTeaGalleryUrl(url: string) {
  return url.includes(SUPABASE_HOST) && (
    url.includes("gallery_assets") ||
    url.includes("/storage/v1/object/public/zhaowu-gallery/")
  );
}

test("tea guardian quiz renders and completes on iPhone Safari", async ({ page }) => {
  const consoleErrors: string[] = [];
  const supabaseGalleryRequests: string[] = [];
  const knownSupabaseQuotaResponses: string[] = [];
  const unexpected402Responses: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("request", (request) => {
    const url = request.url();
    if (isTeaGalleryUrl(url)) supabaseGalleryRequests.push(url);
  });
  page.on("response", (response) => {
    if (response.status() !== 402) return;
    const url = response.url();
    if (url.includes(SUPABASE_HOST) && !isTeaGalleryUrl(url)) {
      knownSupabaseQuotaResponses.push(url);
      return;
    }
    unexpected402Responses.push(url);
  });

  await page.goto("/tea-guardian");
  await expect(page.getByRole("heading", { name: "七題找到你真正適合的茶" })).toBeVisible();
  await expect(page.locator(".tea-question")).toHaveCount(7);

  for (const name of ["aroma", "body", "bite", "warmth", "caffeine", "moment", "intention"]) {
    await page.locator(`input[name="${name}"]`).first().check();
  }
  await page.getByRole("button", { name: "查看我的三個茶答案" }).click();
  await expect(page.getByRole("heading", { name: "你的茶仙評估" })).toBeVisible();
  await expect(page.locator(".tea-result-card")).toHaveCount(2);

  const firstImage = page.locator(".tea-result-image").first();
  await expect(firstImage).toBeVisible();
  await expect.poll(async () => firstImage.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  const imageUrl = await firstImage.evaluate((image: HTMLImageElement) => image.currentSrc || image.src);
  expect(new URL(imageUrl).origin).toBe(new URL(page.url()).origin);
  expect(new URL(imageUrl).pathname).toMatch(/^\/tea-guardians\/[a-z0-9-]+\.webp$/);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(supabaseGalleryRequests).toEqual([]);
  expect(unexpected402Responses).toEqual([]);

  const nonQuotaConsoleErrors = consoleErrors.filter((text) => !GENERIC_402.test(text));
  expect(nonQuotaConsoleErrors).toEqual([]);
  if (consoleErrors.some((text) => GENERIC_402.test(text))) {
    expect(knownSupabaseQuotaResponses.length).toBeGreaterThan(0);
  }

  await page.screenshot({ path: "test-results/tea-guardian-iphone.png", fullPage: true });
});

test("tea guardian English copy is complete and does not mix Chinese UI", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("zhaowu.display-language", "en");
    window.localStorage.setItem("zhaowu.locale", "en");
  });
  await page.goto("/tea-guardian");
  await expect(page.getByRole("heading", { name: "Seven questions to find your tea" })).toBeVisible();
  await expect(page.getByText("Which aroma should arrive first?")).toBeVisible();
  await expect(page.getByRole("button", { name: "Show my three tea matches" })).toBeVisible();
  await expect(page.getByText("第一口最想先聞到什麼？")).toHaveCount(0);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
