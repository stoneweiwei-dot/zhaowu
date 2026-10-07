import { test, type Page } from "@playwright/test";
const OUT = "e2e/__capture__";
async function setup(page: Page) {
  await page.clock.setFixedTime(new Date("2026-10-08T10:00:00+11:00"));
  await page.route("**/rest/v1/**", (r) => r.fulfill({ status: 503, body: "offline" }));
  await page.route(/ipwho\.is|open-meteo\.com|nominatim|photon/, (r) => r.abort());
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.addStyleTag({ content: `*{animation:none!important;transition:none!important}[aria-labelledby="home-install-title"]{display:none!important}` });
}
test("capture home + report", async ({ page }) => {
  test.setTimeout(150_000);
  await setup(page);
  await page.screenshot({ path: `${OUT}/01-home-top.png` });
  const portals = page.locator(".zhaowu-home-portals").first();
  if (await portals.count()) await portals.screenshot({ path: `${OUT}/02-portals.png` }).catch(() => {});
  await page.locator("#analysisForm").scrollIntoViewIfNeeded();
  await page.locator("#birth-year").fill("1988");
  await page.locator("#birth-month").fill("10");
  await page.locator("#birth-day").fill("4");
  await page.locator("#birth-hour").fill("4");
  await page.locator("#birth-minute").fill("40");
  await page.locator("#birth-city").click();
  await page.locator("#birth-city").fill("洛陽");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/03-city-luoyang.png` });
  const opt = page.locator('#birth-city-results [role="option"]').first();
  if (await opt.isVisible().catch(() => false)) await opt.click();
  await page.getByRole("button", { name: "保存並生成昭梧命書", exact: true }).click();
  await page.locator(".zhaowu-birth-summary").waitFor({ timeout: 60_000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/04-after-submit.png`, fullPage: true });
  const book = page.locator("[data-unified-birth-report]");
  if (await book.count()) {
    await book.scrollIntoViewIfNeeded();
    await book.screenshot({ path: `${OUT}/05-book-formal.png` });
    const btns = book.locator(".zhaowu-report-mode-switch button");
    const n = await btns.count();
    for (let i = 1; i < n; i++) { await btns.nth(i).click(); await page.waitForTimeout(800); await book.screenshot({ path: `${OUT}/06-book-mode-${i}.png` }); }
  }
});
