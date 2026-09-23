import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r188 adds the comic layer at exactly the three approved public touchpoints", async () => {
  const home = await source("src/routes/index.tsx");
  const report = await source("src/components/unified-birth-report.tsx");
  const comic = await source("src/components/song-comic-layer.tsx");

  assert.match(home, /<SongComicToday locale={locale}/);
  assert.match(report, /<SongComicReportInsert dayMaster={foundation\.dayMaster}/);
  assert.match(report, /<SongComicShareCard dayMaster={foundation\.dayMaster}/);

  assert.match(comic, /data-song-comic-today/);
  assert.match(comic, /data-song-comic-report/);
  assert.match(comic, /data-song-comic-share/);
});

test("r188 comic is a translation layer, not a new calculation or storage system", async () => {
  const comic = await source("src/components/song-comic-layer.tsx");
  assert.match(comic, /dayGanzhi/);
  assert.doesNotMatch(comic, /supabase|storage\.from|upload\(|createEngineReportRecord/i);
  assert.match(comic, /不替代正式命盤判斷/);
  assert.match(comic, /not a deterministic verdict/i);
});

test("r188 keeps the Song paper authority and mobile safety", async () => {
  const css = await source("src/zhaowu-design-system.css");
  assert.match(css, /r188 — Song editorial skeleton \+ quiet comic translation layer/);
  assert.match(css, /\.zhaowu-song-comic--today[\s\S]*grid-template-columns/);
  assert.match(css, /html\[data-zw-theme="night"\] :is\(\.zhaowu-song-comic, \.zhaowu-song-comic-share\)/);
  assert.match(css, /@media \(max-width: 390px\)[\s\S]*\.zhaowu-song-comic--report/);
  assert.doesNotMatch(css, /\.zhaowu-song-comic[^\n]*position:\s*fixed/);
});
