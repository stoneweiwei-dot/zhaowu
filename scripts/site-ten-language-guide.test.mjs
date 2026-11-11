import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import { test } from "node:test";
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("Shared navigation, guide and journey use ten-language display state", () => {
  const copy = read("src/lib/site-localization.ts");
  const keys = [...copy.matchAll(/^  "?(zh-Hant|zh-Hans|en|ja|ko|hi|th|id|vi|fil)"?: \{/gm)].map((x) => x[1]);
  assert.deepEqual(keys.sort(), ["zh-Hant", "zh-Hans", "en", "ja", "ko", "hi", "th", "id", "vi", "fil"].sort());
  for (const path of ["src/components/site-utility-dock.tsx", "src/components/journey-navigation.tsx"]) {
    const code = read(path);
    assert.ok(code.includes("useDisplayLanguage"), path);
    assert.ok(code.includes("SITE_LOCALIZATION[language]"), path);
    assert.ok(!code.includes("useI18n()"), path);
  }
  for (const path of ["src/lib/site-guide.ts", "src/lib/site-journey.ts"]) {
    const code = read(path);
    assert.ok(code.includes("SITE_LOCALIZATION"), path);
  }
});

test("Ten-language guidance provides complete static strings without script contamination", () => {
  const source = read("src/lib/site-localization.ts");
  const marker = "export const SITE_LOCALIZATION: Record<DisplayLanguage, SiteLocalizedCopy> = ";
  const content = source.split(marker)[1];
  assert.ok(content);
  const table = JSON.parse(content.replace(/;\s*$/, ""));
  const languages = ["zh-Hant", "zh-Hans", "en", "ja", "ko", "hi", "th", "id", "vi", "fil"];
  assert.deepEqual(Object.keys(table).sort(), [...languages].sort());
  for (const language of languages) {
    const item = table[language];
    for (const key of ["navigation", "utility", "advanced", "journey", "guide"]) assert.ok(item[key], language + " " + key);
    for (const section of ["navigation", "utility", "advanced"]) {
      assert.ok(Object.values(item[section]).length > 0);
      for (const value of Object.values(item[section])) assert.ok(typeof value === "string" && value.trim(), language + " " + section);
    }
    assert.equal(item.journey.steps.length, 3, language);
    assert.equal(item.journey.hints.length, 3, language);
    for (const line of [...item.journey.steps, ...item.journey.hints]) assert.ok(line.trim(), language + " journey");
    for (const category of ["analysis", "history", "account", "login", "home"]) {
      assert.equal(item.guide[category].length, 2, language + " " + category);
      for (const phrase of item.guide[category]) assert.ok(phrase.trim(), language + " " + category);
    }
  }
  assert.doesNotMatch(JSON.stringify(table.hi), /[가-힣]/u, "Hindi must not contain Hangul");
  assert.doesNotMatch(JSON.stringify(table.ko), /[\u0900-\u097F]/u, "Korean must not contain Devanagari");
});
