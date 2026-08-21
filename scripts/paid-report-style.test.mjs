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
