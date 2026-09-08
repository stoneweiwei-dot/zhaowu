import assert from "node:assert/strict";
import { test } from "node:test";

const {
  TEN_GOD_FIVE_ELEMENT_INSTRUCTION,
  applyTenGodFiveElementRuntimePolicy,
  buildTenGodFiveElementRuntimeText,
} = await import("../src/lib/bazi/ten-god-five-element-runtime.ts");
const actions = await import("../src/lib/actions.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");

function chartStub() {
  return {
    dayMaster: "壬",
    dayMasterElement: "水",
    usefulProvisional: false,
    useful: ["火"],
    drain: ["土"],
    pillars: [
      { key: "year", ready: true, gan: "戊", ganElement: "土", shiShenGan: "七殺", hide: [] },
      { key: "month", ready: true, gan: "丙", ganElement: "火", shiShenGan: "偏財", hide: [{ gan: "辛", shiShen: "正印", element: "金" }] },
      { key: "day", ready: true, gan: "壬", ganElement: "水", shiShenGan: "日主", hide: [{ gan: "壬", shiShen: "日主", element: "水" }] },
      { key: "time", ready: true, gan: "丙", ganElement: "火", shiShenGan: "偏財", hide: [] },
    ],
  };
}

function readingStub() {
  return {
    kind: "self",
    directAnswer: "x",
    rhythm: "原始節奏",
    work: "",
    love: "",
    money: "",
    body: "",
    home: "",
    action: "",
    decree: "",
    lastLine: "",
    guide: { colors: [], avoidColors: [], directions: { favor: [], rest: [] }, hours: { favor: [], drain: [] }, pet: "" },
  };
}

test("十神 × 五行協議是 production runtime，優先級在病藥之前", () => {
  assert.equal(TEN_GOD_FIVE_ELEMENT_INSTRUCTION.status, "production");
  assert.equal(TEN_GOD_FIVE_ELEMENT_INSTRUCTION.layer, "bazi");
  assert.equal(TEN_GOD_FIVE_ELEMENT_INSTRUCTION.priority, 6);
});

test("壬日主的偏財按實際生剋落火，不把木固定當財", () => {
  const text = buildTenGodFiveElementRuntimeText(chartStub(), "zh-Hant");
  assert.match(text, /火偏財/);
  assert.match(text, /十神決定/);
  assert.match(text, /絕不是木固定等於財/);
  assert.match(text, /正\/偏、喜忌旺衰、透藏根氣與坐支/);
});

test("顯著度只標可見度，不冒充正式旺衰", () => {
  const text = buildTenGodFiveElementRuntimeText(chartStub(), "zh-Hant");
  assert.match(text, /顯著度索引/);
  assert.match(text, /不等於正式旺衰分數/);
});

test("runtime overlay 冪等，不會在追問或完整報告重複注入", () => {
  const once = applyTenGodFiveElementRuntimePolicy(chartStub(), readingStub(), "zh-Hant");
  const twice = applyTenGodFiveElementRuntimePolicy(chartStub(), once, "zh-Hant");
  assert.match(once.rhythm, /【十神 × 五行交叉】/);
  assert.equal(twice.rhythm, once.rhythm);
});

test("英文輸出使用英文協議，不殘留中文十神技術段", () => {
  const text = buildTenGodFiveElementRuntimeText(chartStub(), "en");
  assert.match(text, /\[Ten-God × Five-Element profile\]/);
  assert.match(text, /Fire Indirect Wealth/);
  assert.doesNotMatch(text, /十神|五行|偏財|七殺|喜忌/);
});

test("網站 analyzeLife 首次分析實際注入十神 × 五行交叉層", async () => {
  const result = await actions.analyzeLife({
    data: {
      question: "分析我的命局核心行為模式",
      locale: "zh-Hant",
      year: 1988,
      month: 10,
      day: 4,
      hour: 4,
      minute: 40,
      timeUnknown: false,
      gender: "male",
      relation: "unset",
      city: FEATURED_CITIES[0],
      liveCity: null,
      ziPolicy: "midnight",
      useTrueSolar: false,
    },
  });
  assert.match(result.reading.rhythm, /【十神 × 五行交叉】/);
  assert.match(result.reading.rhythm, /單格不得直接推出/);
});
