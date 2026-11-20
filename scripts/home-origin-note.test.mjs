import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const painted = await readFile(new URL("../src/components/painted-home.tsx", import.meta.url), "utf8");
const paintedCss = await readFile(new URL("../src/painted-home.css", import.meta.url), "utf8");
const shell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const legalCss = await readFile(new URL("../src/legal-pages.css", import.meta.url), "utf8");
const footer = shell.split("<footer className=")[1]?.split("</footer>")[0] || "";

test("home hero carries one static trilingual 題跋 line under the painting, only in the Song gallery layout", () => {
  assert.match(painted, /layout === 'scroll' && <p className="ph-resolve" data-home-resolve>/);
  assert.match(painted, /知命，不為認命，是為從容。/);
  assert.match(painted, /知命，不为认命，是为从容。/);
  assert.match(painted, /Knowing your pattern isn’t giving in/);
  // DOM order matters: the line must follow the <img> so equal flex order keeps it under the painting.
  assert.ok(painted.indexOf('className="ph-hero-art"') < painted.indexOf('className="ph-resolve"'));
  assert.match(paintedCss, /\.zw-painted-home \.ph-resolve \{ display: none; \}/);
  assert.match(paintedCss, /html\[data-zws\] body #root \.zw-painted-home \.ph-resolve \{[\s\S]*?order: 2;/);
});

test("the 題跋 adds no motion (framework: opacity and slight shift only, reduced-motion respected)", () => {
  const block = paintedCss.split(".ph-resolve")[1] || "";
  const resolveRules = paintedCss.match(/[^{}]*\.ph-resolve[^{}]*\{[^}]*\}/g)?.join("\n") || "";
  assert.ok(block.length > 0);
  assert.doesNotMatch(resolveRules, /animation|transition|transform|@keyframes/);
});

test("footer 'Why ZHAOWU exists' is a home-only in-place disclosure inside the shared footer", () => {
  assert.ok(footer.includes("data-why-zhaowu"), "disclosure must live inside the existing <footer>");
  assert.match(footer, /isHome \? \(\s*<details className="zhaowu-why" data-why-zhaowu>/);
  for (const label of ["為何做昭梧", "为何做昭梧", "Why ZHAOWU exists"]) assert.ok(footer.includes(label), label);
  assert.match(legalCss, /\.zhaowu-site-footer \.zhaowu-why > summary \{[\s\S]*?min-height: 44px;/);
  // The pre-existing owner/legal/member footer contracts stay in place.
  assert.ok(footer.includes("data-footer-status-strip"));
  assert.ok(footer.includes("zhaowu-footer-legal"));
});

test("origin note states only what the product does: free chart + quick reading, one-time paid full report, no over-claim", () => {
  for (const claim of ["完整報告為單次付費，不自動續費", "完整报告为单次付费，不自动续费", "A full report is a one-time purchase with no subscription"]) {
    assert.ok(footer.includes(claim), claim);
  }
  for (const claim of ["排盤與快速讀免費、免登入", "排盘与快速读免费、免登录", "charting and the quick reading are free with no sign-up"]) {
    assert.ok(footer.includes(claim), claim);
  }
  // Paid reports exist, so the note must never say the whole site is free.
  assert.doesNotMatch(footer, /全站免費|完全免費|全站免费|完全免费|everything is free|entirely free/i);
  // Reuses the site's own manifesto sentences; no invented backstory or medical/outcome promises.
  assert.doesNotMatch(footer, /便見分晓|保證|治癒|guarantee/);
});
