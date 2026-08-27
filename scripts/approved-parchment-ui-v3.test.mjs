import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("owner-approved parchment v3 is the final visual lock", async () => {
  const main = await read("src/main.tsx");
  assert.match(main, /approved-parchment-ui-v3\.css/);
  assert.ok(main.indexOf("approved-parchment-ui-v3.css") > main.indexOf("approved-mobile-ui-v2.css"));
  assert.ok(main.indexOf("approved-parchment-ui-v3.css") > main.indexOf("focused-report.css"));
});

test("parchment v3 removes purple report and dual-tool skins from the active visual path", async () => {
  const css = await read("src/approved-parchment-ui-v3.css");
  assert.match(css, /\.zhaowu-focused-report[\s\S]*--zv3-paper/);
  assert.match(css, /\.zhaowu-report-section[\s\S]*rgba\(247, 238, 220, \.34\)/);
  assert.match(css, /\.dual-page[\s\S]*--dual-night:\s*#efe1c6/);
  assert.match(css, /Decree area:/);
  assert.doesNotMatch(css, /#2b123d|#180a27|#100719|#311446|#1b0b2b|#12071d/);
});

test("wallpaper and cards use one warm translucent material family", async () => {
  const css = await read("src/approved-parchment-ui-v3.css");
  assert.match(css, /--zv3-paper:\s*rgba\(246, 236, 217, \.34\)/);
  assert.match(css, /\.zhaowu-has-wallpaper \.zhaowu-app-frame[\s\S]*rgba\(244, 233, 212, \.075\)/);
  assert.match(css, /\.zhaowu-home-hero[\s\S]*var\(--zv3-paper\)/);
  assert.match(css, /#analysisForm[\s\S]*var\(--zv3-paper-field\)/);
  assert.match(css, /--zv3-red:\s*#b4372b/);
  assert.match(css, /--zv3-jade:\s*#2f7465/);
});

test("standalone Tianji Xinggong uses the same parchment system with no purple skin", async () => {
  const css = await read("src/tianji-xinggong.css");
  assert.match(css, /--tj-bg:\s*#efe1c6/);
  assert.match(css, /--tj-panel:\s*rgba\(247, 238, 220, \.34\)/);
  assert.match(css, /\.tianji-calendar-tabs button\[aria-selected="true"\][\s\S]*#2f7465/);
  assert.match(css, /\.tianji-button[\s\S]*#b4372b[\s\S]*#982d25/);
  assert.doesNotMatch(css, /#10051d|#281041|#3a1853|#0e0619|#0c0515|#311446|#2b123d/);
});
