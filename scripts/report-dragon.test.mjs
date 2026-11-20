import assert from "node:assert/strict";
import { test } from "node:test";

const { REPORT_DRAGON_ASSETS, selectReportDragon } = await import("../src/lib/report/report-dragon.ts");

function section(key, title, body) {
  return {
    sectionNo: 1,
    pageNo: 1,
    key,
    title,
    body: [body],
    evidence: { facts: [], conditions: [], limits: [], checks: [] },
  };
}

test("all three watercolor packs expose 27 unique report reactions", () => {
  const assets = Object.values(REPORT_DRAGON_ASSETS);
  assert.equal(assets.length, 27);
  assert.deepEqual(new Set(assets.map((item) => item.sheet)), new Set([1, 2, 3]));
  assert.equal(new Set(assets.map((item) => `${item.sheet}-${item.row}-${item.column}`)).size, 27);
});

test("report emotion selection follows the section meaning", () => {
  assert.equal(selectReportDragon(section("basis", "命理依据", "这里只解释判断依据。 ")).tone, "reflection");
  assert.equal(selectReportDragon(section("action", "现实行动", "现在推进一个可以执行的下一步。 ")).tone, "progress");
  assert.equal(selectReportDragon(section("relationship", "关系与对象", "观察伴侣是否持续联系。 ")).tone, "love");
  assert.equal(selectReportDragon(section("timing", "身心节奏", "先恢复睡眠和休息。 ")).tone, "recovery");
  assert.equal(selectReportDragon(section("conclusion", "直接结论", "已有疼痛就及时去看医生。 ")).tone, "concern");
  assert.equal(selectReportDragon(section("conclusion", "直接结论", "这段关系结束后会有失落。 ")).tone, "distress");
});

test("the same report section always receives the same dragon", () => {
  const input = section("timing", "时间与节奏", "先观察窗口，再决定什么时候行动。 ");
  assert.deepEqual(selectReportDragon(input), selectReportDragon(input));
});
