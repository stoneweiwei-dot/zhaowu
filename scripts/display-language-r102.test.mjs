import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("global language selector exposes English, Traditional Chinese and Simplified Chinese while retaining dormant ja/ko/hi code", async () => {
  const layer = await source("src/lib/display-language.ts");
  const shell = await source("src/components/site-shell.tsx");
  const switcher = await source("src/components/language-switcher.tsx");
  assert.match(layer, /export type DisplayLanguage = Locale \| "ja" \| "ko" \| "hi"/);
  assert.match(layer, /const JA:/);
  assert.match(layer, /const KO:/);
  assert.match(layer, /const HI:/);
  for (const value of ["en", "zh-Hant", "zh-Hans"]) assert.match(shell, new RegExp(`value: "${value}"`));
  assert.doesNotMatch(shell, /value: "ja"/);
  assert.doesNotMatch(shell, /value: "ko"/);
  assert.doesNotMatch(shell, /value: "hi"/);
  assert.match(shell, /label: "English"/);
  assert.match(shell, /label: "繁體"/);
  assert.match(shell, /label: "简体"/);
  // 2026-10-16: the control is a labelled segmented radio group (44px targets), not three tiny buttons.
  assert.match(shell, /<LanguageSwitcher/);
  assert.match(shell, /onChange=\{setLanguage\}/);
  assert.match(switcher, /BrandIcon name="language"/);
  assert.match(switcher, /role="radiogroup"/);
  assert.match(switcher, /role="radio"/);
});

test("fresh public sessions default to English unless the browser reports Chinese (2026-10-15), retired preferences fold before hydration", async () => {
  const [indexHtml, layer] = await Promise.all([
    source("index.html"),
    source("src/lib/display-language.ts"),
  ]);
  assert.match(indexHtml, /<html lang="zh-Hant">/);
  assert.match(indexHtml, /\["zh-Hant", "zh-Hans", "en"\]/);
  assert.doesNotMatch(indexHtml, /\["zh-Hant", "en", "ko", "hi"\]/);
  assert.match(layer, /value === "zh-Hant" \|\| value === "zh-Hans" \|\| value === "en"/);
  assert.match(layer, /value === "ko" \|\| value === "hi" \|\| value === "ja"/);
  // The pre-React bootstrap must not force Traditional or persist a default as if it were a choice.
  assert.match(indexHtml, /savedLanguage = "en"/);
  assert.match(indexHtml, /\/-cn\|-sg\|hans\/\.test\(tag\) \? "zh-Hans" : "zh-Hant"/);
  assert.doesNotMatch(indexHtml, /savedLanguage = "zh-Hant";\s*localStorage\.setItem/);
  assert.match(layer, /detectDefaultLocale/);
  assert.match(layer, /zhaowu\.display-language/);
});

test("withdrawn Japanese plus Korean and Hindi never alter the calculation locale", async () => {
  const layer = await source("src/lib/display-language.ts");
  assert.match(layer, /language === "zh-Hant" \|\| language === "zh-Hans" \? language : "en"/);
  assert.match(layer, /language === "hi"/);
  assert.match(layer, /return "hi-IN"/);
  assert.match(layer, /document\.documentElement\.lang = language/);
});
