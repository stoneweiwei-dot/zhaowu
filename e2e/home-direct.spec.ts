import { test, expect } from '@playwright/test';

test('homepage entrances and scene at mobile and desktop sizes', async ({ page }) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    await page.goto('/');
    await expect(page.locator('[data-home-birth-entry]')).toBeVisible();
    await expect(page.locator('[data-home-card]')).toHaveCount(4);
    for (const card of await page.locator('[data-home-card]').all()) await expect(card.locator('.zw-entry')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.screenshot({path:`test-results/home-${width}.png`, fullPage:true});
    await page.getByRole('button', { name: /開始免費排盤|开始免费排盘|Start my free chart/ }).first().click();
    await expect(page.locator('[data-home-card]')).toHaveCount(0);
  }
});
