import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("homepage life paper keeps one analysis form and quiz sections", async () => {
  const home = await source("src/routes/index.tsx");
  const form = await source("src/components/analysis-form.tsx");
  const main = await source("src/main.tsx");
  const css = await source("src/home-quiz-paper.css");
  const quiz = await source("src/lib/report/quiz-paper.ts");

  assert.match(home, /<AnalysisForm \/>/);
  assert.match(home, /zhaowu-home-intro-quiz/);
  assert.match(form, /id="analysisForm"/);
  assert.match(form, /composeQuizQuestion/);
  assert.match(form, /這次想弄清的方向/);
  assert.match(form, /最近更接近哪種狀態/);
  assert.match(form, /id="analysis-question"/);
  assert.match(form, /id="birth-year"/);
  assert.match(main, /home-quiz-paper\.css/);
  assert.match(css, /\.zhaowu-quiz-sheet/);
  assert.match(quiz, /export function composeQuizQuestion/);
});

test("composeQuizQuestion prefixes topic seeds without inventing a new question", async () => {
  const quiz = await source("src/lib/report/quiz-paper.ts");
  assert.match(quiz, /seed: "工作"/);
  assert.match(quiz, /seed: "感情"/);
  assert.match(quiz, /seed: "錢"/);
  assert.match(quiz, /seed: "健康"/);
  assert.doesNotMatch(quiz, /Math\.random/);
});
