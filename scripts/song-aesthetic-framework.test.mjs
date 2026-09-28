import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("the active Song aesthetic is documented as one canonical framework", async () => {
  const [framework, registry, state] = await Promise.all([
    source("docs/ZHAOWU-SONG-AESTHETIC-FRAMEWORK.md"),
    source("docs/INSTRUCTION-REGISTRY.md"),
    source("docs/CURRENT-STATE.md"),
  ]);

  assert.match(framework, /極致豐盛後的收斂/);
  assert.match(framework, /一套骨架/);
  assert.match(framework, /一窗之景/);
  assert.match(framework, /一紙承文/);
  assert.match(registry, /ZHAOWU-SONG-AESTHETIC-FRAMEWORK\.md/);
  assert.match(state, /豐盛後的收斂/);
});

test("the canonical stylesheet implements the paper, landscape and surface-aware contract", async () => {
  const css = await source("src/zhaowu-design-system.css");

  assert.match(css, /url\('\/wallpaper-song\.jpg'\)/);
  assert.match(css, /\.zhaowu-home-lead[\s\S]*?padding:\s*18px 2px 22px !important/);
  assert.match(css, /\.zhaowu-home-layout \.zhaowu-today-guide\{[^}]*background:#fbf7ee!important/);
  assert.match(css, /\[data-zw-theme="night"\] \.zhaowu-home-layout \.zhaowu-today-guide\{[^}]*background:#173f35!important/);
  assert.match(css, /\.zhaowu-home-sheet-shell :is\([^)]*\.zhaowu-focused-report[^)]*\)[\s\S]*?border-radius:\s*12px !important/);
});

test("no parallel final visual layer is introduced", async () => {
  const main = await source("src/main.tsx");
  const styleImports = [...main.matchAll(/import ['"]\.\/(.+?\.css)['"];?/g)].map((match) => match[1]);

  assert.deepEqual(styleImports.slice(-3), [
    "styles.css",
    "legacy-visual-compat.css",
    "zhaowu-design-system.css",
  ]);
});

