import assert from "node:assert/strict";
import { test } from "node:test";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");
const { interpret } = await import("../src/lib/bazi/interpret.ts");
const { analyzeLife } = await import("../src/lib/actions.ts");
const {
  MONTH_STAGE_FEEDBACK_POLICY,
  applyMonthStageFeedbackPolicy,
  monthStagePolicyViolations,
} = await import("../src/lib/bazi/month-stage-feedback.ts");

const TAIPEI = FEATURED_CITIES[0];

function sample(over = {}) {
  return {
    question: "帮我分析这个八字",
    year: 1988,
    month: 10,
    day: 4,
    hour: 3,
    minute: 30,
    timeUnknown: false,
    gender: "male",
    relation: "unset",
    city: TAIPEI,
    liveCity: null,
    ziPolicy: "midnight",
    useTrueSolar: false,
    locale: "zh-Hans",
    ...over,
  };
}

test("月令舞台规则已进入 production policy", () => {
  assert.equal(MONTH_STAGE_FEEDBACK_POLICY.id, "ZW-MONTH-STAGE-FEEDBACK-1.0");
  assert.equal(MONTH_STAGE_FEEDBACK_POLICY.status, "production");
  assert.ok(MONTH_STAGE_FEEDBACK_POLICY.rules.some((rule) => rule.includes("月令是第一入口")));
  assert.ok(MONTH_STAGE_FEEDBACK_POLICY.guards.some((rule) => rule.includes("禁止月令固定八成")));
  assert.ok(MONTH_STAGE_FEEDBACK_POLICY.guards.some((rule) => rule.includes("禁止月支直接固定對應十二神煞")));
});

test("普通分析实际写入月令舞台，但不把月令量化成固定八成", () => {
  const input = sample();
  const chart = buildChart(input);
  const raw = interpret(input.question, chart, "unset", null);
  const governed = applyMonthStageFeedbackPolicy(input.question, chart, raw);

  assert.equal(chart.monthBranch, "酉");
  assert.match(governed.rhythm, /【月令舞台】月令酉/);
  assert.match(governed.rhythm, /主氣辛|主气辛/);
  assert.match(governed.rhythm, /仲秋收斂|仲秋收敛/);
  assert.match(governed.rhythm, /不設固定百分比權重|不设固定百分比权重/);
  assert.deepEqual(monthStagePolicyViolations(governed.rhythm), []);
  assert.doesNotMatch(governed.rhythm, /酉.{0,6}(就是|等於|等于|固定對應|固定对应).{0,8}(驛馬|驿马)/);
});

test("要求校准时必须索取3至5件重大事件并按固定顺序回溯", async () => {
  const input = sample({ question: "这个时辰我不确定，请帮我校准定盘并验证" });
  const result = await analyzeLife({ data: input });

  assert.match(result.reading.rhythm, /【月令舞台】/);
  assert.match(result.reading.rhythm, /【現實反饋校驗】|【现实反馈校验】/);
  assert.match(result.reading.rhythm, /3至5件年份可核對的重大事件|3至5件年份可核对的重大事件/);
  assert.match(result.reading.rhythm, /校時→校主氣→校從化→校調候→校病藥→校現實映射|校时→校主气→校从化→校调候→校病药→校现实映射/);
  assert.match(result.reading.rhythm, /兩輪仍不吻合|两轮仍不吻合/);
});

test("普通问题不强迫用户提交反馈事件", async () => {
  const input = sample({ question: "我现在工作应该怎么选" });
  const result = await analyzeLife({ data: input });

  assert.match(result.reading.rhythm, /【月令舞台】/);
  assert.doesNotMatch(result.reading.rhythm, /【現實反饋校驗】|【现实反馈校验】/);
});
