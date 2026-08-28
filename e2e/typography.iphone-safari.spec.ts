import { expect, test, type Page } from "@playwright/test";

async function makeAppOfflineSafe(page: Page) {
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
}

test.describe("iPhone Safari typography lock", () => {
  test("uses real Songti/PingFang font stacks on the parchment application shell", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    expect(await page.evaluate(() => window.innerWidth)).toBe(390);

    const shell = page.locator(".zhaowu-home-sheet-shell");
    await expect(shell).toBeVisible();
    const shellFont = await shell.evaluate((node) => getComputedStyle(node).fontFamily);
    expect(shellFont).toContain("PingFang TC");

    const title = page.locator("#analysisForm h2");
    await expect(title).toBeVisible();
    const titleFont = await title.evaluate((node) => getComputedStyle(node).fontFamily);
    expect(titleFont).toContain("Songti TC");

    const submit = page.locator('#analysisForm button[type="submit"]');
    await expect(submit).toBeVisible();
    const submitFont = await submit.evaluate((node) => getComputedStyle(node).fontFamily);
    expect(submitFont).toContain("PingFang TC");

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
});
