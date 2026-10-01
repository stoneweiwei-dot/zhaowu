import { expect, test } from "@playwright/test";

for (const width of [360, 390, 430]) {
  test(`English Day/Night toggle is not clipped at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
    await page.addInitScript(() => localStorage.setItem("zhaowu.display-language", "en"));
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const toggle = page.locator(".zhaowu-header-mode-toggle");
    await expect(toggle).toBeVisible();
    for (const name of ["Day", "Night"]) {
      const button = toggle.getByRole("button", { name: new RegExp(name, "i") });
      await expect(button).toHaveText(name);
      const m = await button.evaluate((n) => {
        const range = document.createRange();
        range.selectNodeContents(n);
        return { text: range.getBoundingClientRect().width, box: n.getBoundingClientRect().width, scroll: n.scrollWidth, client: n.clientWidth };
      });
      expect(m.scroll, `${name} scrollWidth`).toBeLessThanOrEqual(m.client + 1);
      expect(m.text, `${name} text fits its button`).toBeLessThanOrEqual(m.box);
    }
    const tb = await toggle.boundingBox();
    const nightBox = await toggle.getByRole("button", { name: /night/i }).boundingBox();
    expect(nightBox!.x + nightBox!.width).toBeLessThanOrEqual(tb!.x + tb!.width + 1);
    expect(nightBox!.x + nightBox!.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}
