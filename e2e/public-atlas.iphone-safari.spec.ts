import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
}

test.describe("iPhone Safari public atlas", () => {
  test("serves gallery artwork from same-origin static assets without Supabase gallery traffic", async ({ page }) => {
    const forbiddenRequests: string[] = [];
    const runtimeErrors: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      if (
        url.includes("plgpxusmemnmzckbwtiv.supabase.co") &&
        (url.includes("gallery_assets") || url.includes("/storage/v1/object/public/zhaowu-gallery/"))
      ) {
        forbiddenRequests.push(url);
      }
    });
    page.on("pageerror", (error) => runtimeErrors.push(error.message));

    await page.addInitScript(() => {
      localStorage.removeItem("zhaowu.display-language");
      localStorage.removeItem("zhaowu.locale");
    });
    await page.goto("/auspicious-atlas", { waitUntil: "networkidle" });

    const atlas = page.locator("#auspicious-atlas-full");
    await expect(atlas).toBeVisible();

    const images = atlas.locator("img");
    await expect(images.first()).toBeVisible();
    expect(await images.count()).toBeGreaterThan(0);

    const origin = await page.evaluate(() => window.location.origin);
    const urls = await images.evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLImageElement).currentSrc || (node as HTMLImageElement).src),
    );
    expect(urls.every((url) => new URL(url).origin === origin)).toBe(true);
    expect(urls.some((url) => url.includes("/report-visuals/full/") || url.includes("/ornaments/generated/"))).toBe(true);

    await expect.poll(async () =>
      images.evaluateAll((nodes) => nodes.filter((node) => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0).length),
    ).toBeGreaterThan(0);

    await expectNoHorizontalOverflow(page);
    expect(forbiddenRequests).toEqual([]);
    expect(runtimeErrors).toEqual([]);
  });
});
