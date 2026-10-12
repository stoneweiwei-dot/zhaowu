import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { SKINS } from '../src/lib/theme-skins';
import { analyzeLife } from '../src/lib/actions';
import type { AnalyzeInput } from '../src/lib/bazi/types';

// Synthetic data only; every service request is intercepted. No live owner
// setting, customer record, payment, cloud upload or AI request is touched.
const birth = {
  year: 1990, month: 6, day: 15, hour: 12, minute: 0, timeUnknown: false,
  gender: 'male', relation: 'unset', ziPolicy: 'midnight', useTrueSolar: true,
  city: { name: 'Sydney', display: 'Sydney', country: 'AU', timezone: 'Australia/Sydney', latitude: -33.87, longitude: 151.21 },
  liveCity: null,
} as const;

function alpha(colour: string) {
  if (colour === 'transparent') return 0;
  const values = colour.match(/[\d.]+/g)?.map(Number) ?? [];
  return colour.startsWith('rgba') ? values[3] : colour.startsWith('color(') ? Number(colour.split('/')[1]?.replace(')', '').trim() ?? 1) : 1;
}

async function metrics(page: Page, selectors: string[]) {
  return page.evaluate((selectors) => selectors.flatMap(selector => Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden').map(el => {
    const style = getComputedStyle(el), box = el.getBoundingClientRect();
    return { selector, text: el.textContent?.trim().slice(0, 55), bg: style.backgroundColor, color: style.color, shadow: style.boxShadow, outline: style.outlineStyle, height: box.height, width: box.width, left: box.left, right: box.right, border: style.borderTopWidth, font: style.fontFamily };
  })), selectors);
}

async function healthy(page: Page, label: string) {
  const sizes = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect.soft(sizes.scroll, `${label}: horizontal overflow`).toBeLessThanOrEqual(sizes.width + 1);
  const secondary = await metrics(page, ['.zw-journey-nav a:not([aria-current])', '.zw-journey-help', '.zhaowu-birth-edit', '.zw-subview-back-btn', '.zw-intro-replay']);
  for (const m of secondary) {
    expect.soft(alpha(m.bg), `${label}: ${m.selector} still has a pasted background`).toBe(0);
    expect.soft(m.shadow, `${label}: ${m.selector} has a floating shadow`).toBe('none');
    expect.soft(m.height, `${label}: ${m.selector} touch target`).toBeGreaterThanOrEqual(44);
  }
  const headings = await metrics(page, ['#zhaowu-customer-title', '.zhaowu-bazi-stage-head h2', '.zw-home-more-title', '.zw-subview-title', '.zhaowu-report-title', '.zhaowu-report-summary-block h4']);
  for (const m of headings) {
    expect.soft(alpha(m.bg), `${label}: ${m.selector} heading is a pasted panel`).toBe(0);
    expect.soft(m.shadow, `${label}: ${m.selector} heading shadow`).toBe('none');
  }
  // Measure computed foreground against the real opaque ancestor surface.
  // Image-backed labels without an opaque carrier need screenshot review;
  // never report a palette estimate as a browser-measured contrast pass.
  const contrasts = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d')!;
    const rgba = (value: string) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = value; ctx.fillRect(0, 0, 1, 1); return Array.from(ctx.getImageData(0, 0, 1, 1).data); };
    const over = (front: number[], back: number[]) => { const a = front[3] / 255, b = back[3] / 255, opacity = a + b * (1 - a); return [...front.slice(0, 3).map((v, i) => opacity ? (v * a + back[i] * b * (1 - a)) / opacity : 0), opacity * 255]; };
    const lum = (c: number[]) => c.slice(0, 3).map(v => { const n = v / 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    return Array.from(document.querySelectorAll<HTMLElement>('#zhaowu-customer-title, .zw-flow-progress button, .zw-flow-next, .zw-journey-nav a, .zw-journey-help, .zw-subview-back-btn, .zhaowu-report-title, .zhaowu-report-copy p, .stone-login-primary, #birth-year, .zhaowu-home-login-inline')).filter(el => el.getClientRects().length).map(el => {
      let bg = [0, 0, 0, 0], imageBacked = false;
      for (let node: HTMLElement | null = el; node && bg[3] < 254; node = node.parentElement) {
        const s = getComputedStyle(node);
        if (s.backgroundImage !== 'none') imageBacked = true;
        bg = over(bg, rgba(s.backgroundColor));
      }
      if (bg[3] < 254 || imageBacked) return { text: el.textContent?.trim().slice(0, 35), ratio: null, imageBacked: true };
      const fg = over(rgba(getComputedStyle(el).color), bg), a = lum(fg), b = lum(bg);
      return { text: el.textContent?.trim().slice(0, 35), ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05), imageBacked: false };
    });
  });
  for (const m of contrasts) if (m.ratio !== null) expect.soft(m.ratio, `${label}: ${m.text} computed text contrast`).toBeGreaterThanOrEqual(4.5);
  return { secondary, headings, contrasts };
}

