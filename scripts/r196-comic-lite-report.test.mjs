import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r196 turns the unified report into a real six-frame Comic Lite mode", async () => {
  const report = await source("src/components/unified-birth-report.tsx");
  assert.match(report, /useState<"formal" \| "comic" \| "systems">\("formal"\)/);
  assert.match(report, /data-report-mode="comic-lite"/);
  assert.match(report, /sections\.map\(\(section, index\)/);
  assert.match(report, /section\.body\.slice\(1\)/);
  assert.match(report, /漫畫命書/);
  assert.match(report, /Comic Destiny Book/);
});

test("r196 keeps Comic Lite as presentation only and leaves payment untouched", async () => {
  const report = await source("src/components/unified-birth-report.tsx");
  assert.doesNotMatch(report, /payment|paywall|checkout|stripe|supabase|storage\.from|upload\(/i);
  assert.match(report, /buildWesternReading/);
  assert.match(report, /buildZiweiReading/);
  assert.match(report, /buildQizhengReading/);
  assert.match(report, /buildPalmReading/);
});

test("r196 Comic Lite is single-column and touch-readable on mobile", async () => {
  const css = await source("src/zhaowu-design-system.css");
  assert.match(css, /r196 — Full comic Lite reading mode/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.zhaowu-comic-lite__grid \{ display: block/);
  assert.match(css, /\.zhaowu-report-mode-switch button[\s\S]*min-height: 40px/);
  assert.match(css, /\.zhaowu-comic-lite summary \{[^}]*min-height: 44px/);
  assert.doesNotMatch(css, /\.zhaowu-comic-lite[^\n]*position:\s*fixed/);
});

function scrollBlock(css) {
  const start = css.indexOf("r225 — Song handscroll treatment");
  const end = css.indexOf("r191 — Lite-converged mobile editorial shell");
  assert.ok(start > 0 && end > start, "r225 six-frame block must exist before the r191 shell");
  return css.slice(start, end);
}

test("r226 six frames are visibly illustrated while keeping text secondary", async () => {
  const css = await source("src/zhaowu-design-system.css");
  const report = await source("src/components/unified-birth-report.tsx");
  const legacy = scrollBlock(css);
  const r226 = css.slice(css.indexOf("r226 — mobile clarity pass"));
  assert.match(report, /ComicMascot/);
  assert.match(report, /zhaowu-comic-lite__art/);
  assert.match(report, /zhaowu-comic-lite__bubble/);
  assert.match(report, /zhaowu-comic-lite__more/);
  assert.match(r226, /\.zhaowu-comic-lite__art/);
  assert.match(r226, /linear-gradient/);
  assert.match(r226, /border-radius: 18px/);
  assert.match(legacy, /prefers-reduced-motion: reduce/);
});

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test("r225 six-frame text tones keep WCAG AA (4.5:1) on both report paper surfaces", async () => {
  const css = await source("src/zhaowu-design-system.css");
  const block = scrollBlock(css);
  const tokens = ["ink", "ink-soft", "faint", "celadon", "cinnabar"].map((name) => {
    const match = block.match(new RegExp(`--zw-scroll-${name}: (#[0-9A-Fa-f]{6})`));
    assert.ok(match, `missing --zw-scroll-${name}`);
    return [name, match[1]];
  });
  for (const surface of ["#FBF7EE", "#EBE5D9"]) {
    for (const [name, hex] of tokens) {
      assert.ok(contrast(hex, surface) >= 4.5, `${name} ${hex} on ${surface} = ${contrast(hex, surface).toFixed(2)}:1`);
    }
  }
});
