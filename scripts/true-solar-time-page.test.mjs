import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { equationOfTimeMinutes, toTrueSolar } from "../src/lib/bazi/solar-time.ts";
import { timezoneOffsetHours } from "../src/lib/bazi/cities.ts";
import { readRouteMeta, injectRouteMeta, injectStaticPage, renderTrueSolarStatic } from "./build-route-html.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const content = JSON.parse(read("src/lib/true-solar-time-content.json"));
const PATH = "/knowledge/true-solar-time";
const pad = (n) => String(n).padStart(2, "0");
const round1 = (n) => Math.round(n * 10) / 10;

test("every worked example equals what the chart engine computes (page cannot drift from code)", () => {
  assert.ok(content.examples.length >= 6);
  for (const e of content.examples) {
    const { year, month, day, hour, minute } = e.civil;
    const guess = Date.UTC(year, month - 1, day, hour, minute);
    let off = timezoneOffsetHours(e.timezone, new Date(guess));
    off = timezoneOffsetHours(e.timezone, new Date(guess - off * 3_600_000));
    const r = toTrueSolar({ year, month, day, hour, minute, longitude: e.longitude, tzOffsetHours: off });
    assert.equal(e.utcOffset, off, `${e.id} utcOffset`);
    assert.equal(e.longitudeMinutes, round1(4 * (e.longitude - off * 15)), `${e.id} longitude term`);
    assert.equal(e.eotMinutes, round1(equationOfTimeMinutes(new Date(Date.UTC(year, month - 1, day, hour, minute)))), `${e.id} EoT`);
    assert.equal(e.shiftMinutes, r.shiftMinutes, `${e.id} shift`);
    assert.equal(e.trueSolarStamp, `${r.year}-${pad(r.month)}-${pad(r.day)} ${pad(r.hour)}:${pad(r.minute)}`, `${e.id} result`);
    assert.equal(e.civilStamp, `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}`, `${e.id} civil stamp`);
  }
});

test("numbers quoted in prose match the examples and the engine", () => {
  const byId = Object.fromEntries(content.examples.map((e) => [e.id, e]));
  assert.equal(byId["syd-dst"].shiftMinutes, -65);
  assert.equal(byId["syd-std"].shiftMinutes, -1);
  assert.equal(byId["syd-midnight"].trueSolarStamp, "1990-01-14 23:25");
  // DST contributes exactly 60 minutes to the longitude term (Sydney, same longitude, UTC+11 vs UTC+10).
  assert.equal(round1(byId["syd-std"].longitudeMinutes - byId["syd-dst"].longitudeMinutes), 60);
  for (const key of ["zh-Hant", "zh-Hans", "en"]) {
    const south = JSON.stringify(content.locales[key].south);
    assert.match(south, /−65/);
    assert.match(south, /−1/);
    assert.match(south, /64/);
  }
  // Documented extremes of the equation of time (page says about −14 … +16 minutes).
  const feb = equationOfTimeMinutes(new Date(Date.UTC(2026, 1, 11)));
  const nov = equationOfTimeMinutes(new Date(Date.UTC(2026, 10, 3)));
  assert.ok(feb < -13.5 && feb > -15, `Feb EoT ${feb}`);
  assert.ok(nov > 15.5 && nov < 17, `Nov EoT ${nov}`);
});

test("quoted formula constants appear in the engine source", () => {
  const src = read("src/lib/bazi/solar-time.ts");
  for (const token of ["9.87", "7.53", "1.5", "- 81", "365", "4 * (input.longitude - input.tzOffsetHours * 15)"]) assert.ok(src.includes(token), `solar-time.ts missing ${token}`);
  for (const key of ["zh-Hant", "zh-Hans", "en"]) {
    const lines = content.locales[key].formula.lines.join(" ");
    for (const token of ["9.87", "7.53", "1.5", "81", "365", "15"]) assert.ok(lines.includes(token), `${key} formula missing ${token}`);
  }
});

