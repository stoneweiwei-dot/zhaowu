import { test, expect } from '@playwright/test';

test('language options remain readable and tappable at narrow and desktop widths', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/knowledge');
  const picker = page.locator('[data-language-switcher]').first();
  for (const width of [320, 390, 430, 1440]) {
    await page.setViewportSize({ width, height: 850 });
    for (const theme of ['day', 'night']) {
      await page.evaluate((value) => {
        if (value === 'night') document.documentElement.setAttribute('data-zw-theme', 'night');
        else document.documentElement.removeAttribute('data-zw-theme');
      }, theme);
      const options = picker.getByRole('radio');
      await expect(options).toHaveCount(3);
      for (let i = 0; i < 3; i++) {
        const option = options.nth(i);
        await option.click();
        await expect(option).toHaveAttribute('aria-checked', 'true');
        const bounds = await option.evaluate((button) => {
          const box = button.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(button);
          const text = range.getBoundingClientRect();
          return { left: box.left, right: box.right, height: box.height, width: box.width, textLeft: text.left, textRight: text.right, viewport: innerWidth };
        });
        expect(bounds.width).toBeGreaterThanOrEqual(44);
        expect(bounds.height).toBeGreaterThanOrEqual(44);
        expect(bounds.left).toBeGreaterThanOrEqual(0);
        expect(bounds.right).toBeLessThanOrEqual(bounds.viewport);
        expect(bounds.textLeft).toBeGreaterThanOrEqual(bounds.left - 0.5);
        expect(bounds.textRight).toBeLessThanOrEqual(bounds.right + 0.5);
      }
    }
  }
});
