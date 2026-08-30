import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("homepage life paper keeps one analysis form and quiz skin", async () => {
  const home = await source("src/routes/index.tsx");
  const form = await source("src/components/analysis-form.tsx");
  const main = await source("src/main.tsx");
  const css = await source("src/home-quiz-paper.css");
  const quiz = await source("src/lib/report/quiz-paper.ts");

  assert.match(home, /<AnalysisForm \/>/);
  assert.match(home, /zhaowu-home-intro-quiz/);
  assert.match(form, /id="analysisForm"/);
  assert.match(form, /id="analysis-question"/);
  assert.match(form, /id="birth-year"/);
  assert.match(main, /home-quiz-paper\.css/);
  assert.match(css, /\.zhaowu-quiz-sheet/);
  assert.match(quiz, /export function composeQuizQuestion/);
  assert.match(quiz, /seed: "工作"/);
  assert.doesNotMatch(quiz, /Math\.random/);
});
