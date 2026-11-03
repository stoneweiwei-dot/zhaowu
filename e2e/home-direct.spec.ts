import { test, expect } from '@playwright/test';

test('homepage entrances and scene at mobile and desktop sizes', async ({ page }) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    await page.goto('/?zw_entry=home', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-home-birth-entry]')).toBeVisible();
    await expect(page.locator('[data-home-card]')).toHaveCount(4);
    for (const card of await page.locator('[data-home-card]').all()) await expect(card.locator('.zw-entry')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await expect.poll(() => page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.querySelector('.zhaowu-home-sheet-shell')?.scrollHeight || 0))).toBeGreaterThan(1000);
    const colors = await page.locator('[data-home-card] .zw-entry').evaluateAll(cards => cards.map(c => ({ background: getComputedStyle(c).backgroundColor, text: getComputedStyle(c.querySelector('strong')!).webkitTextFillColor })));
    expect(colors[0].background).not.toBe(colors[1].background);
    expect(colors[1].text).not.toBe(colors[0].text);
    await page.screenshot({path:`test-results/home-${width}.png`});
    await page.locator('[data-home-card] .zw-entry').nth(1).scrollIntoViewIfNeeded();
    console.log('scroll state', await page.locator('[data-home-card] .zw-entry').nth(1).evaluate(el => { const out=[]; for(let n: Element | null=el;n;n=n.parentElement){const e=n as HTMLElement;out.push([e.tagName,e.className,e.scrollTop,e.scrollHeight,e.clientHeight,getComputedStyle(e).overflowY]);} return out; }));\n    await expect.poll(() => page.evaluate(() => Number(getComputedStyle(document.documentElement).getPropertyValue('--zw-veil')))).toBeGreaterThan(0.5);
    await page.screenshot({path:`test-results/guide-${width}.png`});
    await page.getByRole('button', { name: /開始免費排盤|开始免费排盘|Start my free chart/ }).first().click();
    await expect(page.locator('[data-home-card]')).toHaveCount(0);
  }
});