test("all three locales carry the same structure and no simplified-only leftovers in zh-Hans", () => {
  const shape = (v) => (Array.isArray(v) ? v.map(shape) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)])) : typeof v);
  const base = JSON.stringify(shape(content.locales["zh-Hant"]));
  assert.equal(JSON.stringify(shape(content.locales["zh-Hans"])), base);
  assert.equal(JSON.stringify(shape(content.locales.en)), base);
  const hans = JSON.stringify(content.locales["zh-Hans"]);
  for (const ch of "採撥橢歷絕軌軸經時與對準線區資當並為於數級據較條點應專項實際這個從過還選運遠達鐘開關陽陰隱雜離難預領頭風飛體") assert.ok(!hans.includes(ch), `zh-Hans still contains traditional ${ch}`);
});

test("route, route-meta (3 languages), sitemap, knowledge link and llms.txt are all wired", () => {
  assert.ok(existsSync(join(ROOT, "src/routes/knowledge.true-solar-time.tsx")));
  assert.match(read("src/routes/knowledge.true-solar-time.tsx"), /createFileRoute\("\/knowledge\/true-solar-time"\)/);
  assert.match(read("src/routeTree.gen.ts"), /\/knowledge\/true-solar-time/);
  const { routes } = readRouteMeta();
  for (const lang of ["zh-Hant", "zh-Hans", "en"]) {
    assert.ok(routes[PATH][lang].title.length >= 20, `${lang} title`);
    assert.ok(routes[PATH][lang].description.length >= 60, `${lang} description`);
  }
  assert.match(read("public/sitemap.xml"), /<loc>https:\/\/zhao-wu\.com\/knowledge\/true-solar-time<\/loc>/);
  assert.match(read("public/llms.txt"), /knowledge\/true-solar-time/);
  assert.match(read("src/routes/knowledge.tsx"), /to="\/knowledge\/true-solar-time"/);
  assert.match(read("index.html"), /href="\/knowledge\/true-solar-time"/);
});

test("static HTML: route-specific body, own JSON-LD (Article + FAQPage + BreadcrumbList), canonical/meta, no homepage shell", () => {
  const { origin, routes } = readRouteMeta();
  const shell = `<!doctype html><html lang="zh-Hant"><head><title>home</title>
<meta name="description" content="home desc" /><link rel="canonical" href="https://zhao-wu.com/" />
<meta property="og:title" content="home" /><meta property="og:description" content="home" /><meta property="og:url" content="https://zhao-wu.com/" />
<meta name="twitter:title" content="home" /><meta name="twitter:description" content="home" />
<script type="application/ld+json">{"@type":"WebSite"}</script></head>
<body><div id="root"><main class="zw-static-shell" lang="zh-Hant"><h1>昭梧｜昭於未見，梧於有歸</h1></main></div></body></html>`;
  const html = injectStaticPage(injectRouteMeta(shell, routes[PATH]["zh-Hant"], PATH, origin), PATH, origin);
  assert.match(html, /<link rel="canonical" href="https:\/\/zhao-wu\.com\/knowledge\/true-solar-time"/);
  assert.match(html, /<title>真太陽時怎麼算/);
  assert.ok(!html.includes("昭於未見，梧於有歸"), "homepage shell must be replaced");
  assert.match(html, /<h1>真太陽時怎麼算：經度差、均時差與夏令時<\/h1>/);
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(blocks.length, 1, "exactly one JSON-LD block (homepage WebSite block removed)");
  const graph = JSON.parse(blocks[0][1])["@graph"];
  assert.deepEqual(graph.map((n) => n["@type"]), ["Article", "FAQPage", "BreadcrumbList"]);
  assert.equal(graph[1].mainEntity.length, content.locales["zh-Hant"].faq.items.length);
  assert.doesNotMatch(html, /aggregateRating|review/i);
  // every FAQ question in JSON-LD is also visible in the static body
  for (const q of graph[1].mainEntity) assert.ok(html.includes(`<h3>${q.name}</h3>`), `FAQ question not visible: ${q.name}`);
  // all example rows are in the static table
  for (const e of content.examples) assert.ok(html.includes(e.trueSolarStamp), `static table missing ${e.id}`);
  const hub = injectStaticPage(shell, "/knowledge", origin);
  for (const path of ["true-solar-time", "five-elements-tone-qi", "shushu-boundary", "system-map"]) {
    assert.ok(hub.includes(`href="/knowledge/${path}"`), `hub missing ${path}`);
    if (path !== "true-solar-time") assert.ok(html.includes(`href="/knowledge/${path}"`));
  }
  assert.ok(renderTrueSolarStatic(origin).main.startsWith('<main class="zw-static-shell"'));
});
