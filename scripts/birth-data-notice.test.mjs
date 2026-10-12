import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const load = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("every place that collects birth details shows the third-party notice", async () => {
  const [form, palm, notice] = await Promise.all([
    load("src/components/analysis-form.tsx"),
    load("src/components/palm-standalone.tsx"),
    load("src/components/birth-data-notice.tsx"),
  ]);
  assert.match(form, /<BirthDataNotice locale=\{locale\} variant="birth" \/>/);
  assert.match(form, /<BirthDataNotice locale=\{locale\} variant="question" \/>/);
  assert.match(palm, /<BirthDataNotice locale=\{locale\} variant="birth" \/>/);
  assert.ok(form.indexOf('variant="birth"') < form.indexOf('id: "birth-year"'), "notice comes before the date fields");
  assert.match(notice, /href="\/privacy"/);
  for (const lang of ["zh-Hant", "zh-Hans", "en"]) assert.match(notice, new RegExp(`"?${lang}"?: "`));
  assert.doesNotMatch(notice, /disabled|required|onChange/, "the notice is a reminder and must not block entry");
});