for (const skin of SKINS) {
  test(`${skin.ref}. ${skin.id} — actual pages and states`, async ({ page, context }, info) => {
    const language = info.project.name.endsWith('-en') ? 'en' : 'zh-Hant';
    const evidence = `theme-results/screens/${info.project.name}/${skin.id}`;
    await mkdir(evidence, { recursive: true });
    let paid = false;
    let writes = 0;
    let themeWrites = 0;
    const routeStyles: Record<string, unknown> = {};
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      const json = (data: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', headers: {
        'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
        'access-control-allow-headers': 'authorization,apikey,content-type,prefer,x-client-info',
      }, body: JSON.stringify(data) });
      if (url.origin === 'http://127.0.0.1:4173' && !url.pathname.startsWith('/api/')) return route.continue();
      if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') return route.continue();
      if (request.method() !== 'GET' && request.method() !== 'OPTIONS') writes++;
      if (url.pathname === '/api/owner-data' && request.method() === 'POST') themeWrites++;
      if (request.method() === 'OPTIONS') return json({});
      if (url.pathname === '/api/owner-session') return json({ authenticated: false });
      if (url.pathname === '/api/owner-data' && url.searchParams.get('view') === 'site-skin') return json({ configured: true, skin: skin.id });
      if (url.pathname.endsWith('/stripe-checkout')) return json({ ok: true, paid, product: paid ? 'system' : undefined, system: 'bazi' });
      if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/auth/v1/')) return json([]);
      return json({ ok: false }, 503);
    });
    await page.addInitScript(({ language }) => {
      localStorage.setItem('zhaowu.display-language', language);
      localStorage.setItem('zhaowu.intro.seen-at.public.v2', String(Date.now()));
    }, { language });

    async function open(path: string, ready: string) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('html')).toHaveAttribute('data-zws', skin.id);
      await expect(page.locator('html')).toHaveAttribute('data-zws-mode', skin.mode);
      await expect(page.locator(ready).first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      routeStyles[path] = await healthy(page, path);
    }
    async function shot(name: string, selector?: string) {
      if (selector) await page.locator(selector).first().scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${evidence}/${name}.jpg`, type: 'jpeg', quality: 78, animations: 'disabled' });
    }

    await open('/', '#birth-form');
    await shot('home');
    const steps = page.locator('.zw-flow-progress button');
    await expect(steps).toHaveCount(3);
    await expect(steps.nth(1)).toBeDisabled();
    await steps.first().focus();
    expect(await steps.first().evaluate(el => getComputedStyle(el).outlineStyle), 'keyboard focus is visible').not.toBe('none');
    await shot('birth-form', '#birth-form');
    await page.locator('.zw-journey-help').click();
    await expect(page.locator('[data-utility-panel="guide"]')).toBeVisible();
    await shot('guide');
    await page.locator('[data-utility-panel="guide"]').getByRole('button', { name: language === 'en' ? 'Close' : '關閉', exact: true }).click();
    await open('/history', '.history-empty');
    await shot('history-empty');

    // Restored chart and question stage: keep the guest paid boundary intact.
    await page.evaluate(birth => localStorage.setItem('zhaowu.birth-record.v1', JSON.stringify(birth)), birth);
    await open('/', '#bazi');
    await expect(page.locator('[data-bazi-reading-locked]')).toBeVisible();
    await expect(page.locator('[data-unified-birth-report]')).toHaveCount(0);
    await page.locator('.zw-flow-next').click();
    await expect(page.locator('#analysis-question')).toBeVisible();
    await healthy(page, 'question stage');
    await shot('question', '#question-stage');

    // Render the actual paid report using a mock verified entitlement, without
    // buying anything or changing the application's access implementation.
    const question = language === 'en' ? 'How can I improve my work habits?' : '我如何改善工作習慣？';
    const result = await analyzeLife({ data: { ...birth, question, locale: language } as AnalyzeInput });
    paid = true;
    await page.evaluate(({ birth, result }) => {
      localStorage.setItem('zhaowu.report-history.v1', JSON.stringify([{ result, birth, savedAt: result.createdAt }]));
      localStorage.setItem('zhaowu.report-access-sessions.v1', JSON.stringify(['cs_test_themeacceptance1234567890']));
    }, { birth, result });
    await open(`/?report=${result.id}#report`, '.zhaowu-report-continuous-sheet');
    await shot('report', '.zhaowu-report-continuous-sheet');
    await page.locator('[data-unified-birth-report]').first().scrollIntoViewIfNeeded().catch(() => undefined);
    await healthy(page, 'paid report');

    await open('/#today', '#daily-almanac');
    await shot('today', '#daily-almanac');
    await open('/#quiz', '.zw-subview-title');
    await shot('quiz');
    await open('/history', '.zw-saved-report-card');
    await shot('history', '.zw-saved-report-card');
    await open('/login', '#zhaowu-main-content main');
    await shot('login');
    expect(errors, 'runtime exceptions').toEqual([]);
    expect(themeWrites, 'theme preview must never publish a live setting').toBe(0);
    // All writes were intercepted locally. Assert the public theme publisher
    // was never used just to inspect a skin.
    await info.attach('styles.json', { body: JSON.stringify({ skin: skin.id, language, mockedWrites: writes, themeWrites, routes: routeStyles }, null, 2), contentType: 'application/json' });
  });
}
