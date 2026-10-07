import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");
const home = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const heroCss = await readFile(new URL("../src/home-hero-v1.css", import.meta.url), "utf8");

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
  assert.match(source, /questionTitle: "沿著這份命書，繼續問你真正關心的事"/);
  assert.doesNotMatch(source, /zhaowu-question-promise/);
  assert.match(source, /question: question\.trim\(\)/);
  assert.match(source, /analyzeLife\(/);
});


test("hero offers one quiet birth-book entry that opens the existing form instead of a second flow", () => {
  assert.match(home, /birthCta: "錄入生辰・開卷昭梧"/);
  assert.match(home, /birthCta: "录入生辰・开卷昭梧"/);
  assert.match(home, /birthCta: "Enter birth details · Open ZHAOWU"/);
  assert.match(home, /data-home-birth-entry/);
  assert.match(home, /setActiveSection\("form"\)/);
  assert.match(home, /document\.getElementById\("analysis"\)\?\.scrollIntoView/);
  assert.match(home, /aria-controls="analysis"/);
  assert.match(heroCss, /\.zw-birth-entry-ticket/);
  assert.match(heroCss, /rgba\(251, 248, 240/);
  assert.doesNotMatch(home, /href="\/analysis"/);
});
