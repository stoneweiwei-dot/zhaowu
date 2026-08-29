import assert from "node:assert/strict";
import { test } from "node:test";

const {
  applyFourTombsRuntimePolicy,
  buildFourTombsRuntimeText,
  hasNatalFourTombs,
} = await import("../src/lib/bazi/four-tombs-runtime.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");
const actions = await import("../src/lib/actions.ts");

function pillar(key, zhi) {
  return { key, zhi, ready: true };
}

test("壬日主見辰：本氣七殺與庫氣劫財分開，不再寫成七殺庫", () => {
  const chart = {
    dayMaster: "壬",
    pillars: [pillar("year", "辰"), pillar("month", "酉"), pillar("day", "辰"), pillar("time", "寅")],
  };
  const text = buildFourTombsRuntimeText(chart);
  assert.match(text, /本氣戊七殺/);
  assert.match(text, /庫氣癸劫財/);
  assert.match(text, /雙辰/);
  assert.match(text, /辰酉合/);
  assert.doesNotMatch(text, /七殺庫/);
});

test("四柱無辰戌丑未：四庫 runtime 不注入任何內容", () => {
  const chart = {
    dayMaster: "壬",
    pillars: [pillar("year", "子"), pillar("month", "卯"), pillar("day", "午"), pillar("time", "酉")],
  };
  assert.equal(hasNatalFourTombs(chart), false);
  assert.equal(buildFourTombsRuntimeText(chart), "");
});

test("孤立四庫先標庫在而未動，不為完整而硬斷開庫", () => {
  const chart = {
    dayMaster: "庚",
    pillars: [pillar("year", "辰"), pillar("month", "巳"), pillar("day", "申"), pillar("time", "亥")],
  };
  const text = buildFourTombsRuntimeText(chart);
  assert.match(text, /庫在而未動/);
  assert.match(text, /不等於藏干力量排名/);
});

test("四庫 runtime overlay 冪等，不會重複塞入報告", () => {
  const chart = {
    dayMaster: "壬",
    pillars: [pillar("year", "辰"), pillar("month", "酉"), pillar("day", "辰"), pillar("time", "寅")],
  };
  const reading = { rhythm: "原始節奏" };
  const once = applyFourTombsRuntimePolicy(chart, reading);
  const twice = applyFourTombsRuntimePolicy(chart, once);
  assert.match(once.rhythm, /【四庫專析】/);
  assert.equal(twice.rhythm, once.rhythm);
});

test("網站 analyzeLife 遇四庫命盤會實際注入四庫專析", async () => {
  const result = await actions.analyzeLife({
    data: {
      question: "分析我的命局核心結構",
      year: 1988,
      month: 10,
      day: 4,
      hour: 3,
      minute: 30,
      timeUnknown: false,
      gender: "male",
      relation: "unset",
      city: FEATURED_CITIES[0],
      liveCity: null,
      ziPolicy: "midnight",
      useTrueSolar: false,
    },
  });
  assert.match(result.reading.rhythm, /【四庫專析】/);
  assert.match(result.reading.rhythm, /本氣/);
  assert.match(result.reading.rhythm, /庫氣/);
  assert.match(result.reading.rhythm, /雙辰/);
});
