import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { calculateDualDestiny } from "../src/lib/dual-destiny.ts";
import { buildPalm } from "../src/lib/palm/engine.ts";
import { resolveTianjiBirth } from "../src/lib/tianji-xinggong.ts";

const STONE = {
  calendar: "solar",
  year: 1988,
  month: 10,
  day: 4,
  hour: 4,
  direction: "male",
};

test("双轨引擎复用两套权威算法，不另造第三套排盘", () => {
  const dual = calculateDualDestiny(STONE);
  const tianji = resolveTianjiBirth(STONE);
  const palm = buildPalm({
    year: 1988,
    month: 10,
    day: 4,
    hour: 4,
    timeUnknown: false,
    gender: "male",
  });

  assert.deepEqual(dual.tianji, tianji);
  assert.deepEqual(dual.palm, palm);
  assert.deepEqual(
    dual.palm.palaces.map((item) => item.zhi),
    ["辰", "亥", "戌", "子"],
  );
});

test("同一生日用西历或农历输入，双轨结果一致", () => {
  const solar = calculateDualDestiny(STONE);
  const lunar = solar.tianji.lunar;
  const fromLunar = calculateDualDestiny({
    calendar: "lunar",
    year: lunar.year,
    month: lunar.month,
    day: lunar.day,
    hour: 4,
    isLeap: lunar.isLeap,
    direction: "male",
  });

  assert.equal(fromLunar.tianji.result.palace, solar.tianji.result.palace);
  assert.deepEqual(
    fromLunar.palm.palaces.map((item) => item.zhi),
    solar.palm.palaces.map((item) => item.zhi),
  );
});

test("一掌经顺逆只改变一掌经，不污染天机星宫", () => {
  const forward = calculateDualDestiny(STONE);
  const reverse = calculateDualDestiny({ ...STONE, direction: "female" });

  assert.deepEqual(reverse.tianji, forward.tianji);
  assert.notDeepEqual(
    reverse.palm.palaces.map((item) => item.zhi),
    forward.palm.palaces.map((item) => item.zhi),
  );
});

test("客户页把结果说清楚，并彻底删除融合长文与系统话术", () => {
  const route = readFileSync(
    new URL("../src/routes/tianji-dual.tsx", import.meta.url),
    "utf8",
  );

  assert.match(route, /一个人，两种反应/);
  assert.match(route, /平时怎样做事/);
  assert.match(route, /压力来时的反应/);
  assert.match(route, /查看传统盘面/);
  assert.doesNotMatch(
    route,
    /buildDualFusion|fusion\.body|fusion\.guidance|融合星评|正向寄语|轨道 A|轨道 B|双轨结果/,
  );
});

test("性格两面保留独立路由，但不挤入新版首页长卷", () => {
  const home = readFileSync(
    new URL("../src/routes/index.tsx", import.meta.url),
    "utf8",
  );
  const route = readFileSync(
    new URL("../src/routes/tianji-dual.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(home, /to="\/tianji-dual"/);
  assert.doesNotMatch(home, /性格两面/);
  assert.doesNotMatch(home, /zhaowu-home-dual-entry/);
  assert.doesNotMatch(home, /双轨性格分析|zhaowu-tools-section/);
  assert.doesNotMatch(home, /to="\/tianji-xinggong"/);
  assert.doesNotMatch(home, /to="\/yizhangjing"/);
  assert.match(route, /calculateDualDestiny/);
  assert.doesNotMatch(route, /supabase|fetch\(|localStorage/);
});
