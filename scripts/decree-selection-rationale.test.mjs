import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync(new URL("../src/main.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/decree-selection-rationale.css", import.meta.url), "utf8");

test("decree rationale is mounted under final images in all locales", () => {
  assert.match(main, /decree-selection-rationale\.css/);
  assert.match(css, /\.zhaowu-generated-decree::after/);
  assert.match(css, /img\[alt="命誥圖完成"\]/);
  assert.match(css, /img\[alt="命诰图完成"\]/);
  assert.match(css, /img\[alt="Decree image ready"\]/);
  assert.match(css, /這不是隨機抽圖/);
  assert.match(css, /这不是随机抽图/);
  assert.match(css, /It was not picked at random/);
});
