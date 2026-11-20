import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { detectBrowserLanguage, detectDefaultLocale, useI18n } from '../src/lib/i18n.ts';
import { hydrateDisplayLanguage, useDisplayLanguage } from '../src/lib/display-language.ts';
import { LANGUAGES, languagePath } from '../src/lib/language-routing.js';
import dictionary from '../src/lib/display-dictionaries/fil.ts';

const storage = new Map();
const location = { pathname: '/', href: 'https://example.test/', assign(href) { this.href = href; this.pathname = new URL(href).pathname; } };
Object.defineProperty(globalThis, 'window', { configurable: true, value: {
  location, localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) },
}});
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const bootstrap = html.match(/<script>\s*(\(function \(\) \{\s*try \{\s*\/\/ URL language[\s\S]*?)<\/script>/)[1];
function browser(languages, language = languages[0] ?? 'tl-PH') {
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { languages, language } });
}
test('browser detector remains available for a future opt-in hint, without changing URLs', () => {
  for (const [tags, expected] of [
    [['zh-Hans-HK'], 'zh-Hans'], [['zh-Hant-CN'], 'zh-Hant'], [['zh-TW'], 'zh-Hant'], [['zh-HK'], 'zh-Hant'],
    [['zh-CN'], 'zh-Hans'], [['zh'], 'zh-Hans'], [['zh-Hans'], 'zh-Hans'], [['zh-Hant'], 'zh-Hant'],
    ...['ja', 'ko', 'hi', 'th', 'id', 'vi'].map(tag => [[tag + '-XX', 'en'], tag]),
    [['tl-PH'], 'fil'], [['zh-SG'], 'zh-Hans'], [['fil-PH', 'zh-TW'], 'fil'], [['TL', 'en'], 'fil'],
    [['en-AU', 'zh-CN'], 'en'], [['fr', 'tl-PH'], 'fil'], [['zh-HK', 'fil'], 'zh-Hant'], [['fr', 'de'], 'en'],
    [['FIL', 'zh-CN'], 'fil'], [['filipino', 'zhuang'], 'en'], [[], 'fil'],
  ]) {
    browser(tags);
    assert.equal(detectBrowserLanguage(), expected);
    assert.equal(detectDefaultLocale(), expected.startsWith('zh-') ? expected : 'en');
  }
});
test('all URL languages beat saved choices and browser preferences in bootstrap and hydration', () => {
  browser(['en-AU']);
  for (const language of LANGUAGES) {
    location.pathname = languagePath('/about', language);
    location.href = `https://example.test${location.pathname}`;
    storage.clear(); storage.set('zhaowu.display-language', 'ko'); storage.set('zhaowu.locale', 'zh-Hans');
    hydrateDisplayLanguage();
    assert.equal(useDisplayLanguage.getState().language, language);
    assert.equal(useI18n.getState().locale, language.startsWith('zh-') ? language : 'en');
    const document = { documentElement: {}, querySelector: () => null };
    runInNewContext(bootstrap, { window, navigator, localStorage: window.localStorage, document });
    assert.equal(document.documentElement.lang, language);
    assert.equal(storage.get('zhaowu.display-language'), 'ko', 'automatic URL hydration must not persist a manual choice');
  }
});
test('manual URL switch preserves exact search and hash and Filipino dictionary loads', async () => {
  location.href = 'https://example.test/ja/about?x=a%20b&x=2#birth-form';
  location.pathname = '/ja/about';
  useDisplayLanguage.getState().setLanguage('fil');
  assert.equal(location.href, 'https://example.test/fil/about?x=a%20b&x=2#birth-form');
  assert.equal(storage.get('zhaowu.display-language'), 'fil');
  hydrateDisplayLanguage();
  await new Promise(resolve => setTimeout(resolve, 50));
  for (const [key, value] of Object.entries(dictionary)) assert.equal(useI18n.getState().t(key), value);
});
test('URL language works when localStorage is denied', () => {
  location.pathname = '/ko/about';
  location.href = 'https://example.test/ko/about';
  const original = window.localStorage;
  window.localStorage = { getItem() { throw Error('denied'); }, setItem() { throw Error('denied'); } };
  try {
    hydrateDisplayLanguage();
    assert.equal(useDisplayLanguage.getState().language, 'ko');
    const document = { documentElement: {}, querySelector: () => null };
    runInNewContext(bootstrap, { window, navigator, localStorage: window.localStorage, document });
    assert.equal(document.documentElement.lang, 'ko');
    useDisplayLanguage.getState().setLanguage('zh-Hans');
    assert.equal(location.pathname, '/zh-hans/about');
  } finally { window.localStorage = original; }
});
