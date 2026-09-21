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


test("exact city matches can self-confirm and unresolved birth city is explicit", () => {
  assert.match(picker, /localized\.length === 1/);
  assert.match(picker, /aria-invalid=\{invalid \|\| undefined\}/);
  assert.match(picker, /role="alert"/);
  assert.match(analysisForm, /setBirthCityError\(true\)/);
  assert.match(analysisForm, /document\.getElementById\("birth-city"\)/);
  assert.match(analysisForm, /invalid=\{birthCityError\}/);
});
