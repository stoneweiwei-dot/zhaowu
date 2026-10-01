import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// Owner 2026-10-01: at night the player was a dark-green box inside the light paper dragon panel (looked like a
// stuck-on patch) and ⏮/⏭ rendered as blue emoji squares on iPhone.
const music = await readFile(new URL("../src/components/background-music.tsx", import.meta.url), "utf8");
const guide = await readFile(new URL("../src/components/green-dragon-guide.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/zhaowu-design-system.css", import.meta.url), "utf8");

test("transport controls use SVG icons, never emoji-prone text glyphs", () => {
  for (const src of [music, guide]) {
    assert.doesNotMatch(src, /[⏮⏭⏯]/u);
    assert.doesNotMatch(src, /"Ⅱ" : "▶"/u);
  }
  assert.match(music, /<MusicIcon name="prev"/);
  assert.match(music, /<MusicIcon name="next"/);
  assert.match(guide, /<MusicIcon name="next"/);
});

test("night player inside the dragon panel is transparent paper, not a dark box", () => {
  const block = css.slice(css.indexOf("/* r227"));
  assert.match(block, /html\[data-zw-theme="night"\] body \.zhaowu-dragon-guide-panel \.zhaowu-dragon-music \{[^}]*background: transparent !important/);
  assert.match(block, /border-bottom: 1px solid/);
});

test("legacy floating-button rules no longer paint a square behind the control row", () => {
  const block = css.slice(css.indexOf("/* r227"));
  assert.match(block, /\.zhaowu-dragon-music-controls\[data-background-music-control\] \{[^}]*background: transparent !important/);
  assert.match(block, /\.zhaowu-dragon-music-controls\[data-background-music-control\] \{[^}]*box-shadow: none !important/);
});
