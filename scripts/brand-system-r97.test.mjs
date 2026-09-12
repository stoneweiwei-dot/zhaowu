import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const brand = await readFile(new URL("../src/components/brand-seal.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/brand-ui-r97.css", import.meta.url), "utf8");
const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");
const catalog = await readFile(new URL("../src/lib/brand-ui-catalog.ts", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const logo = await readFile(new URL("../public/brand-ui/header-gourd-wordmark-r113.png", import.meta.url));
const app = await readFile(new URL("../public/brand-ui/logo-app.svg", import.meta.url), "utf8");
const gourd = await readFile(new URL("../public/brand-ui/mark-gourd.svg", import.meta.url), "utf8");

test("P0 header mark uses the STO-12 owner artwork", () => {
  assert.match(brand, /HEADER_MARK = "\/brand-ui\/header-gourd-wordmark-r113\.png"/);
  assert.doesNotMatch(brand, /logo-primary\.svg/);
  assert.equal(logo.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(logo.readUInt32BE(16), 1024);
});

test("P0 app icon uses the separate gourd artwork sizes", () => {
  assert.match(app, /#1F4E3A/);
  assert.match(app, /rx="44"/);
  assert.match(html, /apple-touch-icon-r113\.png/);
  assert.match(html, /favicon-r113-32x32\.png/);
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
