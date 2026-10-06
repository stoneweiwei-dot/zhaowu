import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("homepage keeps self-discovery collapsed while Today stays a persistent jump target", async () => {
  const home = await source("src/routes/index.tsx");
  assert.match(home, /昭梧 · 個人命書/);
  assert.match(home, /ZHAOWU · PERSONAL DESTINY BOOK/);
  assert.match(home, /const \[activeSection, setActiveSection\] = useState<Section \| null>\(null\)/);
  assert.match(home, /activeSection === "quiz"/);
  assert.match(home, /aria-expanded=\{id === "today" \? undefined : activeSection === id\}/);
  assert.match(home, /aria-controls=\{id === "today" \? "home-today-guide" : undefined\}/);
  assert.match(home, /id="home-today-guide"/);
  assert.doesNotMatch(home, /activeSection === "today"/);
  assert.doesNotMatch(home, /title: "輕測驗"|title: "轻测验"/);
});

test("customer-facing public gallery no longer displays portrait-heavy legacy art", async () => {
  const atlas = await source("src/lib/public-atlas.ts");
  assert.doesNotMatch(atlas, /report-visuals|reportVisual/);
  assert.match(atlas, /ornament\("ornament-lotus", "lotus"\)/);
});
