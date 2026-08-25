import assert from "node:assert/strict";
import test from "node:test";
import { calculateTianjiXinggong } from "../src/lib/tianji-xinggong.ts";

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

test("过中气后月份顺延一位", () => {
  const result = calculateTianjiXinggong("七", "子", true);
  assert.equal(result.correctedMonth, "八");
  assert.equal(result.palace, "申");
});

test("腊月过中气后回到正月", () => {
  const result = calculateTianjiXinggong("腊", "子", true);
  assert.equal(result.correctedMonth, "正");
  assert.equal(result.palace, "卯");
});
