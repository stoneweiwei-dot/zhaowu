import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const styleSource = await readFile(new URL('../src/lib/report/paid-report-style.ts', import.meta.url), 'utf8');
const docsSource = await readFile(new URL('../docs/PAID-REPORT-STYLE-v1.0.md', import.meta.url), 'utf8');

test('paid report style contract is production-locked', () => {
  for (const required of [
    'ZW-PAID-ART-REPORT-1.0',
    '命局证据 → 命理作用 → 人生含义 → 视觉象征',
    '9:16 iPhone优先',
    'STONE 原創',
    '护法/法器：必须由命局结果推导'
  ]) {
    assert.match(styleSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('documentation and code use the same paid report contract id', () => {
  assert.match(docsSource, /ZW-PAID-ART-REPORT-1\.0/);
  assert.match(docsSource, /判断先于绘画/);
  assert.match(docsSource, /任何关键项失败：\*\*不得作为收费版交付。\*\*/);
});

test('premium composition formula is locked in both contract and docs', () => {
  for (const required of [
    '年干 = 天空气质、色温、光线性格',
    '月支 = 主空间类型',
    '日干 = 性情与精神质地',
    '法器必须结合全局喜用',
    '一幅统一画面',
  ]) {
    assert.match(docsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(styleSource, /compositionFormula/);
  assert.match(styleSource, /年干=天空气质与色温，年支=远景地貌/);
  assert.match(styleSource, /时干只提供法器的五行质地/);
});
