import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { test } from "node:test";

const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");
test("almanac and today's sky have equal level, keyboard-operable entrances", async () => {
  const index = await read("src/routes/index.tsx");
  const tree = await read("src/components/home-tree.tsx");
  assert.match(index, /zw-today-dual-nav/);
  assert.match(index, /todayFocus === "almanac"/);
  assert.match(index, /todayFocus === "sky"/);
  assert.match(index, /aria-pressed=/);
  assert.match(tree, /href: '\/sky-events#sky-week'/);
  for (const word of ["今日黃曆", "今日黄历", "今日星象", "Today’s sky"]) {
    assert.ok(index.includes(word) || tree.includes(word), "missing nav locale: " + word);
  }
});
test("weekly sky journal is above the article and never hidden in details", async () => {
  const route = await read("src/routes/sky-events.tsx");
  assert.ok(route.indexOf('<section className="sky-week-public"') < route.indexOf('<article className="sky-event-article"'));
  assert.match(route, /<TodaySkyCards \/>/);
  assert.doesNotMatch(route, /<details className="sky-section-disclosure sky-week-disclosure"/);
});
test("new layout uses local real landscape assets and stays phone responsive", async () => {
  const css = await read("src/sky-art-restore.css");
  const cards = await read("src/components/today-sky-cards.tsx");
  assert.match(cards, /sky-art-restore\.css/);
  assert.match(css, /max-width:520px/);
  assert.match(css, /minmax\(0,1fr\)/);
  assert.doesNotMatch(css, /fonts\.googleapis|fonts\.gstatic|url\(https?:/);
  const assets = [...css.matchAll(/url\("([^"]+\.webp)"\)/g)].map((x) => x[1]);
  assert.ok(assets.length > 2);
  for (const file of new Set(assets)) {
    const bytes = await readFile(new URL("../public" + file, import.meta.url));
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF", file + " must be real RIFF WebP art");
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP", file + " must be actual WebP");
  }
});
test("stale astronomy never pretends to be an up-to-date forecast", async () => {
  const home = await read("src/components/sky-events-home-section.tsx");
  assert.match(home, /getTodaySkyReportWindow/);
  assert.match(home, /currentSydneyDate/);
  assert.match(home, /歷史週報/);
  assert.match(home, /<TodaySkyCards \/>/);
});

test("owner supplied Star Imagery crop is an actual tracked WebP painting, not CSS geometry", async () => {
  const css = await read("src/sky-art-restore.css");
  const path = "public/sky-art/stone-star-imagery-original-detail.webp";
  const bytes = await readFile(new URL("../" + path, import.meta.url));
  assert.match(css, /sky-art\/stone-star-imagery-original-detail\.webp/);
  assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
  assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
  assert.equal(createHash("sha256").update(bytes).digest("hex"), "5b47abe9b2af3fbe56a26b8e1625b5243fa345696b8368fbe5354d5039bc2207");
});
