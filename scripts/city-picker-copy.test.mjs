import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const picker = await readFile(new URL("../src/components/city-picker.tsx", import.meta.url), "utf8");
const i18n = await readFile(new URL("../src/lib/i18n.ts", import.meta.url), "utf8");
const analysisForm = await readFile(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");

test("optional city copy is not rendered twice when the label already includes it", () => {
  assert.match(picker, /const optionalToken = optionalLabel\.trim\(\)\.toLowerCase\(\)/);
  assert.match(picker, /!label\.toLowerCase\(\)\.includes\(optionalToken\)/);
  assert.match(picker, /showOptionalLabel \?/);
  assert.match(i18n, /Current city \(optional\)/);
  assert.match(i18n, /目前居住城市（選填）/);
  assert.match(i18n, /目前居住城市（选填）/);
});


test("city input confirms exact matches and requires a verified birthplace", () => {
  assert.match(picker, /candidates\.includes\(normalizedQuery\)/);
  assert.doesNotMatch(picker, /localized\.length === 1/);
  assert.match(picker, /aria-invalid=\{invalid \|\| tzError \|\| undefined\}/);
  // 2026-10-08: typing is never rewritten mid-input; IME composition is respected.
  assert.match(picker, /onCompositionStart/);
  assert.match(picker, /resolveCityTimezone/);
  assert.match(picker, /commitBestAvailable/);
  assert.match(picker, /onBlur[\s\S]*commitBestAvailable/);
  assert.doesNotMatch(picker, /standardTimeFallbackCity/);
  assert.doesNotMatch(picker, /exactMatch\(hits, q\) \?\? hits\[0\]/);
  assert.match(picker, /open && hits.length/);
  assert.match(picker, /seq !== commitSeq.current/);
  assert.match(picker, /role="alert"/);
  assert.doesNotMatch(analysisForm, /standardTimeFallbackCity\(locale\)/);
  assert.match(analysisForm, /!birthCity \|\| birthCity.standardTimeFallback \|\| !birthCity.timezone/);
  assert.doesNotMatch(analysisForm, /setBirthCityError/);
  assert.match(analysisForm, /未校正真太陽時/);
});

test("home chart, interpretation and unlock precede the next action", () => {
  assert.match(analysisForm, /data-home-bazi-explanation/);
  assert.match(analysisForm, /buildPlainChartSummary\(previewChart, locale\)/);
  assert.match(analysisForm, /<BaziChart chart={previewChart}[^>]*referenceOnly/);
  assert.match(analysisForm, /<UnifiedBirthReport birth={rememberedRecord}/);
  assert.ok(analysisForm.indexOf('<BaziReadingUnlock') < analysisForm.indexOf('className="zw-flow-next"'));
});
