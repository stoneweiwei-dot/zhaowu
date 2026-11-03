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

test('whole artwork and controls fit at 320px', async ({ page }) => {
  await page.goto('/mythic-atlas#guaili-zodiac');
  const section = page.locator('#guaili-zodiac');
  await section.locator('summary').first().click();
  // Expand at the configured viewport, then test the viewer at 320px.
  await page.setViewportSize({ width: 320, height: 700 });
  const link = section.locator('a[href^="/mythic-atlas/zodiac/"]').first();
  await link.click();
  const dialog = page.locator('dialog.hq-image-viewer[open]');
  const img = dialog.locator('img');
  await expect(img).toBeVisible();
  const rect = await img.boundingBox();
  expect(rect).not.toBeNull();
  expect(rect!.x).toBeGreaterThanOrEqual(0);
  expect(rect!.y + rect!.height).toBeLessThanOrEqual(700);
  for (const control of await dialog.locator('button, a').all()) {
    const box = await control.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  }
  await dialog.getByRole('button').click();
  await expect(link).toBeFocused();
});

test('a failed original image leaves an accessible way back', async ({ page }) => {
  await page.route('**/mythic-atlas/zodiac/*.png', route => route.abort());
  await page.goto('/mythic-atlas#guaili-zodiac');
  const section = page.locator('#guaili-zodiac');
  await section.locator('summary').first().click();
  const link = section.locator('a[href^="/mythic-atlas/zodiac/"]').first();
  await link.click();
  const dialog = page.locator('dialog.hq-image-viewer[open]');
  await expect(dialog.getByRole('status')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(link).toBeFocused();
});
