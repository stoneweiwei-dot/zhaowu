import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const journeyNav = await readFile(new URL("../src/components/journey-navigation.tsx", import.meta.url), "utf8");
const siteShell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const historyRoute = await readFile(new URL("../src/routes/history.tsx", import.meta.url), "utf8");
const reportSaveStatus = await readFile(new URL("../src/components/report-save-status.tsx", import.meta.url), "utf8");
const siteGuide = await readFile(new URL("../src/lib/site-guide.ts", import.meta.url), "utf8");
const accountRoute = await readFile(new URL("../src/routes/account.tsx", import.meta.url), "utf8");
const i18nLib = await readFile(new URL("../src/lib/i18n.ts", import.meta.url), "utf8");
const displayLangLib = await readFile(new URL("../src/lib/display-language.ts", import.meta.url), "utf8");

test("journey navigation never exposes owner/all reports link in the public header", () => {
  assert.doesNotMatch(journeyNav, /所有人報告/);
  assert.doesNotMatch(journeyNav, /所有人报告/);
  assert.doesNotMatch(journeyNav, /All reports/i);
  assert.doesNotMatch(journeyNav, /Everyone’s reports/i);
  assert.doesNotMatch(journeyNav, /href:\s*["']\/account["']/);
  assert.doesNotMatch(journeyNav, /isOwner/);
});

test("site shell uses neutral visitor sign-in across all 6 supported languages", () => {
  // Unauthenticated header button text must be neutral visitor sign-in in all languages
  assert.doesNotMatch(siteShell, /站主登入/);
  assert.doesNotMatch(siteShell, /站主登录/);
  assert.doesNotMatch(siteShell, /Owner sign-in/i);
  assert.doesNotMatch(siteShell, /オーナーサインイン/);
  assert.doesNotMatch(siteShell, /소유자 로그인/);
  
  // Confirms displayText contains all 6 supported locales
  assert.match(
    siteShell,
    /displayText\(language,\s*"登入",\s*"登录",\s*"Sign in",\s*"ログイン",\s*"로그인",\s*"लॉगिन"\)/
  );

  // Authenticated owner link on home shell must be neutral admin, never "所有報告"
  assert.doesNotMatch(siteShell, /所有報告/);
  assert.doesNotMatch(siteShell, /所有报告/);
  assert.doesNotMatch(siteShell, /All reports/i);
  assert.match(siteShell, /user\.isOwner \? t\("navAdmin"\) : t\("navMine"\)/);
});

test("my reports (/history) removes owner cloud card, free read promises, and owner sync notes in all locales", () => {
  // No owner cloud card
  assert.doesNotMatch(historyRoute, /所有人的雲端報告/);
  assert.doesNotMatch(historyRoute, /所有人的云端报告/);
  assert.doesNotMatch(historyRoute, /Everyone’s cloud reports/i);
  assert.doesNotMatch(historyRoute, /All reports/i);
  assert.doesNotMatch(historyRoute, /站主可查看所有已上傳的報告/);
  assert.doesNotMatch(historyRoute, /站主可查看所有已上传的报告/);
  assert.doesNotMatch(historyRoute, /Owners can read every uploaded report/i);
  assert.doesNotMatch(historyRoute, /開啟所有人報告/);
  assert.doesNotMatch(historyRoute, /打开所有人报告/);
  assert.doesNotMatch(historyRoute, /Open all reports/i);

  // No owner free read prompt in hero
  assert.doesNotMatch(historyRoute, /站主登入後可免費閱讀完整內容/);
  assert.doesNotMatch(historyRoute, /站主登录后可免费阅读完整内容/);

  // Status badge uses neutral secure backup, not owner archive
  assert.doesNotMatch(historyRoute, /已同步站主後台/);
  assert.doesNotMatch(historyRoute, /已同步站主后台/);
  assert.doesNotMatch(historyRoute, /Synced to owner archive/i);
  assert.match(historyRoute, /已安全備份/);
  assert.match(historyRoute, /已安全备份/);
  assert.match(historyRoute, /Securely backed up/);
});

test("report save status never references owner backend or all reports archive in any language", () => {
  assert.doesNotMatch(reportSaveStatus, /正在保存到站主報告後台/);
  assert.doesNotMatch(reportSaveStatus, /正在保存到站主报告后台/);
  assert.doesNotMatch(reportSaveStatus, /Saving to the owner report archive/i);
  assert.doesNotMatch(reportSaveStatus, /可從「我的報告」或「所有人報告」重看/);
  assert.doesNotMatch(reportSaveStatus, /可从「我的报告」或「所有人报告」重看/);
  assert.doesNotMatch(reportSaveStatus, /Saved to My reports and All reports/i);

  // Clean guest messages in zh-Hant, zh-Hans, and English
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
  assert.doesNotMatch(siteGuide, /All reports/i);
  assert.doesNotMatch(siteGuide, /需站主登入/);
  assert.doesNotMatch(siteGuide, /需站主登录/);
  assert.doesNotMatch(siteGuide, /owner report archive/i);
  assert.doesNotMatch(siteGuide, /Owner sign-in opens full readings and all uploaded reports/i);

  // Neutral visitor guidance
  assert.match(siteGuide, /您在昭梧的報告與測驗會保存在這台裝置中/);
  assert.match(siteGuide, /您在昭梧的报告与测验会保存在这台设备中/);
  assert.match(siteGuide, /Your reports and tests are saved on this device/);
});

test("multilingual dictionaries in i18n and display-language never expose customer report access or all-reports", () => {
  // In zh-Hant, zh-Hans, and English (src/lib/i18n.ts):
  assert.doesNotMatch(i18nLib, /站主帳號可直接查看客戶/);
  assert.doesNotMatch(i18nLib, /站主账号可直接查看客户/);
  assert.doesNotMatch(i18nLib, /owner account can open each customer/i);
  assert.doesNotMatch(i18nLib, /highest available report/i);

  // In ja, ko, hi (src/lib/display-language.ts):
  assert.doesNotMatch(displayLangLib, /オーナーアカウントでは、顧客/);
  assert.doesNotMatch(displayLangLib, /소유자 계정에서는 고객/);
  assert.doesNotMatch(displayLangLib, /सत्यापित मालिक खाते से ग्राहक/);

  // All languages must use neutral admin terms for navAdmin:
  assert.match(i18nLib, /navAdmin:\s*\["後台",\s*"后台"\]/);
  assert.match(i18nLib, /navAdmin:\s*"Admin"/);
  assert.match(displayLangLib, /navAdmin:\s*"管理"/); // JA
  assert.match(displayLangLib, /navAdmin:\s*"관리"/); // KO
  assert.match(displayLangLib, /navAdmin:\s*"एडमिन"/); // HI
});

test("account route visitor view does not leak owner guidance and keeps console owner-guarded", () => {
  assert.match(accountRoute, /createFileRoute\("\/account"\)/);
  // Guest view must not leak "站主請改用..." or "Owners use the Owner tab..."
  assert.doesNotMatch(accountRoute, /站主請改用登入頁/);
  assert.doesNotMatch(accountRoute, /站主请改用登录页/);
  assert.doesNotMatch(accountRoute, /Owners use the Owner tab/i);

  // Management functions and owner console are exclusively provided in /account for owners
  assert.match(accountRoute, /ConsoleView/);
  assert.match(accountRoute, /listOwnerReportPage/);
  assert.match(accountRoute, /OwnerGalleryManager/);
  assert.match(accountRoute, /OwnerLoginVisualsManager/);
});
