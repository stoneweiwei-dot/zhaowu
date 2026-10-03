import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const helper = await readFile(new URL("../src/lib/report/illustrated-destiny.ts", import.meta.url), "utf8");
const component = await readFile(new URL("../src/components/illustrated-destiny-panel.tsx", import.meta.url), "utf8");
const resultView = await readFile(new URL("../src/components/result-view.tsx", import.meta.url), "utf8");
const report = await readFile(new URL("../src/components/paid-report-pages.tsx", import.meta.url), "utf8");

test("illustration translation is read-only and requires a supported claim", () => {
  assert.match(helper, /model\.nextAction\.trim\(\)/);
  assert.match(helper, /if \(!sourceClaim \|\| !directAnswer \|\| model\.confidence === "limited"\) return null/);
  assert.doesNotMatch(helper, /result\.chart\s*=/);
  assert.doesNotMatch(helper, /result\\.chart\\s*=/);
  assert.match(component, /data-source-claim=\{scene\.sourceClaim\}/);
});

test("unknown birth time downgrades and suppresses illustration", () => {
  assert.match(helper, /result\.chart\.timeUnknown \? "limited" : "medium"/);
  assert.match(helper, /if \(confidence === "limited"\) return null/);
});

test("provider and illustration failures cannot replace the free answer", () => {
  assert.match(resultView, /data-primary-answer/);
  assert.match(report, /<IllustratedDestinyPanel result=\{result\} \/>/);
  assert.doesNotMatch(component, /fetch\(|generateDecreeImage|supabase/i);
});

test("legacy Comic Lite remains outside the active public result and focused report flow", () => {
  assert.doesNotMatch(resultView, /ComicLiteReport|ReportComicLite/);
  assert.doesNotMatch(report, /ComicLiteReport|ReportComicLite/);
});
