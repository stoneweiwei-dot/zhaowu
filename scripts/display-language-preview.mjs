// Run explicitly after npm run build and npm run preview. No production calls or deployment.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const origin = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:4173';
const directory = 'docs/pr-screenshots/homepage-fixed-lang-switcher';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const evidence = [];
const chunkPattern = /\/assets\/(th|id|vi)-[^/]+\.js$/;
try {
  for (const width of [320, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, locale: 'en-AU', reducedMotion: 'reduce', serviceWorkers: 'block' });
    const page = await context.newPage();
    const requests = [];
    page.on('request', r => { if (chunkPattern.test(r.url())) requests.push(r.url().split('/').pop()); });
    console.log(`Checking ${width}px`);
    await page.goto(origin);
    const options = page.locator('[data-language-switcher] [role=radio]');
    await options.last().waitFor({ state: 'visible' });
    // At its first render the header must already be fixed, before any user scrolling.
    assert.equal(await page.locator('.zhaowu-site-header').evaluate(el => getComputedStyle(el).position), 'fixed');
    assert.deepEqual(requests, [], 'no new dictionary fetched for default English');
    await page.screenshot({ type: 'jpeg', quality: 82, path: `${directory}/home-${width}-top.jpg` });
    const boxes = await options.evaluateAll(nodes => nodes.map(el => {
      const r = el.getBoundingClientRect();
      return { text: el.textContent, x: r.x, y: r.y, width: r.width, height: r.height, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth };
    }));
    assert.equal(boxes.length, 9);
    for (const box of boxes) {
      assert.ok(box.height >= 44 && box.width >= 44, JSON.stringify(box));
      assert.ok(box.x >= 0 && box.x + box.width <= width, JSON.stringify(box));
      assert.ok(box.scrollWidth <= box.clientWidth, `clipped name: ${JSON.stringify(box)}`);
    }
    await page.evaluate(() => document.querySelector('[data-home-tree]')?.scrollIntoView({ block: 'center' }));
    await page.waitForFunction(() => Math.max(window.scrollY, document.querySelector('.zhaowu-home-sheet-shell')?.scrollTop || 0) > 100);
    await page.screenshot({ type: 'jpeg', quality: 82, path: `${directory}/home-${width}-scrolled.jpg` });
    const scrolled = await options.first().boundingBox();
    assert.ok(scrolled.y >= 0 && scrolled.y < 100);
    for (const [lang, name, text] of [['th', 'ไทย', 'ภาษา'], ['id', 'Bahasa Indonesia', 'Bahasa'], ['vi', 'Tiếng Việt', 'Ngôn ngữ']]) {
      console.log(`Selecting ${lang}`);
      await page.getByRole('radio', { name, exact: true }).click();
      await page.waitForFunction(lang => document.documentElement.lang === lang && localStorage.getItem('zhaowu.display-language') === lang, lang);
      // Wait for actual translated UI, not only the selector or document lang.
      await page.waitForFunction(async ({lang, text}) => {
        const chunk = performance.getEntriesByType('resource').find(r => new RegExp(`/assets/${lang}-.*\\.js$`).test(r.name));
        return !!chunk && document.querySelector('[data-language-switcher]')?.getAttribute('aria-label') === text;
      }, { lang, text });
      console.log(`Reloading ${lang}`);
      await page.reload();
      await page.getByRole('radio', { name, exact: true }).waitFor();
      await page.waitForFunction(text => document.querySelector('[data-language-switcher]')?.getAttribute('aria-label') === text, text);
      assert.equal(await page.getByRole('radio', { name, exact: true }).getAttribute('aria-checked'), 'true');
      assert.equal(await page.evaluate(() => localStorage.getItem('zhaowu.locale')), 'en');
    }
    // Existing languages still persist, with no language-payload changes needed for articles.
    for (const [lang, name] of [['ja', '日本語'], ['ko', '한국어'], ['hi', 'हिन्दी']]) {
      console.log(`Selecting ${lang}`);
      await page.getByRole('radio', { name, exact: true }).click();
      console.log(`Reloading ${lang}`);
      await page.reload();
      await page.getByRole('radio', { name, exact: true }).waitFor();
      assert.equal(await page.getByRole('radio', { name, exact: true }).getAttribute('aria-checked'), 'true');
      assert.equal(await page.evaluate(() => document.documentElement.lang), lang);
    }
    await page.getByRole('radio', { name: 'English', exact: true }).click();
    await page.goto(`${origin}/about`);
    await options.last().waitFor();
    assert.equal(await options.count(), 9);
    await page.screenshot({ type: 'jpeg', quality: 82, path: `${directory}/about-${width}.jpg` });
    evidence.push({ width, boxes, dictionaryRequests: requests, result: 'PASS: fixed header, nine readable 44px options, scroll, six-language persistence, inner page' });
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  let releaseThai;
  const thaiGate = new Promise(resolve => { releaseThai = resolve; });
  const requests = [];
  page.on('request', r => { if (chunkPattern.test(r.url())) requests.push(r.url()); });
  await page.route('**/assets/th-*.js', async route => { await thaiGate; await route.continue(); });
  await page.goto(origin);
  await page.getByRole('radio', { name: 'ไทย', exact: true }).click();
  await page.getByRole('radio', { name: 'English', exact: true }).click();
  releaseThai();
  await page.waitForResponse(response => /\/assets\/th-.*\.js$/.test(response.url()));
  // Let the delayed import execute, then assert it did not overwrite English.
  await page.waitForTimeout(200);
  assert.equal(await page.locator('[data-language-switcher]').getAttribute('aria-label'), 'Language');
  await page.getByRole('radio', { name: 'ไทย', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[data-language-switcher]')?.getAttribute('aria-label') === 'ภาษา');
  assert.equal(requests.length, 1, 'repeat Thai uses the cached module');
  evidence.push({ result: 'PASS: delayed import cannot overwrite a later selection; second selection uses cache', requests });
  await context.close();
  await writeFile(`${directory}/verification.json`, JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  await browser.close();
}
