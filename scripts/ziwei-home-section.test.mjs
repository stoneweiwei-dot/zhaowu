import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('紫微保留独立页面，但不再占据核心分析首页', async () => {
  const [home, route] = await Promise.all([
    read('../src/routes/index.tsx'),
    read('../src/routes/ziwei.tsx'),
  ]);
  assert.doesNotMatch(home, /ZiweiHomeFeature|to="\/ziwei"/);
  assert.match(route, /createFileRoute\("\/ziwei"\)/);
});

test('紫微页面先交付客户白话总解，再折叠专业命盘', async () => {
  const [route, css, summaryCss, engine, summary] = await Promise.all([
    read('../src/routes/ziwei.tsx'),
    read('../src/ziwei.css'),
    read('../src/ziwei-summary.css'),
    read('../src/lib/ziwei/horoscope.ts'),
    read('../src/lib/ziwei/plain-summary.ts'),
  ]);
  assert.match(route, /createFileRoute\("\/ziwei"\)/);
  assert.match(route, /buildZiweiTruthExtension/);
  assert.match(route, /buildZiweiPlainSummary/);
  assert.match(route, /真太阳时|真太陽時/);
  assert.match(route, /白話總解|白话总解|PLAIN-LANGUAGE READING/);
  assert.match(route, /<details className="ziwei-technical">/);
  assert.match(route, /排盤事實已鎖定版本|排盘事实已锁定版本|Calculation facts are version-locked/);
  assert.doesNotMatch(route, /productionReady=false/);
  assert.match(css, /grid-template-columns:\s*repeat\(4/);
  assert.match(css, /@media \(max-width:\s*430px\)/);
  assert.match(summaryCss, /\.ziwei-plain-report/);
  assert.match(summaryCss, /html\[lang="en"\] \.ziwei-hero-rule b\{font-size:0\}/);
  assert.match(summaryCss, /html\[lang="en"\] \.ziwei-plain-seal\{font-size:0\}/);
  assert.match(summaryCss, /@media\(max-width:520px\)/);
  assert.match(summary, /zhaowu_ziwei_plain_summary_v1/);
  assert.match(summary, /internalEvidence/);
  assert.match(engine, /import \{ ZIWEI_ENGINE_READINESS \} from '\.\/profiles'/);
  assert.match(engine, /productionReady:\s*ZIWEI_ENGINE_READINESS\.calculationDataReady/);
  assert.match(engine, /calculationDataReady:\s*ZIWEI_ENGINE_READINESS\.calculationDataReady/);
  assert.match(engine, /primarySourceComplete:\s*ZIWEI_ENGINE_READINESS\.primarySourceComplete/);
  assert.match(engine, /1ba89cca577c6d5d46754d6f49b6b51467c577d1/);
});