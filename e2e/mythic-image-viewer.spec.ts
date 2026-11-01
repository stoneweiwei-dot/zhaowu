import { test, expect } from '@playwright/test';

test('original artwork opens in place and can be closed without losing the page', async ({ page }) => {
  await page.goto('/mythic-atlas#guaili-zodiac');
  const section = page.locator('#guaili-zodiac');
  await section.locator('summary').first().click();
  const link = section.locator('a[href^="/mythic-atlas/zodiac/"]').first();
  await link.click();
  const dialog = page.locator('dialog.hq-image-viewer[open]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toHaveAttribute('src', /\/mythic-atlas\/zodiac\//);
  const close = dialog.getByRole('button');
  await expect(close).toBeInViewport();
  await close.click();
  await expect(dialog).toBeHidden();
  await expect(link).toBeFocused();
  await expect(page).toHaveURL(/mythic-atlas#guaili-zodiac/);
  await link.click();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(link).toBeFocused();
  await page.locator('#paintings .hq-full-plate').click();
  await expect(page.locator('dialog.hq-image-viewer[open]')).toBeVisible();
  await page.locator('dialog.hq-image-viewer[open] button').click();
  await expect(page.locator('dialog.hq-image-viewer[open]')).toHaveCount(0);
});
