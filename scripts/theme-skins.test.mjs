import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const ts = readFileSync("src/lib/theme-skins.ts", "utf8");
const css = readFileSync("src/theme-skins.css", "utf8");
const html = readFileSync("index.html", "utf8");
const ids = [...ts.matchAll(/\{ id: "([a-z-]+)", ref: (\d+), mode: "(light|dark)"/g)].map((m) => ({ id: m[1], ref: +m[2], mode: m[3] }));

test("18 skins, original 10 preserved, unique ids and catalog order", () => {
  assert.equal(ids.length, 18);
  assert.deepEqual(ids.map((s) => s.ref).sort((a, b) => a - b), Array.from({ length: 18 }, (_, i) => i + 1));
  assert.equal(new Set(ids.map((s) => s.id)).size, 18);
  assert.deepEqual(ids.slice(0, 10).map((s) => s.ref), Array.from({ length: 10 }, (_, i) => i + 1));
});
const full = readFileSync("src/theme-skins-full.css", "utf8");
test("Song Quiet group uses the existing skin engine and light contrast mode", () => {
  const quiet = ids.slice(10, 14);
  assert.equal(quiet.length, 4);
  assert.ok(quiet.every((s) => s.id.startsWith("song-") && s.mode === "light"));
  const manager = readFileSync("src/components/owner-theme-skins-manager.tsx", "utf8");
  assert.match(manager, /data-song-quiet-skin-collection/);
  assert.ok(full.includes('html[data-zws^="song-"]'));
});
test("青木 series (15-18): three light skins and one dark rain skin on the existing engine", () => {
  const g = ids.slice(14);
  assert.equal(g.length, 4);
  assert.ok(g.every((s) => s.id.startsWith("verdant-")));
  assert.deepEqual(g.map((s) => s.mode), ["light", "light", "light", "dark"]);
  const manager = readFileSync("src/components/owner-theme-skins-manager.tsx", "utf8");
  assert.match(manager, /data-qingmu-skin-collection/);
  assert.ok(full.includes("ol.zw-home-steps") && full.includes("#birth-year"), "home panels + birth fields have dark-skin rules");
});
test("every skin has tokens, a full-set definition and crisp art on disk", () => {
  for (const { id } of ids) {
    assert.ok(css.includes(`html[data-zws="${id}"] { --zws-page`) || css.includes(`html[data-zws="${id}"], `), `tokens for ${id}`);
    const m = ts.match(new RegExp(`id: "${id}"[^\\n]*hero: "([^"]+)"[^\\n]*focus: "([^"]+)"`));
    assert.ok(m, `hero + focus for ${id}`);
    assert.ok(existsSync(`public${m[1]}`), `art file for ${id}: ${m[1]}`);
    assert.ok(full.includes(`html[data-zws="${id}"]`), `full-set rules for ${id}`);
  }
});
test("full set paints every page, cards, type and almanac from the skin", () => {
  for (const needle of ["--zws-art", "--zws-card-orn", "--zws-font-d", "zw-ink-board", "zhaowu-site-header", "#life-view"]) {
    assert.ok(full.includes(needle), `theme-skins-full.css covers ${needle}`);
  }
  const main = readFileSync("src/main.tsx", "utf8");
  assert.ok(main.indexOf("theme-skins.css") < main.indexOf("theme-skins-full.css"));
});
test("pre-paint script dark list matches registry", () => {
  const dark = ids.filter((s) => s.mode === "dark").map((s) => s.id).sort();
  const inHtml = [...html.matchAll(/k === "([a-z-]+)"/g)].map((m) => m[1]).filter((x) => x !== "none").sort();
  assert.deepEqual(inHtml, dark);
});
test("skin CSS is inert without data-zws and loaded after the design system", () => {
  const main = readFileSync("src/main.tsx", "utf8");
  assert.ok(main.indexOf("zhaowu-design-system.css") < main.indexOf("theme-skins.css"));
  const bare = css.split("\n").filter((l) => /^(html body|html\[data-zws)/.test(l) === false && /^\s*(body|\.zw-|main)/.test(l));
  assert.equal(bare.length, 0, "no ungated top-level selectors");
});
test("site default is classic (no forced skin)", () => {
  assert.match(ts, /SITE_DEFAULT_SKIN = ""/);
});

test("all selected skins show the matching painting on report cover surfaces only", () => {
  const covers = [
    ".zhaowu-report-header",
    ".zhaowu-unified-birth-report > header",
    ".zhaowu-specialist-hero",
    ".zhaowu-visual-book-head",
    ".zhaowu-luck-head",
    ".history-entry-report",
    ".zw-saved-report-card",
  ];
  for (const selector of covers) assert.ok(full.includes(selector), `missing themed report cover: ${selector}`);
  assert.ok(full.includes("var(--zws-art) !important"), "report covers use the selected skin artwork");
  assert.ok(full.includes('html[data-zws][data-zws-mode="dark"] body main'), "night report ink stays readable");
  assert.ok(full.includes("body .zhaowu-report-header .zhaowu-report-art { display: none"), "do not show a second unrelated lotus image");
  const manager = readFileSync("src/components/owner-theme-skins-manager.tsx", "utf8");
  assert.match(manager, /Report colour preview/);
});

// Resolve the actual root token cascade, including shared and per-skin rules.
// This checks readable foreground/background pairs rather than a copied palette.
const { default: postcss } = await import('postcss');
const skinRoots = [css, readFileSync('src/theme-skins-sets.css', 'utf8'), full].map(text => postcss.parse(text));
function tokensForSkin(skin) {
  const attributes = { 'data-zws': skin.id, 'data-zws-mode': skin.mode, ...(skin.mode === 'dark' ? {'data-zw-theme':'night'} : {}), lang:'zh-Hant' };
  const vars = {}, ranks = {};
  let order = 0;
  for (const root of skinRoots) root.walkRules(rule => {
    order++;
    for (const selector of rule.selector.split(',')) {
      const sel = selector.trim();
      if (!/^html(?:\[[^\]]+\])+$/.test(sel)) continue;
      const attrs = [...sel.matchAll(/\[([\w-]+)(?:(\^=|=)["']([^"']+)["'])?\]/g)];
      if (!attrs.every(([,name,operator,value]) => name in attributes && (!operator || (operator === '=' ? attributes[name] === value : attributes[name].startsWith(value))))) continue;
      for (const decl of rule.nodes.filter(n => n.type === 'decl' && n.prop.startsWith('--'))) {
        const rank = [decl.important ? 1 : 0, attrs.length, order];
        const prev = ranks[decl.prop];
        if (!prev || rank[0] > prev[0] || (rank[0] === prev[0] && (rank[1] > prev[1] || (rank[1] === prev[1] && rank[2] >= prev[2])))) {
          ranks[decl.prop] = rank; vars[decl.prop] = decl.value;
        }
      }
    }
  });
  return vars;
}
function splitColourArgs(value) {
  let depth = 0, start = 0; const parts = [];
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '(') depth++;
    if (value[i] === ')') depth--;
    if (value[i] === ',' && depth === 0) { parts.push(value.slice(start, i).trim()); start = i + 1; }
  }
  parts.push(value.slice(start).trim()); return parts;
}
function colour(value, vars, visited = new Set()) {
  const v = value.trim();
  const reference = v.match(/^var\((--[\w-]+)\)$/);
  if (reference) {
    assert.ok(!visited.has(reference[1]), `circular colour token ${reference[1]}`);
    assert.ok(vars[reference[1]], `missing colour token ${reference[1]}`);
    return colour(vars[reference[1]], vars, new Set([...visited, reference[1]]));
  }
  if (/^#[\da-f]{3,6}$/i.test(v)) {
    const hex = v.length === 4 ? [...v.slice(1)].map(c => c + c).join('') : v.slice(1);
    return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  }
  if (v.startsWith('color-mix(')) {
    const [space, first, second] = splitColourArgs(v.slice(10, -1));
    assert.equal(space, 'in srgb');
    const term = text => { const m = text.match(/\s+([\d.]+)%$/); return {rgb:colour(m ? text.slice(0,m.index) : text, vars, visited), weight:m ? Number(m[1])/100 : null}; };
    const a = term(first), b = term(second);
    const aw = a.weight ?? (b.weight === null ? .5 : 1 - b.weight), bw = b.weight ?? 1 - aw;
    return a.rgb.map((x,i) => (x*aw+b.rgb[i]*bw)/(aw+bw));
  }
  throw new Error(`Unsupported contrast colour: ${v}`);
}
function contrast(a, b) {
  const luminance = rgb => rgb.map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4).reduce((n,v,i) => n+v*[.2126,.7152,.0722][i],0);
  const la=luminance(a), lb=luminance(b); return (Math.max(la,lb)+.05)/(Math.min(la,lb)+.05);
}
test('all 18 actual skin palettes keep body, muted copy and primary actions readable', () => {
  for (const skin of ids) {
    const vars = tokensForSkin(skin);
    for (const [fg, bg] of [['--zws-ink','--zws-surface'],['--zws-soft','--zws-surface'],['--zws-ink','--zws-surface-soft'],['--zws-on-accent','--zws-action-bg']]) {
      const ratio = contrast(colour(vars[fg],vars),colour(vars[bg],vars));
      assert.ok(ratio >= 4.5, `${skin.id}: ${fg} / ${bg} contrast ${ratio.toFixed(2)}`);
    }
    assert.equal(vars['--zws-card-orn'], 'none');
    assert.equal(vars['--zws-card-frame'], 'none');
    assert.equal(vars['--zws-card-blur'], 'none');
  }
});
