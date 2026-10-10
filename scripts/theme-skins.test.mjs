import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const ts = readFileSync("src/lib/theme-skins.ts", "utf8");
const css = readFileSync("src/theme-skins.css", "utf8");
const html = readFileSync("index.html", "utf8");
const ids = [...ts.matchAll(/\{ id: "([a-z-]+)", ref: (\d+), mode: "(light|dark)"/g)].map((m) => ({ id: m[1], ref: +m[2], mode: m[3] }));

test("10 skins, refs 1..10, unique ids", () => {
  assert.equal(ids.length, 10);
  assert.deepEqual(ids.map((s) => s.ref).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(new Set(ids.map((s) => s.id)).size, 10);
});
test("every skin has tokens, hero var and art file", () => {
  for (const { id } of ids) {
    assert.ok(css.includes(`html[data-zws="${id}"] { --zws-page`) || css.includes(`html[data-zws="${id}"], `), `tokens for ${id}`);
    assert.ok(css.includes(`--zws-hero: url(/theme-skins/${id}-hero.webp)`), `hero var for ${id}`);
    assert.ok(existsSync(`public/theme-skins/${id}-hero.webp`), `art for ${id}`);
  }
});
test("pre-paint script dark list matches registry", () => {
  const dark = ids.filter((s) => s.mode === "dark").map((s) => s.id).sort();
  const inHtml = [...html.matchAll(/k === "([a-z-]+)"/g)].map((m) => m[1]).filter((x) => x !== "none").sort();
  assert.deepEqual(inHtml, dark);
});
test("skin CSS is inert without data-zws and loaded after the design system", () => {
  const main = readFileSync("src/main.tsx", "utf8");
  assert.ok(main.indexOf("zhaowu-design-system.css") < main.indexOf("theme-skins.css"));
  const bare = css.split("\n").filter((l) => /^(html body|html\[data-zws)/.test(l) === false && /^\s*(body|\.zw-|main)/.test(l));
  assert.equal(bare.length, 0, "no ungated top-level selectors");
});
test("site default is classic (no forced skin)", () => {
  assert.match(ts, /SITE_DEFAULT_SKIN = ""/);
});
