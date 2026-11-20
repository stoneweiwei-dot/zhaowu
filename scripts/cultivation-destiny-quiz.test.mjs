import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildChart } from "../src/lib/bazi/chart.ts";
import { deriveCultivationDestiny } from "../src/lib/fun-tests/cultivation-destiny.ts";

const birth = {
  year: 1988,
  month: 10,
  day: 4,
  hour: 4,
  minute: 40,
  timeUnknown: false,
  gender: "male",
  relation: "unset",
  city: {
    name: "Sanming",
    country: "China",
    display: "Sanming, Fujian, China",
    latitude: 26.2639,
    longitude: 117.6392,
    timezone: "Asia/Shanghai",
  },
  liveCity: null,
  ziPolicy: "midnight",
  useTrueSolar: true,
};

test("cultivation destiny is deterministic for the same chart and optional MBTI", () => {
  const chart = buildChart({ ...birth, question: "", locale: "zh-Hant" });
  const a = deriveCultivationDestiny({ chart, birthMonth: birth.month, birthDay: birth.day, locale: "zh-Hant", mbti: "INTJ" });
  const b = deriveCultivationDestiny({ chart, birthMonth: birth.month, birthDay: birth.day, locale: "zh-Hant", mbti: "INTJ" });
  assert.deepEqual(a, b);
  assert.equal(a.version, "cultivation_destiny_v1");
  assert.equal(a.elements.length, 5);
  assert.equal(a.dimensions.length, 6);
  assert.equal(a.paths.length, 9);
  assert.equal(a.sectFits.length, 5);
  assert.ok(a.paths.every((item) => item.score >= 1 && item.score <= 10));
  assert.ok(a.dimensions.every((item) => item.score >= 1 && item.score <= 10));
});

test("unknown birth time caps fictional spirit-root grade rather than inventing precision", () => {
  const chart = buildChart({ ...birth, hour: 12, minute: 0, timeUnknown: true, question: "", locale: "zh-Hant" });
  const result = deriveCultivationDestiny({ chart, birthMonth: birth.month, birthDay: birth.day, locale: "zh-Hant" });
  assert.ok(result.rootScore <= 5);
  assert.match(result.ziweiNote, /時辰未定/);
});

test("cultivation dossier route generates a 9:16 local PNG without Supabase or image-provider writes", async () => {
  const route = await readFile(new URL("../src/routes/quiz.cultivation-destiny.tsx", import.meta.url), "utf8");
  const home = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
  assert.match(route, /canvas\.width = 1080/);
  assert.match(route, /canvas\.height = 1920/);
  assert.match(route, /STONE 原創/);
  assert.match(route, /image\/png/);
  assert.doesNotMatch(route, /supabase|generate-decree-image|prepare-paid-visual/i);
  assert.match(home, /href: "\/quiz\/cultivation-destiny"/);
});
