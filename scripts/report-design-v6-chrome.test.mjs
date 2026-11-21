import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("report v6 adds trilingual floating report navigation and page footer", async () => {
  const component = await source("src/components/paid-report-pages.tsx");
  const css = await source("src/zhaowu-design-system.css");
  assert.match(component, /data-report-design-v6/);
  assert.match(component, /zhaowu-v6-float-nav/);
  assert.match(component, /zhaowu-v6-together/);
  assert.match(component, /zhaowu-v6-contents/);
  assert.match(component, /zhaowu-v6-toc-menu/);
  assert.match(component, /昭梧・S 原創/);
  assert.match(component, /zhaowu-v6-page-number/);
  assert.match(component, /viewBox="0 0 36 28"/);
  assert.match(component, /setAttribute\("open", ""\)/);
  assert.match(css, /\.zhaowu-v6-report-pages[\s\S]*border: 1px solid rgba\(177, 143, 76/);
  assert.match(css, /\.zhaowu-v6-together \{ background: #c64d69/);
  assert.match(css, /\.zhaowu-v6-contents \{ background: #477fa8/);
  assert.match(css, /\.zhaowu-v6-page-footer[\s\S]*#efd4cf/);
});
