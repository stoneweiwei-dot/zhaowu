import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { CUSTOMER_CHROME, translateCustomerChrome, translateChromeObject } from '../src/lib/customer-chrome.ts';
import { SITE_LOCALIZATION } from '../src/lib/site-localization.ts';

const languages = ['ja', 'ko', 'hi', 'th', 'id', 'vi', 'fil'];
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('every customer chrome phrase has seven distinct target-language translations', () => {
  assert.ok(Object.keys(CUSTOMER_CHROME).length >= 140);
  for (const [english, copy] of Object.entries(CUSTOMER_CHROME)) {
    assert.deepEqual(Object.keys(copy).sort(), [...languages].sort(), english);
    for (const language of languages) {
      assert.ok(copy[language].trim(), `${language}: ${english}`);
      assert.notEqual(copy[language], english, `${language}: ${english}`);
      assert.equal(translateCustomerChrome(language, english), copy[language]);
    }
  }
  for (const language of ['zh-Hant', 'zh-Hans', 'en']) {
    assert.equal(translateCustomerChrome(language, 'Home'), 'Home');
  }
});

test('all knowledge, history, member and fun-test inline chrome is covered', () => {
  for (const file of ['knowledge', 'history', 'member', 'fun-tests']) {
    const source = read(`src/routes/${file}.tsx`);
    const calls = [...source.matchAll(/(?:tr\(locale,|tx\()\s*"(?:[^"\\]|\\.)*"\s*,\s*"(?:[^"\\]|\\.)*"\s*,\s*("(?:[^"\\]|\\.)*")/g)];
    assert.ok(calls.length > 20, file);
    for (const call of calls) assert.ok(CUSTOMER_CHROME[JSON.parse(call[1])], `${file}: ${call[1]}`);
    assert.ok(source.includes('useDisplayLanguage'), file);
  }
});

test('all homepage strings and daily-colour page chrome are covered without translating URLs or functions', () => {
  const home = read('src/routes/index.tsx');
  for (const part of [home.split('if (locale === "en") {')[1].split('if (locale === "zh-Hans")')[0], home.split('function heroUiCopy')[1].split('if (locale === "zh-Hans")')[0]]) {
    for (const [, key, value] of part.matchAll(/(\w+):\s*"([^"\n]*)"/g)) {
      if (key === 'href') continue;
      assert.ok(CUSTOMER_CHROME[value], `homepage ${key}: ${value}`);
    }
  }
  const daily = read('src/lib/daily-colors.ts').split('export const DAILY_COLOR_PAGE = {')[1].split('  en: {')[1].split('\n  },')[0];
  for (const [, value] of daily.matchAll(/\w+:\s*"([^"\n]*)"/g)) assert.ok(CUSTOMER_CHROME[value], value);
  const fn = () => 'unchanged';
  const result = translateChromeObject('fil', { label: 'Home', nested: [{ href: '/knowledge', fn }] });
  assert.equal(result.label, CUSTOMER_CHROME.Home.fil);
  assert.equal(result.nested[0].href, '/knowledge');
  assert.equal(result.nested[0].fn, fn);
  assert.equal(translateCustomerChrome('fil', 'Untranslated article body'), 'Untranslated article body');
});

test('all ten navigation dictionaries share the same leaf shape', () => {
  const leaves = value => typeof value === 'string' ? 1 : Object.values(value).reduce((sum, item) => sum + leaves(item), 0);
  const base = leaves(SITE_LOCALIZATION.en);
  for (const copy of Object.values(SITE_LOCALIZATION)) assert.equal(leaves(copy), base);
});

test('article listing chrome translates independently of article body fallback', () => {
  const source = read('src/components/life-view-home-section.tsx');
  assert.ok(source.includes('translateChromeObject(language, baseCopy)'));
  const english = source.split('if (locale === "en") {')[1].split('if (locale === "zh-Hans")')[0];
  for (const [, value] of english.matchAll(/"([^"\n]+)"/g)) assert.ok(CUSTOMER_CHROME[value], value);
  for (const phrase of ['Articles are temporarily unavailable.', 'Loading articles…', 'Open original full-size image', 'views']) assert.ok(CUSTOMER_CHROME[phrase], phrase);
});

test('painted landing page and all four expandable homepage trees have target-language copy', () => {
  for (const name of ['painted-home', 'home-tree']) {
    const source = read(`src/components/${name}.tsx`);
    const calls = [...source.matchAll(/\bt\(\s*'(?:[^'\\]|\\.)*'\s*,\s*'(?:[^'\\]|\\.)*'\s*,\s*'((?:[^'\\]|\\.)*)'/g)];
    assert.ok(calls.length >= 10, name);
    for (const [, english] of calls) assert.ok(CUSTOMER_CHROME[english], english);
  }
  const source = read('src/components/daily-almanac-widget.tsx');
  const english = source.split('const baseLabels = locale === "en" ? {')[1].split('} :')[0];
  for (const [, value] of english.matchAll(/\w+: "([^"\n]+)"/g)) assert.ok(CUSTOMER_CHROME[value], value);
});
