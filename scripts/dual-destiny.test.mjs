import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { calculateDualDestiny, buildDualFusion } from "../src/lib/dual-destiny.ts";
import { buildPalm } from "../src/lib/palm/engine.ts";
import { resolveTianjiBirth } from "../src/lib/tianji-xinggong.ts";

const STONE = { calendar: "solar", year: 1988, month: 10, day: 4, hour: 4, direction: "male" };

test("双轨引擎复用两套权威算法，不另造第三套排盘", () => {
  const dual = calculateDualDestiny(STONE);
  const tianji = resolveTianjiBirth(STONE);
  const palm = buildPalm({ year: 1988, month: 10, day: 4, hour: 4, timeUnknown: false, gender: "male" });

  assert.deepEqual(dual.tianji, tianji);
  assert.deepEqual(dual.palm, palm);
  assert.deepEqual(dual.palm.palaces.map((item) => item.zhi), ["辰", "亥", "戌", "子"]);
});

test("同一生日用西历或农历输入，双轨结果一致", () => {
  const solar = calculateDualDestiny(STONE);
  const lunar = solar.tianji.lunar;
  const fromLunar = calculateDualDestiny({ calendar: "lunar", year: lunar.year, month: lunar.month, day: lunar.day, hour: 4, isLeap: lunar.isLeap, direction: "male" });

  assert.equal(fromLunar.tianji.result.palace, solar.tianji.result.palace);
  assert.deepEqual(fromLunar.palm.palaces.map((item) => item.zhi), solar.palm.palaces.map((item) => item.zhi));
});

test("一掌经顺逆只改变一掌经，不污染天机星宫", () => {
  const forward = calculateDualDestiny(STONE);
  const reverse = calculateDualDestiny({ ...STONE, direction: "female" });

  assert.deepEqual(reverse.tianji, forward.tianji);
  assert.notDeepEqual(reverse.palm.palaces.map((item) => item.zhi), forward.palm.palaces.map((item) => item.zhi));
});

test("三语融合星评包含外在、内在与行动建议，英文不混入中文", () => {
  const result = calculateDualDestiny(STONE);
  const hans = buildDualFusion(result, "zh-Hans");
  const english = buildDualFusion(result, "en");

  assert.match(hans.body, /天机命宫/);
  assert.match(hans.body, /一掌经时宫/);
  assert.ok(hans.guidance.length > 8);
  assert.doesNotMatch(english.body, /[\u3400-\u9fff]/);
  assert.doesNotMatch(english.guidance, /[\u3400-\u9fff]/);
});

test("主页只有一个双轨入口，独立旧路由保留兼容但不再分散主页", () => {
  const home = readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
  const route = readFileSync(new URL("../src/routes/tianji-dual.tsx", import.meta.url), "utf8");

  assert.match(home, /to="\/tianji-dual"/);
  assert.doesNotMatch(home, /to="\/tianji-xinggong"/);
  assert.doesNotMatch(home, /to="\/yizhangjing"/);
  assert.match(route, /calculateDualDestiny/);
  assert.doesNotMatch(route, /supabase|fetch\(|localStorage/);
});

test("双轨结果切换语言时重新本地化校时、宫位和英文盘心", () => {
  const route = readFileSync(new URL("../src/routes/tianji-dual.tsx", import.meta.url), "utf8");

  assert.match(route, /localizeCityHit\(birthCity, locale\)\.display/);
  assert.match(route, /locale === "zh-Hans" \? "宫" : "宮"/);
  assert.match(route, /EN_BRANCH\[active as TianjiPalace\]/);
  assert.match(route, /locale === "en" \? "AB" : "合"/);
  assert.doesNotMatch(route, /setTimeNote\(`\$\{copy\.corrected\}/);
});
