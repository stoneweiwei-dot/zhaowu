import assert from 'node:assert/strict';
import test from 'node:test';
import { buildZiweiCoreChart, buildZiweiGrammarSummary, buildZiweiTruthExtension } from '../src/lib/ziwei/index.ts';

test('live Zi Wei grammar summary uses operations, palace scenes and timing layers without event guarantees', () => {
  const chart = buildZiweiCoreChart(
    { yearStem: '丙', yearBranch: '寅', lunarMonth: 5, lunarDay: 13, timeBranch: '卯' },
    { mutagenProfile: 'south_iztro_v1' },
  );
  const extension = buildZiweiTruthExtension({
    chart,
    directionBasis: 'male',
    targetYear: { year: 2026, stem: '丙', branch: '午' },
    activeDecadalIndex: 2,
  });
  const summary = buildZiweiGrammarSummary({ chart, extension, locale: 'zh-Hans', activeDecadalIndex: 2 });
  assert.equal(summary.version, 'zhaowu_ziwei_grammar_summary_v1');
  assert.match(summary.paragraph, /四化.*吉凶表/);
  assert.match(summary.paragraph, /本命四化/);
  assert.match(summary.paragraph, /具体事件保证|单一流年/);
  assert.ok(summary.evidence.length >= 4);
});