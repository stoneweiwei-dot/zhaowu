import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const displayLanguagePath = resolve(root, "src/lib/display-language.ts");
const baziTypesPath = resolve(root, "src/lib/bazi/types.ts");
const displaySource = readFileSync(displayLanguagePath, "utf8");
const typeSource = readFileSync(baziTypesPath, "utf8");

test("JA/KO localization has no runtime model or translation network calls", () => {
  const forbidden = [
    [/\bfetch\s*\(/, "fetch()"],
    [/\bXMLHttpRequest\b/, "XMLHttpRequest"],
    [/\bWebSocket\s*\(/, "WebSocket"],
    [/\bopenai\b/i, "OpenAI"],
    [/\banthropic\b/i, "Anthropic"],
    [/\bgemini\b/i, "Gemini"],
    [/generativelanguage\.googleapis\.com/i, "Google Generative Language API"],
    [/api\.x\.ai/i, "xAI API"],
    [/\bgrok\b/i, "Grok"],
    [/chat\/completions/i, "chat/completions"],
    [/responses\.create/i, "responses.create"],
    [/translate\.googleapis\.com/i, "Google Translate API"],
    [/api\.deepl\.com/i, "DeepL API"],
  ];

  for (const [pattern, label] of forbidden) {
    assert.equal(pattern.test(displaySource), false, `display-language.ts must not use ${label}`);
  }
});

test("JA/KO remain display languages while the calculation locale contract stays isolated", () => {
  assert.match(displaySource, /DisplayLanguage\s*=\s*Locale\s*\|\s*"ja"\s*\|\s*"ko"/);
  assert.match(displaySource, /engineLocaleFor\(language:\s*DisplayLanguage\)/);
  assert.match(displaySource, /language === "zh-Hant" \|\| language === "zh-Hans" \? language : "en"/);
  assert.match(typeSource, /AppLocale\s*=\s*"zh-Hant"\s*\|\s*"zh-Hans"\s*\|\s*"en"/);
  assert.doesNotMatch(typeSource, /AppLocale[^;]*(?:"ja"|"ko")/);
});

test("JA/KO dictionaries are bundled static copy, not lazy runtime translation", () => {
  assert.match(displaySource, /const JA:\s*UiDictionary\s*=\s*\{/);
  assert.match(displaySource, /const KO:\s*UiDictionary\s*=\s*\{/);
  assert.match(displaySource, /JA\[key\]\s*\?\?\s*BASE_TRANSLATOR\(key\)/);
  assert.match(displaySource, /KO\[key\]\s*\?\?\s*BASE_TRANSLATOR\(key\)/);
});
