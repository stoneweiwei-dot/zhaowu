import { test, expect } from '@playwright/test';

test('homepage entrances and scene at mobile and desktop sizes', async ({ page }) => {
  test.setTimeout(120000);
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
      badge: getComputedStyle(c.querySelector('.ph-cell-badge')!).backgroundColor,
      title: c.querySelector('strong')!.textContent?.trim(),
      top: c.getBoundingClientRect().top,
      width: c.getBoundingClientRect().width,
      height: c.getBoundingClientRect().height,
    })));
    expect(new Set(cards.map(c => c.background)).size).toBe(1);
    expect(new Set(cards.map(c => c.text)).size).toBe(1);
    expect(new Set(cards.map(c => c.badge)).size).toBe(4);
    expect(new Set(cards.map(c => c.title)).size).toBe(4);
    expect(new Set(cards.map(c => c.top)).size).toBe(width === 320 ? 2 : 1);
    for (const cell of cards) {
      expect(cell.width).toBeGreaterThanOrEqual(44);
      expect(cell.height).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({path:`test-results/home-${width}.png`});
    await page.locator('[data-home-card] .zw-entry').nth(1).scrollIntoViewIfNeeded();
    console.log('scroll state', await page.locator('[data-home-card] .zw-entry').nth(1).evaluate(el => { const out=[]; for(let n: Element | null=el;n;n=n.parentElement){const e=n as HTMLElement;out.push([e.tagName,e.className,e.scrollTop,e.scrollHeight,e.clientHeight,getComputedStyle(e).overflowY]);} return out; }));
    await expect.poll(() => page.evaluate(() => Number(getComputedStyle(document.documentElement).getPropertyValue('--zw-veil')))).toBeGreaterThan(0.15);
    await expect.poll(() => page.evaluate(() => Number(getComputedStyle(document.documentElement).getPropertyValue('--zw-veil')))).toBeLessThanOrEqual(0.46);
    await page.screenshot({path:`test-results/guide-${width}.png`});
    const flow = page.locator('[data-home-card="wuxing"]');
    const homeUrl = page.url();
    await flow.locator('.zw-entry').click();
    await expect(page).toHaveURL(homeUrl);
    const panel = flow.locator('#ph-tree-panel-wuxing');
    await expect(flow.locator('.zw-entry')).toHaveAttribute('aria-controls', 'ph-tree-panel-wuxing');
    await expect(panel).toBeVisible();
    expect(await panel.evaluate(el => {
      const grid = el.closest('.ph-grid')!;
      const bounds = grid.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      return Math.abs(rect.width - bounds.width) < 1 &&
        [...grid.querySelectorAll('.ph-cell')].every(cell => cell.getBoundingClientRect().bottom <= rect.top);
    })).toBe(true);
    await expect(flow.locator('a[href*="sky-events"]')).toBeVisible();
    await expect(flow.locator('a[href*="daily-colors"]')).toBeVisible();
    await flow.locator('[aria-controls="ph-tree-branch-element-lore"]').click();
    await expect(flow.locator('a[href*="tea-guardian"]')).toBeVisible();
    for (const target of await flow.locator('button:visible, a:visible').all()) {
      const box = await target.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.locator('[data-home-card="notes"] .zw-entry').click();
    const notes = page.locator('#ph-tree-panel-notes');
    await notes.locator('[aria-controls="ph-tree-branch-galleries"]').click();
    await expect(notes.locator('#ph-tree-branch-galleries a[href$="/bajinggong"]')).toBeVisible();
    await expect(page.locator('section.zw-bajinggong-feature')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    for (const section of ['form', 'wuxing', 'quiz', 'notes']) {
      const card = page.locator('[data-home-card="' + section + '"]');
      if (await card.getAttribute('data-open') !== 'true') await card.locator('.zw-entry').click();
      for (const toggle of await card.locator('.ph-tree-branch-tile').all()) {
        if (await toggle.getAttribute('aria-expanded') === 'false') await toggle.click();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
      for (const leaf of await card.locator('.ph-tree-branch > ul a, .ph-tree-branch > ul button').all()) {
        await expect(leaf).toBeVisible();
        const bounds = await leaf.boundingBox();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
      }
    }
    await page.locator('[data-home-card="form"] .zw-entry').click();
    await expect(page.locator('[data-home-card="form"]')).toHaveAttribute('data-open', 'true');
    await expect(panel).toBeHidden();
    await expect(page.locator('[data-home-card][data-open="true"]')).toHaveCount(1);
    await page.locator('#ph-tree-panel-form').getByRole('button', { name: /開始免費排盤|开始免费排盘|Start my free chart/ }).click();
    await expect(page.locator('[data-home-card]')).toHaveCount(0);
  }
});

test('homepage supports all three languages', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/?zw_entry=home', {waitUntil:'networkidle'});
  const toggle = page.locator('.zw-langpick__toggle');
  for (const [language, title, flowTitle, galleryTitle, paintingTitle] of [
    ['繁體中文', '我的命盤', '五行流轉', '看畫集', '八景宮 · 九景圖志'],
    ['简体中文', '我的命盘', '五行流转', '看画集', '八景宫 · 九景图志'],
    ['English', 'My chart', 'Five Elements Flow', 'View galleries', 'Nine Visions of Bajinggong'],
  ]) {
    await expect(page.locator('[data-language-switcher]')).toHaveAttribute('data-open', 'false');
    await toggle.click();
    await expect(page.locator('[data-language-switcher]')).toHaveAttribute('data-open', 'true');
    await page.getByRole('radio', {name:language, exact:true}).click();
    await expect(page.locator('[data-language-switcher]')).toHaveAttribute('data-open', 'false');
    await expect(page.locator('[data-home-card="form"] .zw-entry strong')).toHaveText(title);
    await expect(page.locator('[data-home-card="wuxing"] .zw-entry strong')).toHaveText(flowTitle);
    const notes = page.locator('[data-home-card="notes"]');
    if (await notes.getAttribute('data-open') === 'false') await notes.locator('.zw-entry').click();
    const galleries = notes.locator('[aria-controls="ph-tree-branch-galleries"]');
    await expect(galleries.locator('strong')).toHaveText(galleryTitle);
    if (await galleries.getAttribute('aria-expanded') === 'false') await galleries.click();
    await expect(notes.locator('a[href$="/bajinggong"] strong')).toHaveText(paintingTitle);
    for (const title of await page.locator('.ph-cell strong').all()) {
      expect(await title.evaluate(el => {
        const box = el.getBoundingClientRect();
        const cell = el.closest('button')!.getBoundingClientRect();
        return box.height <= 2 * parseFloat(getComputedStyle(el).lineHeight) + 1 &&
          box.left >= cell.left && box.right <= cell.right;
      })).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
});
