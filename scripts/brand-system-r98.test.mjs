import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");
const catalog = await readFile(new URL("../src/lib/brand-ui-catalog.ts", import.meta.url), "utf8");
const shell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/brand-ui-r98.css", import.meta.url), "utf8");
const brand = await readFile(new URL("../src/components/brand-seal.tsx", import.meta.url), "utf8");
const icons = await readdir(new URL("../public/brand-ui/icons", import.meta.url));
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const slip = await readFile(new URL("../src/components/daily-almanac-widget.tsx", import.meta.url), "utf8");
const library = await readFile(new URL("../src/components/brand-ui-library.tsx", import.meta.url), "utf8");

const REQUIRED_ICONS = [
  "home", "articles", "reports", "calendar", "search", "account", "login",
  "bookmark", "favorite", "share", "settings", "language", "history", "message",
  "insight", "night", "day", "lock", "payment",
];

test("P1 ships the 19 kit functional icons", () => {
  for (const name of REQUIRED_ICONS) {
    assert.ok(icons.includes(`${name}.svg`), `missing ${name}.svg`);
    assert.match(catalog, new RegExp(`icon\\("${name}"`));
  }
});

test("r98 CSS is last-wins after r97 and wires night tokens", () => {
  const r97 = main.lastIndexOf("./brand-ui-r97.css");
  const r98 = main.lastIndexOf("./brand-ui-r98.css");
  assert.ok(r98 > r97);
  assert.match(css, /data-zw-theme="night"/);
  assert.match(css, /#0a1311|#0A1311|#0b2f26|#0B2F26/);
  assert.match(css, /\.zw-brand-icon/);
  assert.match(html, /zhaowu\.theme\.v1/);
});

test("header uses kit icons and night toggle; gourd stays off the header", () => {
  assert.match(shell, /BrandIcon name="login"/);
  assert.match(shell, /BrandIcon name="account"/);
  assert.match(shell, /BrandIcon name="home"/);
  assert.match(shell, /zhaowu-theme-toggle/);
  assert.match(shell, /logoHorizontal/);
  assert.doesNotMatch(shell, /mark-gourd/);
  assert.match(brand, /OFFICIAL_MARK = "\/brand-ui\/logo-primary\.svg"/);
  assert.match(brand, /NIGHT_MARK = "\/brand-ui\/logo-primary-night\.svg"/);
});

test("gourd is reserved for the spirit slip and catalog special function", () => {
  assert.match(slip, /mark-gourd\.svg/);
  assert.match(catalog, /不搶主 Logo|Auspicious functions only/);
  assert.match(catalog, /inUse: true, group: "mark"/);
});

test("owner Brand UI library is grouped and not mixed with gallery assets", () => {
  assert.match(library, /BRAND_UI_GROUPS/);
  assert.match(library, /data-brand-section/);
  assert.match(catalog, /group: "seal"/);
  assert.match(catalog, /group: "frame"/);
  assert.match(catalog, /group: "icon"/);
});
