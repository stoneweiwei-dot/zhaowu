import { test, expect } from '@playwright/test';

test('dated observation distinguishes current from archived and links to its source', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-03T01:00:00Z'));
  await page.goto('/sky-events');
  const brief = page.locator('.sky-observation-brief');
  await expect(brief.locator('time')).toHaveAttribute('datetime', '2026-11-03');
  await expect(brief.getByRole('status')).not.toContainText(/not yet|尚未/i);
  await page.clock.setFixedTime(new Date('2026-11-04T01:00:00Z'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(brief.getByRole('status')).toContainText(/not yet|尚未/i);
  await expect(brief.locator('time')).toHaveAttribute('datetime', '2026-11-03');
  await brief.getByRole('link').click();
  await expect(page).toHaveURL(/#sky-observation-record$/);
  await expect(page.locator('#sky-observation-record .daily-sky')).toBeVisible();
});

test('summary stays readable at mobile and desktop widths in each language', async ({ page }) => {
  test.setTimeout(90_000);
  await page.clock.setFixedTime(new Date('2026-11-04T01:00:00Z'));
  await page.goto('/sky-events');
  const brief = page.locator('.sky-observation-brief');
  for (const width of [320, 390, 430, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const theme of ['day', 'night']) {
      await page.evaluate((mode) => mode === 'night' ? document.documentElement.setAttribute('data-zw-theme', 'night') : document.documentElement.removeAttribute('data-zw-theme'), theme);
      for (const option of await page.locator('[data-language-switcher]').first().getByRole('radio').all()) {
        await option.click();
        await expect(brief.getByRole('status')).toBeVisible();
        await expect(brief.locator('time')).toHaveText('2026-11-03');
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
        const box = await brief.getByRole('link').boundingBox();
        expect(box!.height).toBeGreaterThanOrEqual(44);
      }
    }
  }
});
