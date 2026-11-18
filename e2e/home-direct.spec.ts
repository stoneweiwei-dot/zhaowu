import { test, expect } from '@playwright/test';

test('homepage entrances and scene at mobile and desktop sizes', async ({ page }) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    await page.goto('/?zw_entry=home', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-home-birth-entry]')).toBeVisible();
    await expect(page.locator('[data-home-card]')).toHaveCount(4);
    for (const card of await page.locator('[data-home-card]').all()) {
      await expect(card).toHaveAttribute('data-open', 'false');
      await expect(card.locator('.zw-entry')).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await expect.poll(() => page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.querySelector('.zhaowu-home-sheet-shell')?.scrollHeight || 0))).toBeGreaterThan(1000);
    const cards = await page.locator('[data-home-card] .zw-entry').evaluateAll(entries => entries.map(c => ({
      background: getComputedStyle(c).backgroundColor,
      text: getComputedStyle(c.querySelector('strong')!).webkitTextFillColor,
      wash: getComputedStyle(c.querySelector('.ph-tree-wash')!).backgroundImage,
      title: c.querySelector('strong')!.textContent?.trim(),
    })));
    expect(new Set(cards.map(c => c.background)).size).toBe(1);
    expect(new Set(cards.map(c => c.text)).size).toBe(1);
    expect(new Set(cards.map(c => c.wash)).size).toBe(4);
    expect(new Set(cards.map(c => c.title)).size).toBe(4);
    await page.screenshot({path:`test-results/home-${width}.png`});
    await page.locator('[data-home-card] .zw-entry').nth(1).scrollIntoViewIfNeeded();
    console.log('scroll state', await page.locator('[data-home-card] .zw-entry').nth(1).evaluate(el => { const out=[]; for(let n: Element | null=el;n;n=n.parentElement){const e=n as HTMLElement;out.push([e.tagName,e.className,e.scrollTop,e.scrollHeight,e.clientHeight,getComputedStyle(e).overflowY]);} return out; }));
    await expect.poll(() => page.evaluate(() => Number(getComputedStyle(document.documentElement).getPropertyValue('--zw-veil')))).toBeGreaterThan(0.15);
    await expect.poll(() => page.evaluate(() => Number(getComputedStyle(document.documentElement).getPropertyValue('--zw-veil')))).toBeLessThanOrEqual(0.46);
    await page.screenshot({path:`test-results/guide-${width}.png`});
    await page.getByRole('button', { name: /開始免費排盤|开始免费排盘|Start my free chart/ }).first().click();
    await expect(page.locator('[data-home-card]')).toHaveCount(0);
  }
});

test('homepage supports all three languages', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/?zw_entry=home', {waitUntil:'networkidle'});
  const toggle = page.locator('.zw-langpick__toggle');
  for (const [language, title] of [['繁體中文', '我的命盤'], ['简体中文', '我的命盘'], ['English', 'My chart']]) {
    await expect(page.locator('[data-language-switcher]')).toHaveAttribute('data-open', 'false');
    await toggle.click();
    await expect(page.locator('[data-language-switcher]')).toHaveAttribute('data-open', 'true');
    await page.getByRole('radio', {name:language, exact:true}).click();
    await expect(page.locator('[data-language-switcher]')).toHaveAttribute('data-open', 'false');
    await expect(page.locator('[data-home-card="form"] .zw-entry strong')).toHaveText(title);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
});
