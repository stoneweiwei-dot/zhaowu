import { test, expect } from '@playwright/test';

test('almanac summary keeps its live data and full details accessible', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/#today');
  const board = page.locator('#daily-almanac .zw-ink-board').first();
  await expect(board).toBeVisible();
  const summary = board.locator('.zw-reference-grid');
  await expect(summary.locator('.zw-reference-cell')).toHaveCount(6);
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    for (const radio of await page.locator('[data-language-switcher]').first().getByRole('radio').all()) {
      await radio.click();
      await expect(summary).toBeVisible();
      const scrollWidth = await summary.evaluate(el => el.scrollWidth);
      const clientWidth = await summary.evaluate(el => el.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    }
  }
  const details = board.locator('.zw-reference-more');
  await details.locator(':scope > summary').click();
  await expect(details.locator('.zw-ink-pillars')).toBeVisible();
  await expect(details.locator('.zw-ink-sacred-roster')).toBeVisible();
  await expect(page.locator('.zhaowu-today-section.is-wardrobe')).toBeVisible();
  await expect(page.locator('.zhaowu-today-section.is-spirit')).toBeVisible();
  await page.locator('.zhaowu-today-guide__spirit button').click();
  const dialog = page.locator('.zhaowu-spirit-slip[role="dialog"]');
  await expect(dialog).toBeVisible();
  await dialog.locator('.zhaowu-spirit-slip-close').click();
  await expect(dialog).toHaveCount(0);
});
