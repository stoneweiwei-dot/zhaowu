import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const brand = await readFile(new URL("../src/components/brand-seal.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/brand-ui-r97.css", import.meta.url), "utf8");
const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");
const catalog = await readFile(new URL("../src/lib/brand-ui-catalog.ts", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const logo = await readFile(new URL("../public/brand-ui/logo-primary.svg", import.meta.url), "utf8");
const app = await readFile(new URL("../public/brand-ui/logo-app.svg", import.meta.url), "utf8");
const gourd = await readFile(new URL("../public/brand-ui/mark-gourd.svg", import.meta.url), "utf8");

test("P0 header mark is the circular pine-sun lockup, not the gourd", () => {
  assert.match(brand, /OFFICIAL_MARK = "\/brand-ui\/logo-primary\.svg"/);
  assert.doesNotMatch(brand, /gourd-180|logo-icon-gourd|data:image\/png/);
  assert.match(logo, /#FAF8F1|#D4B074|#1F4E3A/);
  assert.match(logo, /昭/);
  assert.match(logo, /梧/);
});

test("P0 app icon is the dark pine rounded seal", () => {
  assert.match(app, /#1F4E3A/);
  assert.match(app, /rx="44"/);
  assert.match(html, /apple-touch-icon-r97\.png/);
  assert.match(html, /\/brand-ui\/favicon\.svg/);
});

test("P0 buttons follow gold primary and ivory secondary", () => {
  const r97 = main.lastIndexOf("./brand-ui-r97.css");
  const hotfix = main.indexOf("./visual-hotfix-r94.css");
  assert.ok(r97 > hotfix);
  assert.match(css, /background: #d4b074/);
  assert.match(css, /color: #1f4e3a/);
  assert.match(css, /background: #faf8f1/);
});

test("gourd remains a special-function mark and is not the header logo", () => {
  assert.match(catalog, /mark-gourd/);
  assert.match(catalog, /不搶主 Logo|Auspicious functions only/);
  assert.match(gourd, /葫蘆吉祥標/);
  assert.doesNotMatch(gourd, /Grok|AI生成/);
});

test("home keeps at most pine + mountain as active decorative motifs", () => {
  assert.match(css, /--zw-brand-ornament-pine/);
  assert.match(css, /--zw-brand-divider-mountain/);
  assert.match(css, /\.zhaowu-site-header::after \{\s*content: none;/);
  assert.match(css, /\.zhaowu-home-portals > \*::after,\s*\.zhaowu-site-footer::before \{\s*content: none/);
});
