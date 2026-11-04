import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });
for (const [hemisphere, expected] of [['north','solar-frost-descent'], ['south','sydney-jacaranda'], ['unknown','solar-frost-descent'], ['offline','solar-frost-descent']] as const) {
  test(`seasonal artwork resolves for ${hemisphere}`, async ({ page }) => {
    await page.setViewportSize({width:390,height:844});
    await page.clock.install({time:new Date('2026-11-03T01:00:00Z')});
    await page.route('**/api/owner-data?view=site-skin', r => r.fulfill({json:{skin:'solar-auto',configured:true}}));
    await page.route('**/api/zhaowu-capabilities?mode=visitor-hemisphere', r => hemisphere === 'offline' ? r.abort() : r.fulfill({json:{hemisphere}}));
    await page.goto('/?zw_entry=home', {waitUntil:'networkidle'});
    await expect(page.locator('html')).toHaveAttribute('data-zws', expected);
    await expect(page.locator('html')).toHaveAttribute('data-zws-term', '霜降');
    await expect(page.locator('[data-home-birth-entry]')).toBeVisible();
    await expect(page.locator('.zw-v2-season')).toHaveCSS('-webkit-text-fill-color', 'rgb(255, 253, 248)');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.screenshot({path:`test-results/hemisphere-${hemisphere}.png`});
  });
}
test('manually selected artwork is preserved', async ({page}) => {
  await page.route('**/api/owner-data?view=site-skin', r => r.fulfill({json:{skin:'butterfly-lotus',configured:true}}));
  await page.route('**/api/zhaowu-capabilities?mode=visitor-hemisphere', r => r.fulfill({json:{hemisphere:'south'}}));
  await page.goto('/?zw_entry=home', {waitUntil:'networkidle'});
  await expect(page.locator('html')).toHaveAttribute('data-zws', 'butterfly-lotus');
});

test('Sydney jacaranda can be selected as a complete theme', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.route('**/api/owner-data?view=site-skin', r => r.fulfill({json:{skin:'sydney-jacaranda',configured:true}}));
  await page.goto('/?zw_entry=home', {waitUntil:'networkidle'});
  await expect(page.locator('html')).toHaveAttribute('data-zws','sydney-jacaranda');
  await expect(page.locator('.zw-stage')).toHaveCSS('background-image', /sydney-jacaranda-summer/);
  await expect(page.locator('[data-home-birth-entry]')).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--zws-accent').trim())).toBe('#45406f');
  await page.screenshot({path:'test-results/jacaranda-theme-390.png', fullPage:true});
  await page.goto('/login', {waitUntil:'networkidle'});
  await expect(page.locator('.stone-login-stage-media')).toHaveAttribute('src', /sydney-jacaranda-summer/);
});

for (const [when, expected] of [['2026-12-15T01:00:00Z','sydney-jacaranda'], ['2027-05-15T01:00:00Z','pine-ink']] as const) {
  test(`southern seasonal selection ${when}`, async ({page}) => {
    await page.clock.install({time:new Date(when)});
    await page.route('**/api/owner-data?view=site-skin', r => r.fulfill({json:{skin:'solar-auto',configured:true}}));
    await page.route('**/api/zhaowu-capabilities?mode=visitor-hemisphere', r => r.fulfill({json:{hemisphere:'south'}}));
    await page.goto('/?zw_entry=home', {waitUntil:'networkidle'});
    if (expected === 'sydney-jacaranda') await expect(page.locator('html')).toHaveAttribute('data-zws', expected);
    else await expect(page.locator('html')).not.toHaveAttribute('data-zws', 'sydney-jacaranda');
  });
}

for (const width of [320, 390]) for (const locale of ['zh-Hant', 'zh-Hans', 'en']) {
 test(`login ${width} ${locale}: southern art and safe fallback`, async ({page}) => {
  await page.addInitScript(language => localStorage.setItem('zhaowu.display-language', language), locale);
  for (const hemisphere of ['south', 'north', 'unknown']) {
    await page.route('**/api/owner-data?view=site-skin', r => r.fulfill({json:{skin:'solar-auto',configured:true}}));
    await page.route('**/api/zhaowu-capabilities?mode=visitor-hemisphere', r => r.fulfill({json:{hemisphere}}));
    await page.setViewportSize({width,height:844});
    await page.goto('/login', {waitUntil:'networkidle'});
    const media = page.locator('.stone-login-stage-media');
    await expect(media).toHaveAttribute('src', hemisphere === 'south' ? /sydney-jacaranda-summer/ : /dragon-scholar/);
    await expect(page.locator('#login-title')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    if (hemisphere === 'south') await page.screenshot({path:`test-results/login-south-${width}-${locale}.png`});
    await page.unrouteAll({behavior:'wait'});
  }
 });
}

for (const width of [320, 390]) {
  test(`southern spring artwork at ${width}px on Start of Winter`, async ({page}) => {
    await page.setViewportSize({width,height:844});
    await page.clock.install({time:new Date('2026-11-08T00:00:00Z')});
    await page.route('**/api/owner-data?view=site-skin', r => r.fulfill({json:{skin:'solar-auto',configured:true}}));
    await page.route('**/api/zhaowu-capabilities?mode=visitor-hemisphere', r => r.fulfill({json:{hemisphere:'south'}}));
    await page.goto('/?zw_entry=home',{waitUntil:'networkidle'});
    await expect(page.locator('html')).toHaveAttribute('data-zws-term','立冬');
    await expect(page.locator('html')).toHaveAttribute('data-zws-hemisphere','south');
    await expect(page.locator('.zw-stage')).toHaveCSS('background-image', /sydney-jacaranda-summer/);
    await expect(page.locator('[data-home-birth-entry]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    expect((await page.request.get('/theme-skins/southern/sydney-jacaranda-summer.webp')).status()).toBe(200);
    await page.screenshot({path:`test-results/south-winter-${width}.png`});
  });
}

for (const [instant, phase, image] of [
  ['2026-11-06T13:01:00Z', '水始冰', 'water-begins-freezing.webp'],
  ['2026-11-11T13:01:00Z', '地始凍', 'earth-begins-freezing.webp'],
  ['2026-11-16T13:01:00Z', '雉入大水為蜃', 'pheasant-and-sea.webp'],
] as const) {
  test(`northern Start of Winter displays ${phase} at 390px`, async ({page}) => {
    await page.setViewportSize({width:390,height:844});
    await page.clock.install({time:new Date(instant)});
    await page.addInitScript(() => localStorage.setItem('zhaowu.locale', 'zh-Hant'));
    await page.route('**/api/owner-data?view=site-skin', r => r.fulfill({json:{skin:'solar-auto',configured:true}}));
    await page.route('**/api/zhaowu-capabilities?mode=visitor-hemisphere', r => r.fulfill({json:{hemisphere:'north'}}));
    await page.goto('/?zw_entry=home',{waitUntil:'networkidle'});
    await expect(page.locator('html')).toHaveAttribute('data-zws','solar-start-winter');
    await expect(page.locator('.zw-v2-season')).toContainText(phase);
    await expect(page.locator('.zw-stage')).toHaveCSS('background-image', new RegExp(image));
    await expect(page.locator('.zw-winter-quote')).toBeVisible();
    await expect(page.locator('[data-home-birth-entry]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    expect((await page.request.get('/theme-skins/solar-start-winter/' + image)).status()).toBe(200);
    await page.screenshot({path:`test-results/start-winter-${image}.png`});
  });
}
