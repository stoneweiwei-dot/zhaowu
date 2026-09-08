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

const canonicalImport = "import './zhaowu-design-system.css';";
const loginApprovedImport = "import './login-approved-r89.css';";
const legacyLastImport = "import './site-ux-r75-final.css';";

test('canonical design system stays the final global base and r89 overrides login only', () => {
  assert.match(main, /zhaowu-design-system\.css/);
  assert.match(main, /login-approved-r89\.css/);
  assert.ok(main.lastIndexOf(canonicalImport) > main.lastIndexOf(legacyLastImport));
  assert.ok(main.lastIndexOf(loginApprovedImport) > main.lastIndexOf(canonicalImport));
  assert.match(loginApproved, /\.zhaowu-login-shell/);
  assert.doesNotMatch(loginApproved, /\.zhaowu-home-sheet-shell/);
  assert.doesNotMatch(root, /mobile-foundation-r81\.css/);
});

test('approved login restores official mark, Song wallpaper and email credentials only', () => {
  assert.match(login, /BrandSeal/);
  assert.match(login, /stone-login-brand/);
  assert.match(login, /id="login-email"/);
  assert.match(login, /id="login-password"/);
  assert.doesNotMatch(login, /onOAuth\(/);
  assert.doesNotMatch(login, /startOAuth/);
  assert.doesNotMatch(login, /data-provider=/);
  assert.match(loginApproved, /url\("\/wallpaper-song\.jpg"\)/);
  assert.match(loginApproved, /rgba\(255, 252, 244, \.91\)/);
  assert.match(loginApproved, /#ac473b/);
  assert.match(loginApproved, /background-attachment:\s*scroll/);
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
