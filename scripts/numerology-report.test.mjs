import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../src/routes/numerology.tsx", import.meta.url), "utf8");

test("numerology keeps master-number calculation and full mobile report structure", () => {
  assert.match(page, /value!==11 && value!==22 && value!==33/);
  assert.match(page, /五個核心詞/);
  assert.match(page, /中央命象/);
  assert.match(page, /五項天賦/);
  assert.match(page, /真正的人生課題/);
  assert.match(page, /適合發展方向/);
  assert.match(page, /現實行動/);
  assert.match(page, /snap-x snap-mandatory/);
  assert.match(page, /不是較高等級/);
  assert.match(page, /to="\/knowledge"/);
});
