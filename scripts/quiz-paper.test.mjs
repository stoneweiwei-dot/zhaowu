import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
async function source(path) { return readFile(new URL(path, root), "utf8"); }

test("homepage keeps one analysis form and the restored r144 question stage", async () => {
  const home = await source("src/routes/index.tsx");
  const form = await source("src/components/analysis-form.tsx");
  const main = await source("src/legacy-visual-compat.css");
  const css = await source("src/home-quiz-paper.css");
  const quiz = await source("src/lib/report/quiz-paper.ts");
  const copy = await source("src/lib/report/quiz-copy.ts");

  assert.equal((home.match(/<AnalysisForm \/>/g) ?? []).length, 1);
  assert.match(form, /id="analysisForm"/);
  assert.match(form, /id="bazi"/);
  assert.match(form, /birth-year/);
  assert.match(form, /id="analysis-question"/);
  assert.match(form, /zhaowu-question-sheet/);
  assert.match(form, /question: question\.trim\(\)/);
  assert.match(form, /analyzeLife\(/);
  assert.doesNotMatch(home, /zhaowu-home-quiz-title/);
  assert.doesNotMatch(form, /zhaowu-quiz-chip|zhaowu-quiz-choice|composeQuizQuestion/);
  assert.match(main, /home-quiz-paper\.css/);
  assert.match(css, /\.zhaowu-quiz-sheet/);
  assert.match(quiz, /export function composeQuizQuestion/);
  assert.match(copy, /人生試卷/);
  assert.doesNotMatch(quiz, /Math\.random/);
});
