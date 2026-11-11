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
