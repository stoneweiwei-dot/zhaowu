import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const articles = await readFile(new URL("../src/lib/life-view-20260903-late.ts", import.meta.url), "utf8");
const section = await readFile(new URL("../src/components/life-view-section.tsx", import.meta.url), "utf8");

test("late owner-material intake adds the missing recent discussions in three languages", () => {
  assert.match(articles, /OWNER_MATERIAL/);
  for (const id of [
    "feng-shui-begins-in-conduct",
    "do-not-take-it-as-final",
    "emotion-does-not-run-the-decision",
    "clarity-studies-patterns-rules-people",
  ]) assert.match(articles, new RegExp(`id: "${id}"`));
  assert.match(articles, /"zh-Hant"/);
  assert.match(articles, /"zh-Hans"/);
  assert.match(articles, /en:/);
  assert.match(articles, /不等於取消必要的安全與邊界/);
  assert.match(articles, /不是逃避現實/);
  assert.match(articles, /情緒不是敵人/);
  assert.match(articles, /規律、規則、人性與自己/);
});

test("late articles are surfaced before earlier article intake and use the existing art family", () => {
  const late = section.indexOf("...LIFE_VIEW_20260903_LATE_ARTICLES");
  const sameDay = section.indexOf("...LIFE_VIEW_20260903_ARTICLES");
  assert.ok(late >= 0);
  assert.ok(sameDay > late);
  assert.match(section, /feng-shui-begins-in-conduct/);
  assert.match(section, /do-not-take-it-as-final/);
  assert.match(section, /emotion-does-not-run-the-decision/);
  assert.match(section, /clarity-studies-patterns-rules-people/);
});
