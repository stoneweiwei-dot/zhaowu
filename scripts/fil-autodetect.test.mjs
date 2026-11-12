import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { detectBrowserLanguage, detectDefaultLocale, useI18n } from "../src/lib/i18n.ts";
import { hydrateDisplayLanguage, useDisplayLanguage } from "../src/lib/display-language.ts";
import dictionary from "../src/lib/display-dictionaries/fil.ts";

const storage = new Map();
Object.defineProperty(globalThis, "window", { configurable: true, value: {
  localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) },
}});
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const bootstrap = html.match(/<script>\s*(\(function \(\) \{\s*try \{\s*var savedLanguage[\s\S]*?)<\/script>/)[1];
function browser(languages, language = languages[0] ?? "tl-PH") {
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { languages, language } });
}
test("ordered browser preferences match the early HTML bootstrap", () => {
  for (const [tags, expected] of [
    [["zh-Hans-HK"], "zh-Hans"], [["zh-Hant-CN"], "zh-Hant"], [["zh-TW"], "zh-Hant"], [["zh-HK"], "zh-Hant"],
    [["zh-CN"], "zh-Hans"], [["zh"], "zh-Hans"], [["zh-Hans"], "zh-Hans"], [["zh-Hant"], "zh-Hant"],
    ...["ja", "ko", "hi", "th", "id", "vi"].map(tag => [[tag + "-XX", "en"], tag]),
    [["tl-PH"], "fil"], [["zh-SG"], "zh-Hans"],
    [["fil-PH", "zh-TW"], "fil"], [["TL", "en"], "fil"],
    [["en-AU", "zh-CN"], "en"], [["fr", "tl-PH"], "fil"],
    [["zh-HK", "fil"], "zh-Hant"], [["fr", "de"], "en"],
    [["FIL", "zh-CN"], "fil"], [["filipino", "zhuang"], "en"],
    [[], "fil"],
  ]) {
    storage.clear(); browser(tags);
    assert.equal(detectBrowserLanguage(), expected);
    const document = { documentElement: {}, querySelector: () => null };
    runInNewContext(bootstrap, { navigator, localStorage: window.localStorage, document });
    assert.equal(document.documentElement.lang, expected, tags.join(","));
    assert.equal(storage.size, 0);
    assert.equal(detectDefaultLocale(), expected.startsWith("zh-") ? expected : "en");
  }
});
test("detected defaults remain automatic; manual choices persist through hydration", async () => {
  storage.clear(); browser(["fil-PH"]);
  hydrateDisplayLanguage();
  assert.equal(useDisplayLanguage.getState().language, "fil");
  assert.equal(useI18n.getState().locale, "en");
  await new Promise(resolve => setTimeout(resolve, 30));
  for (const [key, value] of Object.entries(dictionary)) assert.equal(useI18n.getState().t(key), value);
  assert.equal(storage.size, 0);
  browser(["zh-CN"]); hydrateDisplayLanguage();
  assert.equal(useDisplayLanguage.getState().language, "zh-Hans");
  useDisplayLanguage.getState().setLanguage("fil");
  assert.equal(storage.get("zhaowu.display-language"), "fil");
  hydrateDisplayLanguage();
  assert.equal(useDisplayLanguage.getState().language, "fil");
  useDisplayLanguage.getState().setLanguage("en");
  browser(["tl"]); hydrateDisplayLanguage();
  assert.equal(useDisplayLanguage.getState().language, "en");
  storage.clear(); storage.set("zhaowu.locale", "zh-Hant");
  hydrateDisplayLanguage();
  assert.equal(useDisplayLanguage.getState().language, "zh-Hant");
});
test("storage denial still allows detection and manual selection", () => {
  storage.clear(); browser(["tl"]);
  const original = window.localStorage;
  window.localStorage = { getItem() { throw Error("denied"); }, setItem() { throw Error("denied"); } };
  try {
    hydrateDisplayLanguage();
    assert.equal(useDisplayLanguage.getState().language, "fil");
    useDisplayLanguage.getState().setLanguage("zh-Hans");
    assert.equal(useDisplayLanguage.getState().language, "zh-Hans");
  } finally { window.localStorage = original; }
});

 test("navigator.language fallback and every saved display choice win consistently", () => {
  storage.clear(); browser(["fr"], "ja-JP");
  assert.equal(detectBrowserLanguage(), "ja");
  const document = { documentElement: {}, querySelector: () => null };
  runInNewContext(bootstrap, { navigator, localStorage: window.localStorage, document });
  assert.equal(document.documentElement.lang, "ja");
  for (const language of ["zh-Hant", "zh-Hans", "en", "ja", "ko", "hi", "th", "id", "vi", "fil"]) {
    storage.clear(); storage.set("zhaowu.display-language", language);
    storage.set("zhaowu.locale", "zh-Hans"); browser(["en"]);
    hydrateDisplayLanguage();
    assert.equal(useDisplayLanguage.getState().language, language);
    assert.equal(useI18n.getState().locale, language.startsWith("zh-") ? language : "en");
    runInNewContext(bootstrap, { navigator, localStorage: window.localStorage, document });
    assert.equal(document.documentElement.lang, language);
  }
});

test("early HTML detection still works when localStorage is denied", () => {
  browser(["ko-KR"]);
  const document = { documentElement: {}, querySelector: () => null };
  const denied = { getItem() { throw Error("denied"); } };
  runInNewContext(bootstrap, { navigator, localStorage: denied, document });
  assert.equal(document.documentElement.lang, "ko");
});
