import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { calendarDate, createChartContext, dateLabel, isoDate, nextSydneyMidnight, orbitalDayOffset, sydneyDate, translate } from '../public/sky-universe/chart-context.js';

test('Sydney dates do not follow the visitor device timezone', () => {
  const original = process.env.TZ;
  try {
    for (const zone of ['UTC', 'America/Los_Angeles', 'Pacific/Honolulu', 'Asia/Tokyo']) {
      process.env.TZ = zone;
      assert.equal(sydneyDate(new Date('2026-11-12T12:59:59.999Z')), '2026-11-12');
      assert.equal(sydneyDate(new Date('2026-11-12T13:00:00Z')), '2026-11-13');
      assert.equal(dateLabel(calendarDate('2026-11-12'), 'en'), '12 November 2026');
    }
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});

test('the next Sydney midnight spans the 25-hour and 23-hour DST days', () => {
  for (const [start, end, hours] of [
    ['2026-04-04T13:00:00Z', '2026-04-05T14:00:00Z', 25],
    ['2026-10-03T14:00:00Z', '2026-10-04T13:00:00Z', 23],
    ['2026-07-01T14:00:00Z', '2026-07-02T14:00:00Z', 24],
  ]) {
    const next = nextSydneyMidnight(new Date(start));
    assert.equal(new Date(next).toISOString(), new Date(end).toISOString());
    assert.equal(next - Date.parse(start), hours * 3_600_000);
  }
});

test('date-slider offsets preserve calendar days through DST and month boundaries', () => {
  assert.equal(isoDate(calendarDate('2026-10-04', -1)), '2026-10-03');
  assert.equal(isoDate(calendarDate('2026-04-05', 1)), '2026-04-06');
  assert.equal(isoDate(calendarDate('2026-12-31', 1)), '2027-01-01');
  assert.equal(orbitalDayOffset('2026-11-11'), 0);
  assert.equal(orbitalDayOffset('2026-11-12'), 1);
  assert.equal(orbitalDayOffset('2026-11-13', -2), 0);
});

test('an open tab refreshes at midnight, on return, and before Today resets the slider', (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: new Date('2026-11-12T12:59:59.900Z') });
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const target = new EventTarget();
  target.setTimeout = (...args) => setTimeout(...args);
  target.clearTimeout = (timer) => clearTimeout(timer);
  globalThis.window = target;
  globalThis.document = new EventTarget();
  const changes = [];
  let cleanup;
  const React = {
    useState: (initial) => [initial(), (next) => changes.push(next)],
    useEffect: (effect) => { cleanup = effect(); },
  };
  try {
    const context = createChartContext('en');
    assert.equal(context.useToday(React), '2026-11-12');
    t.mock.timers.tick(100);
    assert.equal(changes.at(-1), '2026-11-13');
    t.mock.timers.setTime(new Date('2026-11-15T02:00:00Z').getTime());
    target.dispatchEvent(new Event('focus'));
    assert.equal(changes.at(-1), '2026-11-15');
    t.mock.timers.setTime(new Date('2026-11-16T02:00:00Z').getTime());
    document.dispatchEvent(new Event('visibilitychange'));
    assert.equal(changes.at(-1), '2026-11-16');
    let selectedOffset = 8;
    t.mock.timers.setTime(new Date('2026-11-17T02:00:00Z').getTime());
    const todayButton = context.elementProps({ children: '回到今天', onClick: () => { selectedOffset = 0; } });
    todayButton.onClick();
    assert.equal(selectedOffset, 0);
    assert.equal(changes.at(-1), '2026-11-17');
    assert.equal(todayButton.children, 'Today');
    cleanup();
    const count = changes.length;
    target.dispatchEvent(new Event('pageshow'));
    t.mock.timers.tick(86_400_000);
    assert.equal(changes.length, count);
  } finally {
    cleanup?.();
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
  }
});

test('all original chart labels and accessible controls have independent English text', async () => {
  const artwork = await readFile(new URL('../public/sky-universe/chart-artwork.js', import.meta.url), 'utf8');
  const labels = [...artwork.matchAll(/"([^"\r\n]*[\u3400-\u9fff][^"\r\n]*)"/g)].map((match) => match[1]);
  assert.ok(labels.length > 100);
  for (const label of labels) assert.doesNotMatch(translate(label, 'en'), /[\u3400-\u9fff]/, label);
  for (const [language, expected] of [['zh-Hant', '回到今天'], ['zh-Hans', '回到今天'], ['en', 'Today']]) {
    const context = createChartContext(language);
    assert.equal(context.elementProps({ children: '回到今天', 'aria-label': '太陽透明度' }).children, expected);
    assert.equal(context.locale, language);
  }
  assert.equal(createChartContext('unknown').locale, 'zh-Hant');
  assert.equal(translate('時間軸 前後 30 天', 'zh-Hans'), '时间轴 前后 30 天');
});

test('all chart textures are real self-hosted WebP files', async () => {
  const artwork = await readFile(new URL('../public/sky-universe/chart-artwork.js', import.meta.url), 'utf8');
  const textures = new Set([...artwork.matchAll(/"(\/sky-universe\/meta-texture-\d+\.webp)"/g)].map((match) => match[1]));
  assert.equal(textures.size, 12);
  for (const path of textures) {
    const bytes = await readFile(new URL(`../public${path}`, import.meta.url));
    assert.equal(bytes.subarray(0, 4).toString(), 'RIFF', path);
    assert.equal(bytes.subarray(8, 12).toString(), 'WEBP', path);
  }
  assert.doesNotMatch(artwork, /(?:https?:)?\/\/(?:www\.)?(?:meta\.ai|images\.pexels\.com|cdn\.)/);
});

test('bootstrap reports ready only after a working canvas mounts, and reports failed loads', async () => {
  const source = (await readFile(new URL('../public/sky-universe/chart-bootstrap.js', import.meta.url), 'utf8')).replace(/^import [^\n]+\n/, '');
  function boot() {
    const reports = [];
    let script;
    let canvas = null;
    let observe;
    const root = {};
    const window = {
      location: { search: '?lang=en', origin: 'https://zhao-wu.com' },
      setTimeout: () => 1, clearTimeout: () => {}, addEventListener: () => {},
      parent: { postMessage: (...args) => reports.push(args) },
    };
    const document = {
      documentElement: {}, title: '', getElementById: () => root,
      createElement: () => ({}), head: { appendChild: (value) => { script = value; } },
      querySelector: () => canvas,
    };
    vm.runInNewContext(source, {
      createChartContext, window, document, URLSearchParams,
      MutationObserver: class { constructor(callback) { observe = callback; } observe() {} disconnect() {} },
    });
    return { reports, script, mount: (working) => { canvas = { getContext: () => working ? {} : null }; observe(); } };
  }
  const ready = boot();
  ready.script.onload();
  assert.equal(ready.reports.length, 0);
  ready.mount(true);
  assert.equal(ready.reports[0][0].type, 'zhaowu:sky-chart-ready');
  assert.equal(ready.reports[0][1], 'https://zhao-wu.com');
  const missing = boot();
  missing.script.onerror();
  assert.equal(missing.reports[0][0].type, 'zhaowu:sky-chart-failed');
  const noCanvas = boot();
  noCanvas.mount(false);
  assert.equal(noCanvas.reports[0][0].type, 'zhaowu:sky-chart-failed');
});
