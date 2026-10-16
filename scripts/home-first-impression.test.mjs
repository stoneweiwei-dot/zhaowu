import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");
const home = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const painted = await readFile(new URL("../src/components/painted-home.tsx", import.meta.url), "utf8");
const tree = await readFile(new URL("../src/components/home-tree.tsx", import.meta.url), "utf8");
const heroCss = await readFile(new URL("../src/painted-home.css", import.meta.url), "utf8");

test("homepage first impression is birth-first, followed by the chart and then the question", () => {
  assert.match(source, /customerTitle: "錄入生辰"/);
  assert.match(source, /customerTitle: "录入生辰"/);
  assert.match(source, /customerTitle: "Enter your birth record"/);
  assert.match(source, /id="customer-record"/);
  assert.match(source, /id="question-stage"/);
  assert.match(source, /id="bazi"/);
  assert.match(source, /BaziChart/);
  assert.match(source, /id="analysis-question"/);
  assert.match(source, /const showQuestion = Boolean\(rememberedRecord && !detailsOpen\)/);
  assert.match(source, /customer-record[\s\S]*id="bazi"[\s\S]*question-stage/);
  assert.doesNotMatch(source, /homepage-hero|zhaowu-hero/);
});

test("question sheet is concise and explicitly answer-first", () => {
  assert.match(source, /zhaowu-question-sheet/);
  assert.match(source, /questionTitle: "問個問題（選填）"/);
  assert.doesNotMatch(source, /zhaowu-question-promise/);
  assert.match(source, /question: question\.trim\(\)/);
  assert.match(source, /analyzeLife\(/);
});


test("hero offers one quiet birth-book entry that opens the existing form instead of a second flow", () => {
  assert.match(tree, /id: 'form'[\s\S]*title: t\('我的命盤', '我的命盘', 'My chart'\)/);
  assert.match(tree, /section: 'form'/);
  assert.match(painted, /data-home-birth-entry/);
  assert.match(painted, /onOpen\('form'\)/);
  assert.match(home, /openBirthBook/);
  assert.match(home, /document\.getElementById\("birth-form"\)/);
  assert.match(heroCss, /\.zw-painted-home/);
  assert.doesNotMatch(home, /href="\/analysis"/);
});
