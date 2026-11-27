import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import test from "node:test";

// Formal release reports retain their numbered IDs independently of ordinary SHA builds.
const stats = await readFile(new URL("../src/lib/site-stats.ts", import.meta.url), "utf8");
const verification = await readFile(new URL("../lib/zhaowu-verification.js", import.meta.url), "utf8");
const shell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const indexHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
const manifest = await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8");
const agents = await readFile(new URL("../AGENTS.md", import.meta.url), "utf8");

const ref = process.env.ZHAOWU_RELEASE_ID || (process.env.GITHUB_REF_TYPE === "tag" ? process.env.GITHUB_REF_NAME : "");
const label = (ref ?? "").replace(/^(?:release-|v)/, "");
const numbered = /^ZW-WEB-\d{4}\.\d{2}\.\d{2}-r\d+$/;
let release = label;
if (!numbered.test(label)) {
  const n = /^r?(\d+)$/.exec(label)?.[1];
  assert.ok(n, "Supply the formal release ID or a numbered release tag");
  const reports = await readdir(new URL("../docs/change-reports/", import.meta.url));
  const matches = reports.map(name => name.replace(/\.md$/, "")).filter(name => numbered.test(name) && name.endsWith(`-r${n}`));
  assert.equal(matches.length, 1, "The tagged release must have exactly one matching report");
  release = matches[0];
}
const reportPath = `docs/change-reports/${release}.md`;

test("public footer and verification use the generated build identity", () => {
  assert.match(stats, /version: ZHAOWU_BUILD_RELEASE/);
  assert.match(verification, /ZHAOWU_BUILD_RELEASE as ZHAOWU_RELEASE/);
  assert.match(shell, /data-site-release/);
  assert.match(shell, /正式版本序號/);
  assert.match(shell, /data-latest-change-report/);
});

test("fresh static shell defaults to Traditional Chinese before hydration", () => {
  assert.match(indexHtml, /<html lang="zh-Hant">/);
  assert.match(indexHtml, /<title>昭梧｜八字排盤・子平八字・真太陽時・流年運勢｜免登入免費<\/title>/);
  assert.match(indexHtml, /property="og:title" content="昭梧｜昭於未見，梧於有歸"/);
  assert.match(indexHtml, /name="description" content="免登入免費八字排盤：依子平八字與真太陽時校正，整理五行旺衰、大運與流年運勢、今日提示。"/);
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
  assert.ok(report.includes(`# 昭梧更新報告｜${release}`), `${reportPath} heading must name ${release}`);
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
