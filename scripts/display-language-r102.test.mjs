import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("global language selector exposes English, Traditional Chinese and Simplified Chinese while retaining dormant ja/ko/hi code", async () => {
  const layer = await source("src/lib/display-language.ts");
  const shell = await source("src/components/site-shell.tsx");
  assert.match(layer, /export type DisplayLanguage = Locale \| "ja" \| "ko" \| "hi"/);
  assert.match(layer, /const JA:/);
  assert.match(layer, /const KO:/);
  assert.match(layer, /const HI:/);
  assert.match(shell, /value: "en"[\s\S]*value: "zh-Hant"[\s\S]*value: "zh-Hans"/);
  assert.doesNotMatch(shell, /value: "ja" as const/);
  assert.doesNotMatch(shell, /value: "ko" as const/);
  assert.doesNotMatch(shell, /value: "hi" as const/);
  assert.match(shell, /label: "English"/);
  assert.match(shell, /label: "繁體"/);
  assert.match(shell, /label: "简体"/);
  assert.match(shell, /BrandIcon name="language"/);
  assert.match(shell, /setLanguage\(value\)/);
});

test("fresh public sessions default to Traditional Chinese, Simplified is a persisted choice, retired preferences fold to Traditional before hydration", async () => {
  const [indexHtml, layer] = await Promise.all([
    source("index.html"),
    source("src/lib/display-language.ts"),
  ]);
  assert.match(indexHtml, /<html lang="zh-Hant">/);
  assert.match(indexHtml, /\["zh-Hant", "zh-Hans", "en"\]/);
  assert.doesNotMatch(indexHtml, /\["zh-Hant", "en", "ko", "hi"\]/);
  assert.match(layer, /value === "zh-Hant" \|\| value === "zh-Hans" \|\| value === "en"/);
  assert.match(layer, /value === "ko" \|\| value === "hi" \|\| value === "ja"/);
  assert.match(indexHtml, /savedLanguage = "zh-Hant"/);
  assert.match(indexHtml, /localStorage\.setItem\("zhaowu\.display-language", savedLanguage\)/);
  assert.match(layer, /zhaowu\.display-language/);
});

test("withdrawn Japanese plus Korean and Hindi never alter the calculation locale", async () => {
  const layer = await source("src/lib/display-language.ts");
  assert.match(layer, /language === "zh-Hant" \|\| language === "zh-Hans" \? language : "en"/);
  assert.match(layer, /language === "hi"/);
  assert.match(layer, /return "hi-IN"/);
  assert.match(layer, /document\.documentElement\.lang = language/);
});
