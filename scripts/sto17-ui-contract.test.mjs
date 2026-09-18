import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');
const root = readFileSync(new URL('../src/routes/__root.tsx', import.meta.url), 'utf8');
const design = readFileSync(new URL('../src/zhaowu-design-system.css', import.meta.url), 'utf8');
const login = readFileSync(new URL('../src/routes/login.tsx', import.meta.url), 'utf8');
const loginApproved = readFileSync(new URL('../src/login-approved-r89.css', import.meta.url), 'utf8');
const account = readFileSync(new URL('../src/routes/account.tsx', import.meta.url), 'utf8');
const home = readFileSync(new URL('../src/routes/index.tsx', import.meta.url), 'utf8');
const r144 = readFileSync(new URL('../src/device-question-flow-r144.css', import.meta.url), 'utf8');
const siteShell = readFileSync(new URL('../src/components/site-shell.tsx', import.meta.url), 'utf8');

const canonicalImport = "import './zhaowu-design-system.css';";
const loginApprovedImport = "import './login-approved-r89.css';";
const legacyLastImport = "import './site-ux-r75-final.css';";

test('canonical design system is the final global visual authority', () => {
  assert.match(main, /zhaowu-design-system\.css/);
  assert.match(main, /login-approved-r89\.css/);
  assert.ok(main.lastIndexOf(canonicalImport) > main.lastIndexOf(legacyLastImport));
  assert.ok(main.lastIndexOf(canonicalImport) > main.lastIndexOf(loginApprovedImport));
  assert.equal(main.lastIndexOf(canonicalImport), main.lastIndexOf("import './"));
  assert.match(loginApproved, /\.zhaowu-login-shell/);
  assert.doesNotMatch(loginApproved, /\.zhaowu-home-sheet-shell/);
  assert.doesNotMatch(root, /mobile-foundation-r81\.css/);
});

test('two-language header uses stylesheet-governed controls without inline visual overrides', () => {
  assert.match(siteShell, /value: "en" as const/);
  assert.match(siteShell, /value: "zh-Hant" as const/);
  assert.doesNotMatch(siteShell, /value: "ko" as const|value: "hi" as const/);
  assert.doesNotMatch(siteShell, /site-lang-group"\s+style=|site-lang-button"\s+style=/);
  assert.match(design, /\.site-lang-button[\s\S]*min-height:\s*44px/);
  assert.match(design, /\.zhaowu-home-sheet-shell input[\s\S]*font-size:\s*16px/);
});

test('approved login keeps official mark, Song wallpaper and independent owner credentials only', () => {
  assert.match(login, /BrandSeal/);
  assert.match(login, /stone-login-brand/);
  assert.match(login, /id="login-secret"/);
  assert.match(login, /vercel-owner-cookie/);
  assert.match(login, /data-owner-only-login="true"/);
  assert.match(login, /ownerSignIn/);
  assert.doesNotMatch(login, /id="login-email"|id="login-password"|signInWithPassword|signUpWithPassword|startOAuth/);
  assert.match(r144, /\.zhaowu-site-header \.zhaowu-header-login \{ display: none !important; \}/);
  assert.match(loginApproved, /url\("\/wallpaper-song\.jpg"\)/);
  assert.match(loginApproved, /rgba\(255, 252, 244, \.91\)/);
  assert.match(loginApproved, /#ac473b/);
  assert.match(loginApproved, /background-attachment:\s*scroll/);
  assert.match(loginApproved, /\.stone-login-stage-media/);
});

test('runtime R79 visual injector stays removed', () => {
  assert.doesNotMatch(root, /VisibleRegressionFixesR79/);
});

test('saved report owner controls remain secondary to reading content', () => {
  assert.match(account, /data-report-primary-actions/);
  assert.match(account, /data-report-secondary-actions/);
  assert.match(design, /data-report-secondary-actions/);
  assert.match(design, /Saved reports: generation state is owner metadata/);
});

test('scent test stays collapsed until explicitly opened', () => {
  assert.match(home, /data-scent-panel/);
  assert.match(home, /hidden=\{!scentOpen\}/);
  assert.match(design, /\[data-scent-panel\]\[hidden\]/);
});

test('mobile header and Bazi layout are governed by canonical responsive rules', () => {
  assert.match(design, /\.zhaowu-site-header > div/);
  assert.match(design, /@media \(max-width: 780px\)/);
  assert.match(design, /grid-template-columns: 1fr !important/);
  assert.match(design, /\.zhaowu-header-gallery \{ display: none; \}/);
  assert.doesNotMatch(design, /\.zhaowu-header-utility:not\(\.zhaowu-header-signout\)/);
  assert.match(design, /\.bazi-detail-pillars/);
  assert.match(design, /grid-template-columns: 1fr !important/);
});
