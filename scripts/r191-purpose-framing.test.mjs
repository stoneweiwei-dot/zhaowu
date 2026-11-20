import assert from "node:assert/strict";
import test from "node:test";

const { analyzeLife } = await import("../src/lib/actions.ts");

const city = {
  name: "Sanming",
  display: "Sanming, Fujian, China",
  country: "CN",
  timezone: "Asia/Shanghai",
  latitude: 26.27,
  longitude: 117.65,
};

function input(locale) {
  return {
    question: "我為何而生？我的使命是什麼？",
    locale,
    year: 1988,
    month: 10,
    day: 4,
    hour: 4,
    minute: 40,
    timeUnknown: false,
    gender: "male",
    relation: "unset",
    city,
    liveCity: null,
    ziPolicy: "midnight",
    useTrueSolar: true,
  };
}

test("r191 purpose framing is the actual Traditional Chinese primary answer", async () => {
  const result = await analyzeLife({ data: input("zh-Hant") });
  assert.match(result.reading.directAnswer, /命理不能證明「上天為什麼安排你出生」/);
  assert.match(result.reading.directAnswer, /不替你指定唯一使命/);
  assert.match(result.reading.directAnswer, /五行平均/);
  assert.match(result.reading.directAnswer, /「缺什麼補什麼」/);
  assert.doesNotMatch(result.reading.directAnswer, /结论|证明|这张盘|反复课题/);
});

test("r191 purpose framing also has a Simplified Chinese customer answer", async () => {
  const result = await analyzeLife({ data: input("zh-Hans") });
  assert.match(result.reading.directAnswer, /命理不能证明“上天为什么安排你出生”/);
  assert.match(result.reading.directAnswer, /不替你指定唯一使命/);
  assert.match(result.reading.directAnswer, /“缺什么补什么”/);
});
