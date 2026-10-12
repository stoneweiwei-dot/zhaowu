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
const full = readFileSync("src/theme-skins-full.css", "utf8");
test("every skin has tokens, a full-set definition and crisp art on disk", () => {
  for (const { id } of ids) {
    assert.ok(css.includes(`html[data-zws="${id}"] { --zws-page`) || css.includes(`html[data-zws="${id}"], `), `tokens for ${id}`);
    const m = ts.match(new RegExp(`id: "${id}"[^\\n]*hero: "([^"]+)"[^\\n]*focus: "([^"]+)"`));
    assert.ok(m, `hero + focus for ${id}`);
    assert.ok(existsSync(`public${m[1]}`), `art file for ${id}: ${m[1]}`);
    assert.ok(full.includes(`html[data-zws="${id}"]`), `full-set rules for ${id}`);
  }
});
test("full set paints every page, cards, type and almanac from the skin", () => {
  for (const needle of ["--zws-art", "--zws-card-orn", "--zws-font-d", "zw-ink-board", "zhaowu-site-header", "#life-view"]) {
    assert.ok(full.includes(needle), `theme-skins-full.css covers ${needle}`);
  }
  const main = readFileSync("src/main.tsx", "utf8");
  assert.ok(main.indexOf("theme-skins.css") < main.indexOf("theme-skins-full.css"));
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
