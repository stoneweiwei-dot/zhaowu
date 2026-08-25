import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateTianjiXinggong,
  TIANJI_HOURS,
  TIANJI_MONTHS,
  TIANJI_PALACE_TABLE,
} from "../src/lib/tianji-xinggong.ts";

const EXPECTED = {
  正: ["卯", "寅", "丑", "子", "亥", "戌", "酉", "申", "未", "午", "巳", "辰"],
  二: ["寅", "丑", "子", "亥", "戌", "酉", "申", "未", "午", "巳", "辰", "卯"],
  三: ["丑", "子", "亥", "戌", "酉", "申", "未", "午", "巳", "辰", "卯", "寅"],
  四: ["子", "亥", "戌", "酉", "申", "未", "午", "巳", "辰", "卯", "寅", "丑"],
  五: ["亥", "戌", "酉", "申", "未", "午", "巳", "辰", "卯", "寅", "丑", "子"],
  六: ["戌", "酉", "申", "未", "午", "巳", "辰", "卯", "寅", "丑", "子", "亥"],
  七: ["酉", "申", "未", "午", "巳", "辰", "卯", "寅", "丑", "子", "亥", "戌"],
  八: ["申", "未", "午", "巳", "辰", "卯", "寅", "丑", "子", "亥", "戌", "酉"],
  九: ["未", "午", "巳", "辰", "卯", "寅", "丑", "子", "亥", "戌", "酉", "申"],
  十: ["午", "巳", "辰", "卯", "寅", "丑", "子", "亥", "戌", "酉", "申", "未"],
  冬: ["巳", "辰", "卯", "寅", "丑", "子", "亥", "戌", "酉", "申", "未", "午"],
  腊: ["辰", "卯", "寅", "丑", "子", "亥", "戌", "酉", "申", "未", "午", "巳"],
};

test("站主提供的 12×12 原表共 144 格逐格一致", () => {
  assert.deepEqual(TIANJI_MONTHS, Object.keys(EXPECTED));
  for (const month of TIANJI_MONTHS) {
    for (let i = 0; i < TIANJI_HOURS.length; i += 1) {
      const hour = TIANJI_HOURS[i];
      const expectedPalace = EXPECTED[month][i];
      assert.equal(TIANJI_PALACE_TABLE[month][hour], expectedPalace, `${month}月${hour}时查表错误`);
      assert.equal(calculateTianjiXinggong(month, hour, false).palace, expectedPalace, `${month}月${hour}时计算错误`);
    }
  }
});

test("正月子时落卯宫", () => {
  const result = calculateTianjiXinggong("正", "子", false);
  assert.equal(result.palace, "卯");
  assert.equal(result.star, "天赦星");
});

test("五月午时落巳宫", () => {
  const result = calculateTianjiXinggong("五", "午", false);
  assert.equal(result.palace, "巳");
  assert.equal(result.star, "天文星");
});

test("九月卯时落辰宫", () => {
  const result = calculateTianjiXinggong("九", "卯", false);
  assert.equal(result.palace, "辰");
  assert.equal(result.star, "天如星");
});

test("过中气后月份顺延一位，再按原表查宫", () => {
  const result = calculateTianjiXinggong("七", "子", true);
  assert.equal(result.correctedMonth, "八");
  assert.equal(result.palace, "申");
});

test("腊月过中气后回到正月，再按原表查宫", () => {
  const result = calculateTianjiXinggong("腊", "子", true);
  assert.equal(result.correctedMonth, "正");
  assert.equal(result.palace, "卯");
});
