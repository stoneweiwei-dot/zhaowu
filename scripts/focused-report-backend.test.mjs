import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("focused report keeps the backend answer source and dynamic sections", async () => {
  const [resultView, focused, supabase] = await Promise.all([
    source("src/components/result-view.tsx"),
    source("src/lib/report/focused-report.ts"),
    source("src/lib/supabase-rest.ts"),
  ]);

  assert.match(resultView, /writeFullReport/);
  assert.match(resultView, /composeFocusedReport/);
  assert.match(resultView, /fullReport: text/);
  assert.match(resultView, /ninePages: sections/);
  assert.match(focused, /question-focused/i);
  assert.match(supabase, /mother_draft/);
});

test("free decree text remains available independently from image generation", async () => {
  const resultView = await source("src/components/result-view.tsx");
  assert.match(resultView, /buildFreeDecreeCouplet/);
  assert.match(resultView, /decreeCouplet/);
  assert.match(resultView, /generateDecreeImage/);
  assert.match(resultView, /imageLoadFailed/);
});

test("loading intro remains non-blocking and hard-exits inside the mobile budget", async () => {
  const [intro, policy] = await Promise.all([
    source("src/components/intro-gate.tsx"),
    source("src/lib/intro-gate-policy.ts"),
  ]);
  assert.match(policy, /INTRO_GATE_HARD_EXIT_MS = 2800/);
  assert.match(intro, /LOTUS_BLOOM_MS = 2200/);
});

test("owner-selected wallpaper remains visible on home, account and login", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const main = await source("src/main.tsx");
  const wallpaper = await source("src/wallpaper-visibility-fix.css");
  const landscape = await source("src/landscape-paper.css");

  assert.match(shell, /backgroundUrl \? "zhaowu-has-wallpaper"/);
  assert.match(shell, /className=\{`zhaowu-site-wallpaper \$\{isLogin \? "is-login" : ""\}`\}/);
  assert.doesNotMatch(shell, /backgroundUrl && !isLogin \?/);
  assert.match(main, /wallpaper-visibility-fix\.css/);
  assert.match(main, /landscape-paper\.css/);
  assert.ok(main.indexOf("wallpaper-visibility-fix.css") < main.indexOf("landscape-paper.css"));
  assert.match(wallpaper, /\.zhaowu-has-wallpaper \.zhaowu-login-card/);
  assert.match(wallpaper, /background-color:\s*rgba\(255,\s*252,\s*244,\s*\.88\)/);
  assert.match(landscape, /\.zhaowu-site-wallpaper[\s\S]*display:\s*block\s*!important/);
  assert.match(landscape, /background:\s*rgba\(255,\s*252,\s*244,\s*\.88\)\s*!important/);
});
