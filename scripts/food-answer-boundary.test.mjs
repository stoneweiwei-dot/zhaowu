import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { analyzeLife, followUpLife } from "../src/lib/actions.ts";
import { FEATURED_CITIES } from "../src/lib/bazi/cities.ts";
import { foodPreferenceAnswer } from "../src/lib/report/food-preference-answer.ts";
import { buildDecisionReportModel } from "../src/lib/report/decision-report-model.ts";
import { buildComplexDeterministicAnswer, buildComplexReasoningRequest } from "../src/lib/report/complex-reasoning.ts";
import { composeFocusedReport } from "../src/lib/report/focused-report.ts";
import { registerHooks } from "node:module";
registerHooks({ load(url, context, nextLoad) {
  if (url.endsWith(".css")) return { format: "module", source: "export default {};", shortCircuit: true };
  return nextLoad(url, context);
} });
const { ResultView } = await import("../src/components/result-view.tsx");
import { buildWriterRequest } from "../src/lib/report/llm-answer.ts";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { BaziReadingUnlock } from "../src/components/bazi-reading-unlock.tsx";

const input = { year: 1990, month: 6, day: 15, hour: 12, minute: 0, timeUnknown: false, gender: "male", relation: "unset", city: FEATURED_CITIES[0], liveCity: null, ziPolicy: "midnight", useTrueSolar: true };

test("initial and follow-up taste answers remain on topic in all three languages", async () => {
  for (const [locale, question] of [["zh-Hant", "我適合吃什麼口味的食物"], ["zh-Hans", "我适合吃什么口味的食物"], ["en", "What food flavours suit me?"]]) {
    const result = await analyzeLife({ data: { ...input, question, locale } });
    const next = await followUpLife({ data: { question, base: result } });
    assert.equal(next.chart, result.chart, "follow-up must reuse the chart");
    for (const candidate of [result, next]) {
      const model = buildDecisionReportModel(candidate);
      assert.doesNotMatch(model.directAnswer + model.nextAction + model.reasons.join(""), /今年|流年|\d+月|收入|工作|this year|income|career/i);
      assert.match(model.directAnswer, /口味|味覺|味觉|flavour/i);
      assert.equal(model.timing.length, 0);
      assert.equal(model.reasons.length, 2);
      assert.equal(buildWriterRequest(candidate), null);
      assert.equal(buildComplexDeterministicAnswer(candidate), null);
      assert.equal(buildComplexReasoningRequest(candidate), null);
      assert.equal(candidate.reading.directAnswer, model.directAnswer);
      assert.doesNotMatch(composeFocusedReport(candidate).flatMap(section => section.body).join(""), /今年|流年|\d+月|收入|工作|this year|income|career/i);
      const html = renderToStaticMarkup(createElement(ResultView, { result: candidate }));
      assert.match(html, /data-follow-up-locked/);
      assert.doesNotMatch(html, /id="follow-up-question"|data-answer-detail|data-timing-guide/);
    }
  }
});

test("medical food questions do not enter the preference route", () => {
  for (const question of ["痛風適合吃什麼", "食物過敏怎麼辦", "What diet treats diabetes?"]) {
    assert.equal(foodPreferenceAnswer(question), null);
  }
});

test("locked full-reading card uses the existing BaZi product and preserves consent", () => {
  const html = renderToStaticMarkup(createElement(BaziReadingUnlock, { locale: "zh-Hant" }));
  assert.match(html, /基本排盤與兩段試讀免費/);
  assert.match(html, /US\$9\.90/);
  assert.match(html, /data-purchase-consent/);
  assert.doesNotMatch(html, /zhaowu-unified-report|follow-up-question/);
});


test("basic food preference questions get meal guidance and use current chart visuals", async () => {
  const basic = foodPreferenceAnswer("我适合吃什么食物", "zh-Hant");
  assert.ok(basic);
  assert.match(basic.answer, /主食/);
  assert.match(basic.answer, /三個餐點選項/);
  const [account, resultView] = await Promise.all([
    readFileSync(new URL("../src/routes/account.tsx", import.meta.url), "utf8"),
    readFileSync(new URL("../src/components/result-view.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(account, /storedReportSections\(detail, locale\)/);
  assert.match(account, /<CharacterPanel chart=\{snapshot\.chart\} \/>/);
  assert.doesNotMatch(account, /imageUrls\[row\.id\]|<DecreeImageReason|generateDecreeImage/);
  assert.match(account, /網站外觀與內容/);
  assert.match(resultView, /foodAnswer\?\.answer/);
  assert.doesNotMatch(resultView, /Personal Sacred Beast sequence|專屬命象瑞獸圖譜|generateDecreeImage/);
});
