import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("closeout keeps the carried-forward time essay and all four local illustrations", async () => {
  const article = await readFile(new URL("../src/lib/life-view-long-form/time-is-it-faster.ts", import.meta.url), "utf8");
  const home = await readFile(new URL("../src/components/life-view-home-section.tsx", import.meta.url), "utf8");
  assert.match(article, /TIME_IS_IT_FASTER_LONG_FORM/);
  assert.match(article, /沒有可靠證據顯示物理時間本身正在整體加速/);
  assert.match(home, /TIME_IS_IT_FASTER_LONG_FORM/);
  for (const name of [
    "time-faster-hero.webp",
    "time-objective-subjective.webp",
    "time-16-hours.webp",
    "time-high-energy.webp",
  ]) {
    await access(new URL(`../public/articles/${name}`, import.meta.url));
    assert.match(article, new RegExp(name.replace(".", "\\.")));
  }
});
