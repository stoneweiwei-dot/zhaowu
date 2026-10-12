import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const helper = await readFile(new URL("../src/lib/report/illustrated-destiny.ts", import.meta.url), "utf8");
const component = await readFile(new URL("../src/components/illustrated-destiny-panel.tsx", import.meta.url), "utf8");
const resultView = await readFile(new URL("../src/components/result-view.tsx", import.meta.url), "utf8");
const report = await readFile(new URL("../src/components/paid-report-pages.tsx", import.meta.url), "utf8");
const home = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/zhaowu-design-system.css", import.meta.url), "utf8");

test("illustration requires an evidence-backed claim and stays read-only", () => {
  assert.match(helper, /model\.nextAction\.trim\(\)/);
  assert.match(helper, /if \(!sourceClaim \|\| !directAnswer \|\| model\.confidence === "limited"\) return null/);
  assert.doesNotMatch(helper, /result\.chart\s*=/);
  assert.match(component, /data-source-claim=\{scene\.sourceClaim\}/);
  for (const ratio of ["9:16", "4:5", "1:1"]) assert.ok(component.includes(ratio));
});

test("unknown birth time downgrades confidence without erasing a supported illustration", () => {
  assert.match(helper, /result\.chart\.timeUnknown \? "limited" : "medium"/);
  assert.doesNotMatch(helper, /if \(confidence === "limited"\) return null/);
});

test("provider or illustration failure cannot block the free answer", () => {
  assert.match(resultView, /data-primary-answer/);
  assert.ok(report.includes("IllustratedDestinyPanel"));
  assert.doesNotMatch(component, /fetch\(|generateDecreeImage|supabase/i);
});

test("homepage gets one non-judgemental entry while legacy Comic Lite stays out of the report flow", () => {
  assert.match(home, /<IllustratedDestinyWelcome \/>/);
  assert.match(component, /data-illustrated-welcome/);
  assert.match(styles, /\.illustrated-destiny-welcome/);
  const welcomeStart = component.indexOf("export function IllustratedDestinyWelcome");
  const welcomeEnd = component.indexOf("export function IllustratedDestinyPanel", welcomeStart);
  assert.doesNotMatch(component.slice(welcomeStart, welcomeEnd), /buildIllustratedDestiny\(/);
  assert.match(report, /<IllustratedDestinyPanel result=\{result\} \/>/);
  assert.match(report, /<IllustratedShareCard result=\{result\} \/>/);
  assert.doesNotMatch(resultView, /ComicLiteReport|ReportComicLite/);
  assert.doesNotMatch(report, /ComicLiteReport|ReportComicLite/);
});

test("illustration stays readable at mobile sizes, in night mode, and in English", () => {
  assert.match(styles, /\.illustrated-destiny-panel figcaption[^}]*font-size:16px/s);
  assert.match(styles, /overflow-wrap:anywhere/);
  assert.match(styles, /html\[data-zw-theme="night"\][^\n]*illustrated-destiny-panel/);
  assert.match(component, /overflow-wrap:anywhere/);
});
