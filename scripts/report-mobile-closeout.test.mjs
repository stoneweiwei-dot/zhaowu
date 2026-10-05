import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("mobile chart titles no longer participate in table column sizing", async () => {
  const component = await source("src/components/specialist-chart.tsx");
  const css = await source("src/specialist-chart.css");
  assert.match(component, /zw-chart-table-title/);
  assert.match(component, /caption className="zw-chart-caption"/);
  assert.match(css, /\.zw-chart-caption[\s\S]*position:absolute/);
  assert.match(css, /@media \(max-width:560px\)[\s\S]*\.zw-chart-table tbody\{display:grid/);
  assert.match(css, /content:attr\(data-label\)/);
});

test("illustrated report shows the next action once inside its own panel", async () => {
  const component = await source("src/components/illustrated-destiny-panel.tsx");
  assert.match(component, /basisEvidence = scene\.sourceEvidence\.filter/);
  assert.doesNotMatch(component, /<p>\{scene\.sourceClaim\}<\/p>/);
  assert.match(component, /<figcaption>\{scene\.caption\}<\/figcaption>/);
  assert.doesNotMatch(component, /<circle cx="197" cy="120" r="4"/);
});

test("share panel leaves STONE signature to the generated card itself", async () => {
  const component = await source("src/components/report-share-card.tsx");
  const utility = await source("src/lib/report/share-card.ts");
  assert.doesNotMatch(component, /zhaowu-share-watermark/);
  assert.match(utility, /STONE 原創/);
});

test("formal report inserts use the jade landscape emblem instead of the round mascot", async () => {
  const comic = await source("src/components/song-comic-layer.tsx");
  const insertStart = comic.indexOf("export function SongComicReportInsert");
  const shareStart = comic.indexOf("export function SongComicShareCard");
  const reportInsert = comic.slice(insertStart, shareStart);
  const shareCard = comic.slice(shareStart);
  assert.match(comic, /function ReportStemEmblem/);
  assert.match(reportInsert, /<ReportStemEmblem stem=\{stem\}/);
  assert.doesNotMatch(reportInsert, /<ComicMascot/);
  assert.match(shareCard, /<ReportStemEmblem stem=\{stem\}/);
});

test("phone report hierarchy quiets specialist systems and shrinks the floating guide", async () => {
  const design = await source("src/zhaowu-design-system.css");
  const dragon = await source("src/components/green-dragon-guide.tsx");
  const dragonCss = await source("src/green-dragon-guide.css");
  assert.match(design, /r224 — mobile report closeout/);
  assert.match(design, /\.zhaowu-unified-fold__teaser[\s\S]*font-weight: 500/);
  assert.match(design, /\.zhaowu-specialist-tree > summary span[\s\S]*display: none/);
  assert.match(dragon, /readingSurface/);
  assert.match(dragon, /is-reading-surface/);
  assert.match(dragonCss, /\.zhaowu-dragon-guide\.is-reading-surface[\s\S]*width: 3\.15rem/);
});
