import { expect, test, type Page } from "@playwright/test";

/**
 * Cascade-priority guard for the night "Today" module.
 * Old stylesheets (r69 almanac, r100 wardrobe #id rules, r127 night) must not
 * override the canonical layer: section headings, colour swatches and the Jade
 * Dragon assistant have to keep their intended computed styles at every width.
 */
const WIDTHS = [390, 820, 1440];

function luminance(rgb: string) {
  const c = rgb.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
  const lin = c.map((v) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return lin[0] * 0.2126 + lin[1] * 0.7152 + lin[2] * 0.0722;
}
function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
function alpha(rgb: string) {
  const m = rgb.match(/rgba?\(([^)]+)\)/)?.[1].split(/[ ,/]+/).filter(Boolean);
  return m && m.length >= 4 ? Number(m[3]) : 1;
}

async function openNight(page: Page, width: number) {
  await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
  await page.route(/ipwho\.is|open-meteo\.com/, (route) => route.abort());
  await page.addInitScript(() => {
    localStorage.setItem("zhaowu.display-language", "zh-Hant");
    localStorage.setItem("zhaowu.theme.v1", "night");
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-zw-theme", "night");
  await expect(page.locator("#daily-almanac")).toBeVisible();
}

for (const width of WIDTHS) {
  test.describe(`night Today cascade @${width}px`, () => {
    test("three independent section headings stay readable and clearly separated", async ({ page }) => {
      await openNight(page, width);
      const sections = page.locator("#daily-almanac .zhaowu-today-section");
      await expect(sections).toHaveCount(3);
      const headings = sections.locator(".zhaowu-today-section__head h2");
      await expect(headings).toHaveCount(3);
      for (let i = 0; i < (await headings.count()); i += 1) {
        await expect(headings.nth(i)).toBeVisible();
        expect(await headings.nth(i).evaluate((n) => getComputedStyle(n).color).then(luminance)).toBeGreaterThan(0.5);
        const box = await sections.nth(i).boundingBox();
        expect(box!.height).toBeGreaterThan(120);
      }
    });

    test("wardrobe swatches keep real colours and the list is a vertical, non-scrolling column", async ({ page }) => {
      await openNight(page, width);
      const wardrobe = page.locator("#daily-almanac #five-element-wardrobe");
      const swatches = wardrobe.locator("[data-daily-color-swatch] i");
      expect(await swatches.count()).toBeGreaterThanOrEqual(15);
      for (let i = 0; i < (await swatches.count()); i += 1) {
        const bg = await swatches.nth(i).evaluate((n) => getComputedStyle(n).backgroundColor);
        expect(alpha(bg), `swatch ${i} must not be transparent`).toBeGreaterThan(0.9);
      }
      const featured = wardrobe.locator("[data-daily-color-featured-swatch] i").first();
      expect(alpha(await featured.evaluate((n) => getComputedStyle(n).backgroundColor))).toBeGreaterThan(0.9);

      const list = wardrobe.locator('[data-daily-colors-choices]');
      const metrics = await list.evaluate((n) => ({ sw: n.scrollWidth, cw: n.clientWidth, flow: getComputedStyle(n).gridAutoFlow, cols: getComputedStyle(n).gridTemplateColumns.split(" ").length }));
      expect(metrics.sw).toBeLessThanOrEqual(metrics.cw + 1);
      expect(metrics.flow).toContain("row");
      expect(metrics.cols).toBe(1);
      const ys = await wardrobe.locator("[data-daily-colors-choices] button").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
      expect([...ys].sort((a, b) => a - b)).toEqual(ys);
      expect(new Set(ys).size).toBe(ys.length);

      for (const selector of ["[data-daily-colors-featured-head] strong", "[data-daily-colors-choices] button strong", "[data-daily-colors-choices] button small"]) {
        const el = wardrobe.locator(selector).first();
        expect(await el.evaluate((n) => getComputedStyle(n).color).then(luminance), selector).toBeGreaterThan(0.5);
      }
    });

    test("jade dragon keeps its avatar and a readable, opaque night panel", async ({ page }) => {
      await openNight(page, width);
      const trigger = page.locator(".zhaowu-dragon-guide-trigger");
      await expect(trigger).toBeVisible();
      const avatar = page.locator(".zhaowu-dragon-guide-trigger .zhaowu-dragon-guide-avatar");
      const avatarBg = await avatar.evaluate((n) => getComputedStyle(n).backgroundImage);
      expect(avatarBg).not.toBe("none");
      const box = await avatar.boundingBox();
      expect(box!.width).toBeGreaterThan(24);
      await trigger.click();
      const panel = page.locator(".zhaowu-dragon-guide-panel");
      await expect(panel).toBeVisible();
      const style = await panel.evaluate((n) => { const s = getComputedStyle(n); return { bg: s.backgroundColor, color: s.color }; });
      expect(alpha(style.bg)).toBeGreaterThan(0.9);
      // Surface-aware night: the assistant is a paper carrier, so ink must contrast with
      // whatever surface it sits on (never light-on-light or dark-on-dark).
      expect(contrast(style.bg, style.color), "panel text vs surface").toBeGreaterThanOrEqual(4.5);
      const answer = await page.locator(".zhaowu-dragon-guide-answer").evaluate((n) => { const s = getComputedStyle(n); return { bg: s.backgroundColor, color: s.color }; });
      expect(contrast(answer.bg, answer.color), "answer text vs surface").toBeGreaterThanOrEqual(4.5);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    });
  });
}
