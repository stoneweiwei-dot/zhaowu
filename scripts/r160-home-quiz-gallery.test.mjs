import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("homepage (ZW-FE-02) routes Today into its own dedicated full-screen view instead of a persistent jump target", async () => {
  const home = await source("src/routes/index.tsx");
  assert.match(home, /昭梧 · 個人命書/);
  assert.match(home, /ZHAOWU · PERSONAL DESTINY BOOK/);
  assert.match(home, /const \[activeSection, setActiveSection\] = useState<Section \| null>\(null\)/);
  assert.match(home, /activeSection === "quiz"/);
  assert.match(home, /activeSection === "today"/);
  assert.match(home, /id="home-today-guide"/);
  assert.doesNotMatch(home, /aria-expanded=\{id === "today" \? undefined : activeSection === id\}/);
  assert.doesNotMatch(home, /title: "輕測驗"|title: "轻测验"/);
});

test("customer-facing public gallery exposes only approved Song report art plus restrained motifs", async () => {
  const atlas = await source("src/lib/public-atlas.ts");
  assert.match(atlas, /reportVisual\("library-report-art-jia-wood", "jia-wood"\)/);
  assert.match(atlas, /reportVisual\("library-report-art-gui-water", "gui-water"\)/);
  assert.match(atlas, /reportVisual\("library-report-art-yin-spring", "yin-spring"\)/);
  assert.match(atlas, /reportVisual\("library-report-art-chou-winter", "chou-winter"\)/);
  assert.match(atlas, /ornament\("ornament-lotus", "lotus"\)/);
  assert.doesNotMatch(atlas, /luck-wood|luck-fire|luck-earth|luck-metal|luck-water|celestial-pearl|endless-knot|pomegranate|twin-fish/);
});
