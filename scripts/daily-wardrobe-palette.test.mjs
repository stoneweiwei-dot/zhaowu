import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const profile = readFileSync(new URL("../src/lib/report/personal-paid-profile.ts", import.meta.url), "utf8");
const widget = readFileSync(new URL("../src/components/daily-almanac-widget.tsx", import.meta.url), "utf8");
const design = readFileSync(new URL("../src/zhaowu-design-system.css", import.meta.url), "utf8");
const skins = readFileSync(new URL("../src/theme-skins-full.css", import.meta.url), "utf8");

test("personal wardrobe maps every named colour to a distinct pigment sample", () => {
  const block = profile.match(/const COLOR_SWATCH_HEX:[\s\S]*?\n};/)?.[0] ?? "";
  const values = [...block.matchAll(/#[0-9a-f]{6}/gi)].map((match) => match[0].toLowerCase());
  assert.equal(values.length, 15);
  assert.equal(new Set(values).size, 15);
  assert.match(profile, /COLOR_SWATCH_HEX\[element\]\[index\]/);
  assert.doesNotMatch(profile, /ELEMENT_SWATCH/);
});

test("home wardrobe renders labelled colour cards for personal, daily and quiet palettes", () => {
  assert.match(widget, /data-wardrobe-palette/);
  assert.match(widget, /className="zhaowu-wardrobe-swatch"/);
  assert.match(widget, /wardrobeColourSwatches\(tone\.colors\)/);
  assert.match(widget, /data-wardrobe-note="today-colours"/);
  assert.match(widget, /personal\.quietColorSwatches/);
  assert.match(widget, /data-wardrobe-materials/);
});

test("daily wardrobe selects a local accessory illustration for each five-element recommendation", () => {
  const assets = new URL("../public/today/accessories/", import.meta.url);
  for (const [element, slug] of [["木", "wood"], ["火", "fire"], ["土", "earth"], ["金", "metal"], ["水", "water"]]) {
    assert.match(widget, new RegExp(`${element}: \\{ src: \\"/today/accessories/${slug}\\.webp\\"`));
    const image = readFileSync(new URL(`${slug}.webp`, assets));
    assert.equal(image.toString("ascii", 0, 4), "RIFF");
    assert.equal(image.toString("ascii", 8, 12), "WEBP");
  }
  assert.match(widget, /personal\?\.materialElement \?\? stemElement\(pillars\.day\[0\]\)/);
  assert.match(widget, /<WardrobeAccessoryArt element=\{accessoryElement\} locale=\{locale\} \/>/);
  assert.match(widget, /accessoryArt=\{<WardrobeAccessoryArt element=\{stemElement\(pillars\.day\[0\]\)/);
  assert.match(readFileSync(new URL("../src/components/almanac-ink-board.tsx", import.meta.url), "utf8"), /zw-ink-accessory-feature[\s\S]*?props\.accessoryArt/);
  assert.match(readFileSync(new URL("../src/components/daily-almanac-accessory-art.css", import.meta.url), "utf8"), /grid-column:\s*1\s*\/\s*-1/);
});

test("wardrobe palette stays Song-paper legible on phones and dark skins", () => {
  assert.match(design, /Personal wardrobe palette/);
  assert.match(design, /main:is\(\.zhaowu-home-layout, \.zw-hero-home\) #daily-almanac/);
  assert.match(design, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(design, /var\(--wardrobe-swatch\)/);
  assert.match(design, /html\[data-zw-theme="night"\][\s\S]*?\.zhaowu-today-section\.is-wardrobe/);
  assert.match(skins, /wardrobe palette is intentionally an opaque paper leaf/);
  assert.match(skins, /main:is\(\.zhaowu-home-layout, \.zw-hero-home\) #daily-almanac/);
  assert.match(skins, /data-zws-mode="dark"[\s\S]*?data-wardrobe-materials/);
});
