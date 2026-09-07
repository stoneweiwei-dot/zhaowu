import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');
const root = readFileSync(new URL('../src/routes/__root.tsx', import.meta.url), 'utf8');
const design = readFileSync(new URL('../src/zhaowu-design-system.css', import.meta.url), 'utf8');
const account = readFileSync(new URL('../src/routes/account.tsx', import.meta.url), 'utf8');
const home = readFileSync(new URL('../src/routes/index.tsx', import.meta.url), 'utf8');

const canonicalImport = "import './zhaowu-design-system.css';";
const legacyLastImport = "import './site-ux-r75-final.css';";

test('canonical design system is the final global CSS layer', () => {
  assert.match(main, /zhaowu-design-system\.css/);
  assert.ok(main.lastIndexOf(canonicalImport) > main.lastIndexOf(legacyLastImport));
  assert.doesNotMatch(root, /mobile-foundation-r81\.css/);
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
  assert.match(design, /flex-wrap: wrap/);
  assert.match(design, /\.bazi-detail-pillars/);
  assert.match(design, /grid-template-columns: 1fr !important/);
});
