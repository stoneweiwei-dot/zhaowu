import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import {
  FIVE_ELEMENT_QUESTIONS,
  FIVE_ELEMENT_RESULTS,
  scoreFiveElementAnswers,
} from "../src/lib/fun-tests/five-element-function.ts";
import { saveSpecialistHistory, readSpecialistHistory } from "../src/lib/specialist-history.ts";

for (const locale of ["zh-Hant", "zh-Hans", "en"]) {
  test(`five-element function quiz has 12 complete questions in ${locale}`, () => {
    assert.equal(FIVE_ELEMENT_QUESTIONS[locale].length, 12);
    for (const question of FIVE_ELEMENT_QUESTIONS[locale]) {
      assert.ok(question.title.trim());
      assert.equal(question.answers.length, 5);
      assert.equal(new Set(question.answers.map((answer) => answer.element)).size, 5);
    }
    assert.equal(Object.keys(FIVE_ELEMENT_RESULTS[locale]).length, 5);
  });
}

test("scoring chooses one primary axis and keeps a close runner-up as support", () => {
  const score = scoreFiveElementAnswers([
    "wood", "wood", "wood", "wood",
    "fire", "fire", "fire",
    "earth", "metal", "water", "fire", "wood",
  ]);
  assert.equal(score?.primary, "wood");
  assert.equal(score?.secondary, "fire");
});

test("Q9 marks overdrive instead of telling the user to add more of the same", () => {
  const score = scoreFiveElementAnswers([
    "fire", "fire", "fire", "fire", "fire", "fire", "fire", "fire", "fire", "wood", "earth", "metal",
  ]);
  assert.equal(score?.primary, "fire");
  assert.equal(score?.overdrive, true);
});

test("tie-break uses active-choice questions before fixed ordering", () => {
  const answers = [
    "wood", "fire", "earth", "metal",
    "water", "wood", "fire", "earth",
    "metal", "water", "metal", "wood",
  ];
  const score = scoreFiveElementAnswers(answers);
  assert.equal(score?.primary, "metal");
});

test("homepage and Jade Dragon do not revive the retired public group", async () => {
  const home = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
  const guide = await readFile(new URL("../src/components/green-dragon-guide.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(home, /性格兩面|性格两面|Two sides of character|tianji-dual/);
  assert.doesNotMatch(guide, /性格兩面|性格两面|Two sides of character|tianji-dual/);
  assert.match(home, /你會知道/);
  assert.match(home, /最擅長看/);
  assert.match(home, /You’ll learn/);
  assert.match(home, /Best for/);
  assert.match(home, /你現在最需要練哪一行/);
  assert.match(guide, /趣味測驗/);
});

function memoryStorage() {
  const data = new Map();
  return {
    get length() { return data.size; },
    clear() { data.clear(); },
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    key(index) { return [...data.keys()][index] ?? null; },
    removeItem(key) { data.delete(key); },
    setItem(key, value) { data.set(key, String(value)); },
  };
}

test("five-element result can be saved into My history without a new database", () => {
  const storage = memoryStorage();
  const saved = saveSpecialistHistory({
    kind: "fun-five-element",
    locale: "zh-Hant",
    sourcePath: "/fun-tests",
    title: "木｜生長與方向",
    inputSummary: "五行功能傾向測驗 · 最近 1–3 個月",
    sections: [{ title: "你的當前主軸", body: "測驗結果" }],
    closing: "這不是八字喜用神。",
  }, storage);
  assert.equal(saved?.sourcePath, "/fun-tests");
  assert.equal(readSpecialistHistory(storage)[0]?.kind, "fun-five-element");
});
