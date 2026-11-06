import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("global language selector exposes all nine native language options", async () => {
  const layer = await source("src/lib/display-language.ts");
  const shell = await source("src/components/site-shell.tsx");
  const switcher = await source("src/components/language-switcher.tsx");
  assert.match(layer, /export type DisplayLanguage = Locale \| "ja" \| "ko" \| "hi" \| "th" \| "id" \| "vi";/);
  assert.match(layer, /const JA:/);
  assert.match(layer, /const KO:/);
  assert.match(layer, /const HI:/);
  for (const value of ["en", "zh-Hant", "zh-Hans", "ja", "ko", "hi", "th", "id", "vi"]) assert.match(shell, new RegExp(`value: "${value}"`));
  assert.match(shell, /label: "English"/);
  assert.match(shell, /label: "繁體"/);
  assert.match(shell, /label: "简体"/);
  // 2026-10-16: the control is a labelled segmented radio group (44px targets), not three tiny buttons.
  assert.match(shell, /<LanguageSwitcher/);
  assert.match(shell, /onChange=\{setLanguage\}/);
  assert.match(switcher, /BrandIcon name="language"/);
  assert.match(switcher, /role="radiogroup"/);
  assert.match(switcher, /role="radio"/);
  assert.match(switcher, /useState\(false\)/);
  assert.match(switcher, /aria-expanded=\{open\}/);
  assert.match(switcher, /setOpen\(false\)/);
  assert.match(switcher, /pointerdown/);
  const css = await source("src/language-switcher.css");
  assert.match(css, /\.zw-langpick__track\[hidden\]/);
  assert.match(css, /data-lang="id"/);
  assert.match(css, /min-height: 44px/);
});

test("fresh public sessions default to English unless the browser reports Chinese (2026-10-15), all saved display languages survive hydration", async () => {
  const [indexHtml, layer] = await Promise.all([
    source("index.html"),
    source("src/lib/display-language.ts"),
  ]);
  assert.match(indexHtml, /<html lang="zh-Hant">/);
  assert.match(indexHtml, /\["zh-Hant", "zh-Hans", "en", "ja", "ko", "hi", "th", "id", "vi"\]/);
  assert.doesNotMatch(indexHtml, /\["zh-Hant", "en", "ko", "hi", "th", "id", "vi"\]/);
  assert.match(layer, /value === "zh-Hant" \|\| value === "zh-Hans" \|\| value === "en"/);
  // The pre-React bootstrap must not force Traditional or persist a default as if it were a choice.
  assert.match(indexHtml, /savedLanguage = "en"/);
  assert.match(indexHtml, /\/-cn\|-sg\|hans\/\.test\(tag\) \? "zh-Hans" : "zh-Hant"/);
  assert.doesNotMatch(indexHtml, /savedLanguage = "zh-Hant";\s*localStorage\.setItem/);
  assert.match(layer, /detectDefaultLocale/);
  assert.match(layer, /zhaowu\.display-language/);
});

test("Non-Chinese display languages never alter the calculation locale", async () => {
  const layer = await source("src/lib/display-language.ts");
  assert.match(layer, /language === "zh-Hant" \|\| language === "zh-Hans" \? language : "en"/);
  assert.match(layer, /language === "hi"/);
  assert.match(layer, /return "hi-IN"/);
  assert.match(layer, /document\.documentElement\.lang = language/);
});

test("Thai, Indonesian and Vietnamese are complete independent UI packs loaded only by import()", async () => {
  const layer = await source("src/lib/display-language.ts");
  const expected = [...layer.split("const JA:")[1].split("};")[0].matchAll(/^  (\w+):/gm)].map((m) => m[1]).sort();
  assert.equal(expected.length, 177);
  for (const language of ["th", "id", "vi"]) {
    const dictionary = await source(`src/lib/display-dictionaries/${language}.ts`);
    const keys = [...dictionary.matchAll(/^  (\w+):/gm)].map((m) => m[1]).sort();
    assert.deepEqual(keys, expected, `${language} matches existing UI coverage exactly`);
    assert.match(dictionary, /satisfies Partial<Record<CopyKey, string>>/);
    assert.ok(layer.includes(`() => import("@/lib/display-dictionaries/${language}")`));
    assert.doesNotMatch(layer, /import\s+(?!type)[^;]*from ["'][^"']*display-dictionaries/);
    assert.ok(layer.includes(`value === "${language}"`));
  }
  assert.match(layer, /activeLanguage === language/);
  assert.match(layer, /dictionaryRequests\[language\] \?\?=/);
  assert.match(layer, /dictionaryCache\[language\]/);
  assert.match(layer, /language === "th" \|\| language === "id" \|\| language === "vi"\) return en/);
  for (const tag of ["th-TH", "id-ID", "vi-VN"]) assert.ok(layer.includes(`return "${tag}"`));
});

test("specified JA, KO and HI terminology preserves the method and avoids English-only labels", async () => {
  const layer = await source("src/lib/display-language.ts");
  const ja = layer.split("const JA:")[1].split("};")[0];
  const ko = layer.split("const KO:")[1].split("};")[0];
  const hi = layer.split("const HI:")[1].split("};")[0];
  assert.match(ja, /chong: "沖"/);
  assert.match(ja, /sha: "煞の方位"/);
  assert.doesNotMatch(ko, /주판|신강·신약/);
  assert.match(ko, /faq1a: "[^"\n]*유일한 핵심 판단으로/);
  assert.match(ko, /proofPrimaryTitle: "자평을 핵심 판단으로"/);
  for (const key of ["wuxing", "strength"]) assert.ok(ko.includes(`${key}: "왕쇠의 기초"`));
  assert.match(hi, /sha: "अशुभ दिशा"/);
  assert.match(hi, /faq1a: "[^"\n]*पूर्वजन्म[^"\n]*छह लोकों[^"\n]*達摩一掌經[^"\n]*AI की अटकलें नहीं/);
  assert.doesNotMatch(hi, /Zi-hour|not connected|dayMaster: "Day Master"|nayin: "Na Yin"|shishen: "Ten Gods"|\(Void\)/);
});
