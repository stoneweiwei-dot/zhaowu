import assert from "node:assert/strict";
import { test } from "node:test";

const { LIFE_VIEW_20260831_ARTICLES } = await import("../src/lib/life-view-20260831.ts");

const article = LIFE_VIEW_20260831_ARTICLES.find((item) => item.id === "from-huangquan-to-rebirth");

test("Guan Shi Lu includes the Chinese afterlife history essay", () => {
  assert.ok(article);
  assert.equal(article.publishedAt, "2026-08-31");
  assert.match(article.title["zh-Hant"], /從黃泉到輪迴/);
  assert.match(article.title["zh-Hans"], /从黄泉到轮回/);
  assert.match(article.title.en, /Huangquan.*Rebirth/i);
});

test("afterlife essay separates historical layers instead of presenting one fixed underworld system", () => {
  assert.ok(article);
  const zh = article.body["zh-Hant"];
  assert.match(zh, /不同時代、不同傳統/);
  assert.match(zh, /不能因此簡化成「完全沒有善惡判斷」/);
  assert.match(zh, /不能當成白居易在制定一套宗教宇宙學/);
  assert.match(zh, /不存在一張所有時代、所有地區共同承認的固定組織架構/);
  assert.match(zh, /較晚形成的民間幽冥敘事/);
});

test("English essay is plain English with no Chinese leakage", () => {
  assert.ok(article);
  const english = [article.title.en, article.summary.en, article.body.en].join("\n");
  assert.doesNotMatch(english, /[\u3400-\u9fff]/);
  assert.match(english, /different periods and traditions/i);
  assert.match(english, /never one hierarchy accepted everywhere/i);
});
