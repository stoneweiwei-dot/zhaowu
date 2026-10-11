import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const journeyNav = await readFile(new URL("../src/components/journey-navigation.tsx", import.meta.url), "utf8");
const siteShell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const historyRoute = await readFile(new URL("../src/routes/history.tsx", import.meta.url), "utf8");
const reportSaveStatus = await readFile(new URL("../src/components/report-save-status.tsx", import.meta.url), "utf8");
const siteGuide = await readFile(new URL("../src/lib/site-guide.ts", import.meta.url), "utf8");
const accountRoute = await readFile(new URL("../src/routes/account.tsx", import.meta.url), "utf8");

test("journey navigation never exposes owner/all reports link in the public header", () => {
  assert.doesNotMatch(journeyNav, /所有人報告/);
  assert.doesNotMatch(journeyNav, /所有人报告/);
  assert.doesNotMatch(journeyNav, /All reports/);
  assert.doesNotMatch(journeyNav, /href:\s*["']\/account["']/);
  assert.doesNotMatch(journeyNav, /isOwner/);
});

test("site shell uses neutral visitor sign-in and renames owner entry to 后台管理", () => {
  // Unauthenticated header button text must be neutral "登入" / "登录" / "Sign in"
  assert.doesNotMatch(siteShell, /站主登入/);
  assert.doesNotMatch(siteShell, /站主登录/);
  assert.doesNotMatch(siteShell, /Owner sign-in/);
  assert.match(siteShell, /displayText\(language,\s*"登入",\s*"登录",\s*"Sign in"/);

  // Authenticated owner link on home shell must be "後台管理", never "所有報告"
  assert.doesNotMatch(siteShell, /所有報告/);
  assert.doesNotMatch(siteShell, /所有报告/);
  assert.match(siteShell, /後台管理/);
  assert.match(siteShell, /后台管理/);
});

test("my reports (/history) removes owner cloud card, free read promises, and owner sync notes", () => {
  // No owner cloud card
  assert.doesNotMatch(historyRoute, /所有人的雲端報告/);
  assert.doesNotMatch(historyRoute, /所有人的云端报告/);
  assert.doesNotMatch(historyRoute, /Everyone’s cloud reports/);
  assert.doesNotMatch(historyRoute, /站主可查看所有已上傳的報告/);
  assert.doesNotMatch(historyRoute, /站主可查看所有已上传的报告/);
  assert.doesNotMatch(historyRoute, /Owners can read every uploaded report without payment/);
  assert.doesNotMatch(historyRoute, /開啟所有人報告/);
  assert.doesNotMatch(historyRoute, /打开所有人报告/);
  assert.doesNotMatch(historyRoute, /Open all reports/);

  // No owner free read prompt in hero
  assert.doesNotMatch(historyRoute, /站主登入後可免費閱讀完整內容/);
  assert.doesNotMatch(historyRoute, /站主登录后可免费阅读完整内容/);

  // Status badge uses neutral secure backup, not owner archive
  assert.doesNotMatch(historyRoute, /已同步站主後台/);
  assert.doesNotMatch(historyRoute, /已同步站主后台/);
  assert.doesNotMatch(historyRoute, /Synced to owner archive/);
  assert.match(historyRoute, /已安全備份/);
  assert.match(historyRoute, /已安全备份/);
  assert.match(historyRoute, /Securely backed up/);
});

test("report save status never references owner backend or all reports archive", () => {
  assert.doesNotMatch(reportSaveStatus, /正在保存到站主報告後台/);
  assert.doesNotMatch(reportSaveStatus, /正在保存到站主报告后台/);
  assert.doesNotMatch(reportSaveStatus, /Saving to the owner report archive/);
  assert.doesNotMatch(reportSaveStatus, /可從「我的報告」或「所有人報告」重看/);
  assert.doesNotMatch(reportSaveStatus, /可从「我的报告」或「所有人报告」重看/);
  assert.doesNotMatch(reportSaveStatus, /Saved to My reports and All reports/);

  // Clean guest messages
  assert.match(reportSaveStatus, /正在保存報告…/);
  assert.match(reportSaveStatus, /正在保存报告…/);
  assert.match(reportSaveStatus, /Saving report…/);
  assert.match(reportSaveStatus, /已保存，可從「我的報告」重看/);
  assert.match(reportSaveStatus, /已保存，可从「我的报告」重看/);
  assert.match(reportSaveStatus, /Saved · Find it in My reports/);
});

test("site guide copy is sanitized for guest privacy and directs to account neutrally", () => {
  assert.doesNotMatch(siteGuide, /所有人報告/);
  assert.doesNotMatch(siteGuide, /所有人报告/);
  assert.doesNotMatch(siteGuide, /需站主登入/);
  assert.doesNotMatch(siteGuide, /需站主登录/);
  assert.doesNotMatch(siteGuide, /owner report archive/);
  assert.doesNotMatch(siteGuide, /Owner sign-in opens full readings and all uploaded reports/);

  // Neutral visitor guidance
  assert.match(siteGuide, /您在昭梧的報告與測驗會保存在這台裝置中/);
  assert.match(siteGuide, /您在昭梧的报告与测验会保存在这台设备中/);
  assert.match(siteGuide, /Your reports and tests are saved on this device/);
});

test("management functions and owner console are exclusively provided in /account", () => {
  assert.match(accountRoute, /createFileRoute\("\/account"\)/);
  assert.match(accountRoute, /ConsoleView/);
  assert.match(accountRoute, /listOwnerReportPage/);
  assert.match(accountRoute, /OwnerGalleryManager/);
  assert.match(accountRoute, /OwnerLoginVisualsManager/);
});
