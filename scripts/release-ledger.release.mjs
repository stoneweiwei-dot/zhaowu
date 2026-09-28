import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

// The release number is declared ONCE in src/lib/site-stats.ts. This test derives it from
// there instead of hardcoding it, so a release bump never requires editing test files and
// concurrent PRs no longer collide on test literals. Drift is still caught: the footer
// fallback, updateNumber, runtime verification constant and change report must all agree.
const stats = await readFile(new URL("../src/lib/site-stats.ts", import.meta.url), "utf8");
const verification = await readFile(new URL("../lib/zhaowu-verification.js", import.meta.url), "utf8");
const shell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const indexHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
const manifest = await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8");
const agents = await readFile(new URL("../AGENTS.md", import.meta.url), "utf8");

const version = stats.match(/version:\s*"(ZW-WEB-\d{4}\.\d{2}\.\d{2}-r(\d+))"/);
const updateNumber = stats.match(/updateNumber:\s*(\d+)/);
const reportPath = version ? `docs/change-reports/${version[1]}.md` : null;

test("public footer always exposes current release and cumulative update count", () => {
  assert.ok(version, "SITE_RELEASE_FALLBACK.version must be ZW-WEB-YYYY.MM.DD-rN");
  assert.ok(updateNumber, "SITE_RELEASE_FALLBACK.updateNumber must be declared");
  assert.equal(Number(version[2]), Number(updateNumber[1]), "rN in version must equal updateNumber");
  assert.ok(verification.includes(`ZHAOWU_RELEASE = "${version[1]}"`), "lib/zhaowu-verification.js must match site-stats.ts");
  assert.match(shell, /data-site-release/);
  assert.match(shell, /累計更新/);
  assert.match(shell, /data-latest-change-report/);
});

test("fresh static shell defaults to Traditional Chinese before hydration", () => {
  assert.match(indexHtml, /<html lang="zh-Hant">/);
  assert.match(indexHtml, /<title>昭梧｜昭於未見，梧於有歸<\/title>/);
  assert.match(indexHtml, /name="description" content="看見命運的節奏，選擇屬於你的道路"/);
  assert.match(indexHtml, /property="og:locale" content="zh_TW"/);
  assert.match(indexHtml, /localStorage\.getItem\("zhaowu\.display-language"\)/);
  assert.match(manifest, /"lang":\s*"zh-TW"/);
  assert.match(manifest, /人生節奏與選擇分析/);
});

test("every production frontend change requires a matching change report", async () => {
  assert.ok(reportPath, "cannot resolve change report path without a valid version");
  await access(new URL(`../${reportPath}`, import.meta.url)).catch(() => {
    assert.fail(`missing ${reportPath} for current release`);
  });
  const report = await readFile(new URL(`../${reportPath}`, import.meta.url), "utf8");
  assert.ok(report.includes(`# 昭梧更新報告｜${version[1]}`), `${reportPath} heading must name ${version[1]}`);
  assert.match(report, /## 本次改動/);
  assert.match(report, /## 為什麼改/);
  assert.match(report, /## 影響範圍/);
  assert.match(report, /## 受保護範圍/);
  assert.match(report, /## 驗證狀態/);
  assert.match(report, /## 回滾/);
  assert.match(agents, /RELEASE LEDGER — RELEASE-ONLY GATE/);
  assert.match(agents, /docs\/change-reports/);
  assert.match(agents, /release_history/);
  assert.match(agents, /CANONICAL METAPHYSICS DEFAULT/);
});

test("latest update is an iPhone-sized link to the dedicated release page", () => {
  assert.match(shell, /data-latest-change-report/);
  assert.match(shell, /<Link to="\/updates"/);
  assert.match(shell, /zhaowu-latest-update-link/);
  assert.doesNotMatch(shell, /<details[^>]+data-latest-change-report/);
});
