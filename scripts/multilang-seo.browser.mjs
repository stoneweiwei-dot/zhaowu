/** Local/Preview browser regression, deliberately independent of Safari/Production suites.
 * Usage: node scripts/multilang-seo.browser.mjs http://127.0.0.1:4174
 */
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const origin = process.argv[2] ?? 'http://127.0.0.1:4174';
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-AU' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/en/about?ref=seo#story`);
  await page.locator('.zw-langpick__toggle').waitFor();
  await page.evaluate(() => localStorage.setItem('zhaowu.display-language', 'fil'));
  await page.reload();
  await page.locator('.zw-langpick__toggle').waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  assert.match(await page.title(), /Discover ZHAOWU/);
  await page.locator('.zw-langpick__toggle').click();
  await page.locator('[data-lang="ja"]').click();
  await page.waitForURL('**/ja/about?ref=seo#story');
  await page.locator('.zw-langpick__toggle').waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'), 'ja');
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://zhao-wu.com/ja/about');
  assert.equal(await page.locator('link[hreflang]').count(), 11);
  // Actual TanStack Link navigation must keep the prefix and update runtime SEO.
  await page.locator('a[href="/ja/updates"]').first().click();
  await page.waitForURL('**/ja/updates');
  await page.waitForFunction(() => document.title.includes('更新履歴'));
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://zhao-wu.com/ja/updates');
  await page.goBack();
  await page.waitForURL('**/ja/about?ref=seo#story');
  assert.equal(await page.locator('html').getAttribute('lang'), 'ja');
  await page.locator('.zw-langpick__toggle').click();
  await page.locator('[data-lang="fil"]').click();
  await page.waitForURL('**/fil/about?ref=seo#story');
  await page.locator('.zw-langpick__toggle').waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'), 'fil');
  // Native journey/dock anchors are real prefixed hrefs (including new-tab behavior).
  await page.waitForFunction(() => [...document.querySelectorAll('.zw-journey-nav a')].every(a => new URL(a.href).pathname.startsWith('/fil')));
  const links = await page.locator('a[href]').evaluateAll(nodes => nodes.map(a => a.getAttribute('href')).filter(h => h.startsWith('/') && !h.startsWith('//')));
  assert.ok(links.length > 3);
  assert.ok(links.every(h => h.startsWith('/fil')), JSON.stringify(links));
  await page.goto(`${origin}/about`);
  await page.locator('.zw-langpick__toggle').waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'), 'zh-Hant');
  assert.equal(new URL(page.url()).pathname, '/about');
  assert.deepEqual(errors, []);
  console.log('PASS: URL overrides saved/browser choices; EN→JA→Filipino preserves query/hash; Link navigation, back, native anchors and canonical/hreflang update. Root stays zh-Hant. No page errors.');
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const prefix of ['', '/zh-hans', '/en', '/ja', '/ko', '/hi', '/th', '/id', '/vi', '/fil']) {
      await page.goto(`${origin}${prefix}/about`);
      await page.locator('.zw-langpick__toggle').click();
      const bounds = await page.locator('.zw-langpick__track').evaluate(el => {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right };
      });
      assert.ok(bounds.left >= 0 && bounds.right <= width, `${width}px ${prefix}: ${JSON.stringify(bounds)}`);
    }
  }
  console.log('PASS: all ten language menus stay within 320px and 390px viewports.');
  await context.close();
  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 844 } });
  const staticPage = await noJs.newPage();
  for (const prefix of ['', '/en']) for (const path of ['/sample-report', '/mythic-atlas', '/guaili-luanshen', '/knowledge/nine-heavens-lamps']) {
    await staticPage.goto(`${origin}${prefix}${path}`);
    assert.ok(await staticPage.locator('.zw-static-shell h1').isVisible());
    assert.ok(await staticPage.locator('[data-static-lead]').isVisible());
    assert.ok((await staticPage.locator('[data-static-summary]').innerText()).length > 240);
    assert.ok(await staticPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${prefix}${path} overflow`);
  }
  await noJs.close();
  console.log('PASS: all four static summaries visible at 320px without JavaScript in zh-Hant and English; no horizontal overflow.');
} finally { await browser.close(); }
