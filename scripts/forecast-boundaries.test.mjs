import assert from "node:assert/strict";
import { test } from "node:test";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");
const { analyzeForecastYear, buildTimingAnswer } = await import("../src/lib/bazi/forecast.ts");

const CITY = FEATURED_CITIES[0];

function chart() {
  return buildChart({
    question: "2027 哪幾個月適合旅行？",
    year: 1988,
    month: 10,
    day: 4,
    hour: 3,
    minute: 30,
    timeUnknown: false,
    gender: "male",
    relation: "unset",
    city: CITY,
    liveCity: null,
    ziPolicy: "midnight",
    useTrueSolar: false,
  });
}

test("12个流月窗口都带节气起止，不把公历月当命理月", () => {
  const f = analyzeForecastYear(chart(), 2027, "travel");
  assert.equal(f.months.length, 12);
  assert.ok(f.months.every((m) => m.jieStart && m.jieEnd));

  const sep = f.months.find((m) => m.month === 9);
  const oct = f.months.find((m) => m.month === 10);
  assert.equal(sep?.jieStart, "白露");
  assert.equal(sep?.jieEnd, "寒露");
  assert.equal(oct?.jieStart, "寒露");
  assert.equal(oct?.jieEnd, "立冬");
});

test("用户看到的月份答案必须显示节气边界说明", () => {
  const answer = buildTimingAnswer(chart(), "travel", [2027], { months: [9, 10] });
  assert.match(answer, /9月（.*白露→寒露|10月（.*寒露→立冬/);
  assert.match(answer, /月份名稱只是方便閱讀/);
  assert.match(answer, /命理月以節氣交接為邊界/);
  assert.doesNotMatch(answer, /公曆每月 1 日到月底.*等同|公历每月 1 日到月底.*等同/);
});
