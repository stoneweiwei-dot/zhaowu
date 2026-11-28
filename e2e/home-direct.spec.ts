import { test, expect, type Locator, type Page } from '@playwright/test';

const home = '/?zw_entry=home';

async function checkLayout(page: Page, targets: Locator) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const target of await targets.all()) {
    const box = await target.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  }
}

test('homepage entrances and scene at mobile and desktop sizes', async ({ page }) => {
  test.setTimeout(120000);
  await page.addInitScript(() => localStorage.setItem('zhaowu.display-language', 'zh-Hant'));
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    await page.goto(home);
    const portals = page.locator('#wl-portals a');
    await expect(portals).toHaveCount(4);
    await checkLayout(page, portals);
    const daily = page.locator('.zw-daily-entries');
    const study = page.locator('.zw-study');
    const summary = study.locator('summary');
    const targets = page.locator('.zw-study-guide :is(button, a, summary):visible, .zw-langpick__toggle');
    await expect(daily.locator('button, a')).toHaveCount(3);
    await expect(daily.getByRole('link', { name: /今日星象/ })).toHaveAttribute('href', '/sky-events');
    await expect(daily.getByRole('link', { name: /每日幸運色/ })).toHaveAttribute('href', '/daily-colors');
    await expect(summary).toContainText('梧下文房');
    await expect(study).toHaveJSProperty('open', false);
    await checkLayout(page, targets);
    await daily.getByRole('button', { name: /看今天的運勢/ }).click();
    await expect(page.locator('#home-today-guide')).toBeVisible();

    await page.goto(home);
    await summary.click();
    await expect(study).toHaveJSProperty('open', true);
    for (const branch of await study.locator('button[aria-expanded]').all()) {
      if (await branch.getAttribute('aria-expanded') === 'false') await branch.click();
    }
    await expect(study.getByRole('button', { name: /尋五行/ })).toBeVisible();
    for (const path of ['/tea-guardian', '/knowledge/five-elements-tone-qi', '/quiz/divine-affinity', '/knowledge', '/bajinggong']) {
      await expect(study.locator('a[href="' + path + '"]')).toBeVisible();
    }
    await checkLayout(page, targets);
    await study.getByRole('button', { name: /開始免費排盤/ }).click();
    await expect(page.getByRole('heading', { name: '開始排盤與提問' })).toBeVisible();
  }
});

test('homepage supports all three languages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(home);
  const toggle = page.locator('.zw-langpick__toggle');
  for (const [language, titles, studyTitle] of [
    ['繁體中文', ['看今天的運勢', '今日星象', '每日幸運色'], '梧下文房'],
    ['简体中文', ['看今天的运势', '今日星象', '每日幸运色'], '梧下文房'],
    ['English', ['Today’s fortune', 'Today’s sky', 'Colour of the day'], 'The Wutong Study'],
  ] as const) {
    await toggle.click();
    await page.getByRole('radio', { name: language, exact: true }).click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    if (language !== '简体中文') await expect(toggle).toHaveText('中 / EN');
    await expect(page.locator('.zw-daily-entries strong')).toHaveText([...titles]);
    const portalTitles = language === 'English'
      ? ['Daily guide', 'In-depth reading', 'Destiny book', 'Spirit slip']
      : language === '简体中文' ? ['今日指引', '深度解读', '命书', '灵签'] : ['今日指引', '深度解讀', '命書', '靈籤'];
    await expect(page.locator('#wl-portals strong')).toHaveText(portalTitles);
    await expect(page.locator('.zw-study summary strong')).toHaveText(studyTitle);
  }
});

test('the menu opens by keyboard and the four entries reach the existing reading flows', async ({ page }) => {
  await page.goto(home);
  const menu = page.locator('.wl-menu');
  await menu.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveJSProperty('open', true);
  await expect(menu.locator('a[href="/history"]')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveJSProperty('open', false);
  await page.locator('.wl-explore').click();
  const portals = page.locator('#wl-portals');
  await expect(portals).toBeInViewport();
  await expect(portals.locator('a').nth(1)).toHaveAttribute('href', '/sample-report');
  await portals.locator('a[href="#spirit-slip"]').click();
  await expect(page.locator('#zhaowu-today-spirit-title')).toBeInViewport();
  await page.goto(home);
  await portals.locator('a[href="#birth-form"]').click();
  await expect(page.locator('#birth-form')).toBeVisible();
});
