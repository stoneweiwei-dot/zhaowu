import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../src/routes/numerology.tsx", import.meta.url), "utf8");
const lib = await readFile(new URL("../src/lib/numerology.ts", import.meta.url), "utf8");
const text = `${page}\n${lib}`;

test("numerology keeps master-number calculation and full mobile report structure", () => {
  assert.match(text, /value!==11 && value!==22 && value!==33|value !== 11 && value !== 22 && value !== 33/);
  assert.match(page, /五個核心詞/);
  assert.match(page, /中央命象/);
  assert.match(page, /五項天賦/);
  assert.match(page, /真正的人生課題/);
  assert.match(page, /適合發展方向/);
  assert.match(page, /現實行動/);
  assert.match(page, /snap-x snap-mandatory/);
  assert.match(page, /不是較高等級/);
  assert.match(page, /to="\/knowledge"/);
  assert.match(page, /靈魂獨白/);
  assert.match(page, /人生角色/);
  assert.match(lib, /「起點在我/);
  assert.match(lib, /大願要能落地/);
  assert.match(lib, /關懷是力量，不是自我消失/);
  assert.doesNotMatch(text, /星友荟|七哥聊生命数字|贴图号/);
});
