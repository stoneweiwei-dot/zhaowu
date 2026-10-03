import assert from "node:assert/strict";
import test from "node:test";

const { analyzeLife } = await import("../src/lib/actions.ts");
const { buildDecisionReportModel } = await import("../src/lib/report/decision-report-model.ts");
const { composeFocusedReport } = await import("../src/lib/report/focused-report.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");

const JARGON = /月令|格局|正印格|十神|七殺|七杀|殺印|杀印|日主|喜用|用神|病藥|病药|承載|承载|制化|透干|藏干|庫氣|六親定位|六亲定位|主看日柱|結構完成度|结构完成度/;
const SIMPLIFIED = /[这顺险点属暂杀阳内题拥协达旧杂酿绪经弹项预馈视诺维竞]/;

async function screen(question, birth = {}) {
  const result = await analyzeLife({
    data: {
      question, locale: "zh-Hant", year: 1988, month: 10, day: 4, hour: 3, minute: 30,
      timeUnknown: false, gender: "male", ...birth, relation: "unset", city: FEATURED_CITIES[0],
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
  const basis = body.findIndex((line) => /^命理依據｜/.test(line));
  assert.ok(basis >= 2, "basis label comes after the answer and next step");
  assert.ok(body.slice(basis + 1).some((line) => /結構摘要|结构摘要/.test(line)), "chart basis is still present after the label");
  for (const line of body) assert.doesNotMatch(line, SIMPLIFIED, line);
});

test("first screen is at most 3 sentences (FOCUSED-REPORT §1)", async () => {
  const qs = ["我今年適合換工作嗎？", "我這幾年財運如何？", "我跟我伴侶的關係走向是什麼？", "我什麼時候會結婚？", "我今年健康要注意什麼？", "我的個性有什麼盲點？", "我明年能升職嗎？", "我該不該離職？", "我適合搬到南半球生活嗎？", "明年運勢怎麼樣？", "最近很迷茫該怎麼辦？", "我適合創業嗎？"];
  for (const q of qs) {
    const { model } = await screen(q);
    const count = (model.directAnswer.match(/。/g) ?? []).length;
    assert.ok(count >= 1 && count <= 3, `${q}: ${count} sentences -> ${model.directAnswer}`);
  }
});

test("timing windows never name a month that has already passed this year", async () => {
  const now = new Date();
  const thisYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  for (const q of ["我什麼時候會結婚？", "我今年適合換工作嗎？", "我這幾年財運如何？"]) {
    const { model } = await screen(q);
    const text = `${model.directAnswer}${model.nextAction}`;
    for (const match of text.matchAll(/今年(?:的|比較順的是|比較不順的是)?((?:\d{1,2}月[、和]?)+)/g)) {
      for (const m of match[1].matchAll(/(\d{1,2})月/g)) {
        assert.ok(Number(m[1]) >= curMonth || thisYear !== now.getFullYear(), `${q}: 今年${m[1]}月 already passed (now ${curMonth}月) -> ${text}`);
      }
    }
  }
});

test("a weaker-foundation chart gets the cautious branch, still plain and within 3 sentences", async () => {
  const weak = { year: 1985, month: 7, day: 22, hour: 14, gender: "female" };
  const { result, model } = await screen("我該不該離職？", weak);
  assert.match(result.chart.strength.tendency, /弱/);
  assert.match(model.directAnswer, /^偏向先不急著動/);
  assert.doesNotMatch(model.directAnswer, JARGON);
  assert.doesNotMatch(model.directAnswer, SIMPLIFIED);
  assert.ok((model.directAnswer.match(/。/g) ?? []).length <= 3, model.directAnswer);
  const health = await screen("我今年健康要注意什麼？", weak);
  assert.match(health.model.directAnswer, /底子偏弱/);
  assert.match(health.model.directAnswer, /先看醫生/);
});

test("high-stakes and non-job decisions never get the 'go ahead' wording", async () => {
  const marriage = await screen("我老公外遇了，我要不要離婚？");
  assert.match(marriage.model.directAnswer, /命盤不能替你拍板/);
  assert.match(marriage.model.nextAction, /安全/);
  const surgery = await screen("我要不要動手術？");
  assert.match(surgery.model.directAnswer, /醫生/);
  for (const q of ["要不要跟前任復合？", "我要不要買房？", "我要不要搬去墨爾本？"]) {
    const { model } = await screen(q);
    assert.doesNotMatch(model.directAnswer, /偏向可以動|一直忍著|把力氣用出去/, q);
    assert.match(model.directAnswer, /命盤不能替你拍板|命盤只能看時機/, q);
    assert.ok((model.directAnswer.match(/。/g) ?? []).length <= 3, q);
  }
  const job = await screen("我該不該離職？");
  assert.match(job.model.directAnswer, /^偏向可以動/);
});
