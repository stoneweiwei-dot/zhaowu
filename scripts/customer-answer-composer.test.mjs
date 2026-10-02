import assert from "node:assert/strict";
import test from "node:test";

const { analyzeLife } = await import("../src/lib/actions.ts");
const { buildDecisionReportModel } = await import("../src/lib/report/decision-report-model.ts");
const { composeFocusedReport } = await import("../src/lib/report/focused-report.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");

const JARGON = /月令|格局|正印格|十神|七殺|七杀|殺印|杀印|日主|喜用|用神|病藥|病药|承載|承载|制化|透干|藏干|庫氣|六親定位|六亲定位|主看日柱|結構完成度|结构完成度/;
const SIMPLIFIED = /[这顺险点属暂杀阳内题拥协达旧杂酿绪经弹项预馈视诺维竞]/;

async function screen(question) {
  const result = await analyzeLife({
    data: {
      question, locale: "zh-Hant", year: 1988, month: 10, day: 4, hour: 3, minute: 30,
      timeUnknown: false, gender: "male", relation: "unset", city: FEATURED_CITIES[0],
      liveCity: null, ziPolicy: "midnight", useTrueSolar: false,
    },
  });
  return { result, model: buildDecisionReportModel(result) };
}

test("ordinary questions get a plain first-screen answer with no chart jargon or Simplified leftovers", async () => {
  for (const q of ["我今年適合換工作嗎？", "我這幾年財運如何？", "我跟我伴侶的關係走向是什麼？", "我什麼時候會結婚？", "我今年健康要注意什麼？", "我的個性有什麼盲點？", "我明年能升職嗎？", "我該不該離職？"]) {
    const { model } = await screen(q);
    assert.doesNotMatch(model.directAnswer, JARGON, q);
    assert.doesNotMatch(model.directAnswer, SIMPLIFIED, q);
    assert.doesNotMatch(model.nextAction, /報告列出的前三個月份/, q);
    assert.ok(model.directAnswer.length > 40, `${q} answer too thin: ${model.directAnswer}`);
  }
});

test("a time-word topic question answers the topic, not only a month list", async () => {
  const { model } = await screen("我今年適合換工作嗎？");
  assert.match(model.directAnswer, /^(可以|今年工作上先別急)/);
  assert.match(model.directAnswer, /從你的盤來看/);
  assert.match(model.directAnswer, /\d{1,2}月/);
});

test("when-questions lead with the window itself", async () => {
  const { model } = await screen("我什麼時候會結婚？");
  assert.match(model.directAnswer, /^感情比較容易有進展的時間，落在/);
  assert.match(model.directAnswer, /不是保證/);
});

test("yes/no relationship question no longer opens with 六親 labels", async () => {
  const { model } = await screen("我和現在的對象適合結婚嗎？");
  assert.doesNotMatch(model.directAnswer, /六親|主看日柱|人物星/);
  assert.match(model.directAnswer, /感情/);
});

test("special question types keep their dedicated answers", async () => {
  const { model } = await screen("我的天賦是什麼？");
  assert.match(model.directAnswer, /天賦/);
});

test("full report puts the plain answer and next step before the chart basis", async () => {
  const { result } = await screen("我今年適合換工作嗎？");
  const body = composeFocusedReport(result).find((s) => s.key === "summary").body;
  assert.doesNotMatch(body[0], JARGON);
  assert.match(body[1], /^下一步｜/);
  assert.match(body[2], /^命理依據｜/);
  assert.ok(body.slice(3).some((line) => /結構摘要|结构摘要/.test(line)), "chart basis is still present after the label");
  for (const line of body) assert.doesNotMatch(line, SIMPLIFIED, line);
});
