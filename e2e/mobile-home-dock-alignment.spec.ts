import { expect, test, type Locator } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, locale: 'zh-TW', serviceWorkers: 'block' });

async function box(locator: Locator) {
  await expect(locator).toBeVisible();
  const bounds = await locator.boundingBox();
  if (!bounds) throw new Error(`Missing bounds for ${locator}`);
  return bounds;
}

test('mobile homepage keeps the winter quote, dock and footer aligned', async ({ page }) => {
  // The quote only renders for seasonal skins.
  await page.route('**/api/owner-data?view=site-skin', route =>
    route.fulfill({ json: { configured: true, skin: 'solar-minor-snow' } }));
  await page.goto('/?zw_entry=home', { waitUntil: 'networkidle' });
  const discover = page.locator('.zw-v2-discover');
  await expect(discover).toContainText('往下探索昭梧');
  const quote = await box(page.locator('.zw-winter-quote'));
  expect((await box(discover)).y).toBeGreaterThanOrEqual(quote.y + quote.height);

  const sheet = page.locator('.zhaowu-home-sheet-shell');
  await expect(sheet).toHaveCSS('overflow-y', 'auto');
  await sheet.evaluate(el => el.scrollTo({ top: el.scrollHeight, behavior: 'instant' }));
  await expect.poll(() => sheet.evaluate(el =>
    Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop))).toBeLessThanOrEqual(1);

  const dock = page.locator('.zhaowu-site-utility-dock');
  const group = dock.locator(':scope > .zhaowu-site-utility-buttons');
  const buttons = group.locator(':scope > button');
  await expect(buttons).toHaveCount(2);
  const frame = await box(group);
  const dockBox = await box(dock);
  for (const bounds of [dockBox, frame]) {
    expect(Math.abs(bounds.x + bounds.width / 2 - 195)).toBeLessThanOrEqual(4);
  }
  const first = await box(buttons.first());
  for (const button of await buttons.all()) {
    const bounds = await box(button);
    const icon = await box(button.locator('.zhaowu-site-utility-icon'));
    expect(bounds.width).toBeGreaterThanOrEqual(44);
    expect(bounds.height).toBeGreaterThanOrEqual(44);
    expect(bounds.width).toBe(first.width);
    expect(bounds.height).toBe(first.height);
    expect(bounds.y).toBe(first.y);
    expect(bounds.x).toBeGreaterThanOrEqual(frame.x);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(frame.x + frame.width);
    expect(Math.abs(icon.x + icon.width / 2 - bounds.x - bounds.width / 2)).toBeLessThanOrEqual(2);
    expect(Math.abs(icon.y + icon.height / 2 - bounds.y - bounds.height / 2)).toBeLessThanOrEqual(2);
  }

  const footer = page.locator('.zhaowu-site-footer');
  expect((await box(footer)).y).toBeGreaterThanOrEqual(dockBox.y + dockBox.height);
  const latest = await box(footer.locator('.zhaowu-latest-update-link'));
  const login = await box(footer.locator('.zhaowu-home-login-inline'));
  const visits = await box(footer.locator('.zhaowu-site-views'));
  expect(latest.y).toBe(login.y);
  expect(latest.height).toBe(login.height);
  expect(visits.height).toBe(login.height);
  expect(Math.abs(visits.x - latest.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(visits.x + visits.width - login.x - login.width)).toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
