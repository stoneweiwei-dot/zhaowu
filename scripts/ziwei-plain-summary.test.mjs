import assert from 'node:assert/strict';
import { test } from 'node:test';

const { buildZiweiCoreChart, buildZiweiTruthExtension, buildZiweiPlainSummary } = await import('../src/lib/ziwei/index.ts');

function make(input, targetYear, targetStem, targetBranch, activeDecadalIndex = 3) {
  const chart = buildZiweiCoreChart(input, { mutagenProfile: 'south_iztro_v1' });
  const extension = buildZiweiTruthExtension({
    chart,
    directionBasis: 'male',
    targetYear: { year: targetYear, stem: targetStem, branch: targetBranch },
    activeDecadalIndex,
  });
  return { chart, extension };
}

const a = make({ yearStem: '甲', yearBranch: '子', lunarMonth: 1, lunarDay: 1, timeBranch: '子' }, 2026, '丙', '午', 2);
const b = make({ yearStem: '戊', yearBranch: '辰', lunarMonth: 8, lunarDay: 24, timeBranch: '寅' }, 2027, '丁', '未', 3);

test('Ziwei plain summary is personalized by actual chart + active phase', () => {
  const first = buildZiweiPlainSummary({ ...a, locale: 'zh-Hant', activeDecadalIndex: 2, targetYear: 2026 });
  const second = buildZiweiPlainSummary({ ...b, locale: 'zh-Hant', activeDecadalIndex: 3, targetYear: 2027 });
  assert.equal(first.version, 'zhaowu_ziwei_plain_summary_v1');
  assert.equal(first.paragraphs.length, 6);
  assert.ok(first.internalEvidence.length >= 6);
  assert.notEqual(first.paragraphs.join('\n'), second.paragraphs.join('\n'));
  assert.match(first.paragraphs.at(-1), /2026/);
  assert.match(second.paragraphs.at(-1), /2027/);
});

test('customer Chinese summary does not expose specialist Ziwei terms', () => {
  const report = buildZiweiPlainSummary({ ...a, locale: 'zh-Hant', activeDecadalIndex: 2, targetYear: 2026 });
  const text = `${report.paragraphs.join(' ')} ${report.closing}`;
  for (const banned of ['命宮', '官祿宮', '財帛宮', '福德宮', '夫妻宮', '三方四正', '化祿', '化權', '化科', '化忌', '擎羊', '陀羅', '地空', '地劫']) {
    assert.equal(text.includes(banned), false, `customer text leaked technical term: ${banned}`);
  }
});

test('English customer summary is plain English with no Chinese characters', () => {
  const report = buildZiweiPlainSummary({ ...b, locale: 'en', activeDecadalIndex: 3, targetYear: 2027 });
  const text = `${report.title} ${report.paragraphs.join(' ')} ${report.closing}`;
  assert.equal(/[\u3400-\u9fff]/u.test(text), false);
  assert.match(text, /2027/);
  assert.ok(text.length > 700);
});

test('internal evidence is retained for QA but separate from customer prose', () => {
  const report = buildZiweiPlainSummary({ ...a, locale: 'zh-Hans', activeDecadalIndex: 2, targetYear: 2026 });
  assert.ok(report.internalEvidence.some((item) => item.source === 'natal'));
  assert.ok(report.internalEvidence.some((item) => item.source === 'decadal'));
  assert.ok(report.internalEvidence.some((item) => item.source === 'yearly'));
  const customerText = report.paragraphs.join(' ');
  assert.equal(customerText.includes('no-major-star'), false);
});
