import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('visitor chart persistence is server-only and included in owner reports', () => {
  const migration = source('supabase/migrations/20261117090000_visitor_charts.sql');
  const fn = source('supabase/functions/visitor-chart-save/index.ts');
  const form = source('src/components/analysis-form.tsx');
  const owner = source('supabase/functions/zhaowu-owner-data/index.ts');
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /private\.zhaowu_is_owner\(\)/);
  assert.match(migration, /revoke all privileges.*anon, authenticated/is);
  assert.match(fn, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(fn, /RATE_LIMITED/);
  assert.match(fn, /Object\.keys\(payload\).*allowed/);
  assert.match(form, /saveVisitorChart\(\{ result, birth: payload \}\)\.catch\(\(\) => undefined\)/);
  assert.match(owner, /visitor_charts/);
  assert.match(owner, /chart_snapshot/);
});

test('birth notice states server storage and admin-only access in all required languages', () => {
  const notice = source('src/components/birth-data-notice.tsx');
  for (const phrase of ['伺服器', '服务器', 'server', '管理員', '管理员', 'administrators', '刪除', '删除', 'deletion']) assert.ok(notice.includes(phrase), `missing ${phrase}`);
});
