import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readRouteMeta } from "./build-route-html.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const PATH = "/knowledge/xiuxian-cultivation";
const LOCALES = ["zh-Hant", "zh-Hans", "en", "ja", "ko", "hi", "th", "id", "vi", "fil"];

test("route, route-meta (10 languages), sitemap, knowledge link and llms.txt are all wired", () => {
  assert.ok(existsSync(join(ROOT, "src/routes/knowledge.xiuxian-cultivation.tsx")));
  assert.match(read("src/routes/knowledge.xiuxian-cultivation.tsx"), /createFileRoute\("\/knowledge\/xiuxian-cultivation"\)/);
  assert.match(read("src/routeTree.gen.ts"), /\/knowledge\/xiuxian-cultivation/);
  const { routes } = readRouteMeta();
  for (const lang of LOCALES) {
    assert.ok(routes[PATH][lang].title.length >= 20, `${lang} title`);
    assert.ok(routes[PATH][lang].description.length >= 60, `${lang} description`);
  }
  assert.match(read("public/sitemap.xml"), new RegExp(`https://zhao-wu.com${PATH}`));
  assert.match(read("src/routes/knowledge.tsx"), /\/knowledge\/xiuxian-cultivation/);
  assert.match(read("public/llms.txt"), new RegExp(`https://zhao-wu.com${PATH}`));
  assert.match(read("scripts/build-route-html.mjs"), /\/knowledge\/xiuxian-cultivation/);
});

test("all three article locales carry the same structure and no simplified-only leftovers in zh-Hans", () => {
  const src = read("src/routes/knowledge.xiuxian-cultivation.tsx");
  const hans = src.match(/"zh-Hans": \{(.*?)\n  \},\n  en: \{/s)[1];
  for (const ch of "採撥橢歷絕軌軸經時與對準線區資當並為於數級據較條點應專項實際這個從過還選運遠達鐘開關陽陰隱雜離難預領頭風飛體") assert.ok(!hans.includes(ch), `zh-Hans still contains traditional ${ch}`);
});

test("article keeps cultivation separate from chart truth and links the quiz, not a transcript", () => {
  const src = read("src/routes/knowledge.xiuxian-cultivation.tsx");
  assert.match(src, /\/quiz\/cultivation-destiny/);
  assert.match(src, /https:\/\/www\.instagram\.com\/reel\/DdpP9d6hycd\//);
  assert.match(src, /不是原片逐字稿/);
  assert.match(src, /不會改變任何人的八字/);
  assert.doesNotMatch(src, /逐字稿.{0,40}全文|全文逐字/);
});
