import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const styleSource = await readFile(new URL('../src/lib/report/paid-report-style.ts', import.meta.url), 'utf8');
const narrativeSource = await readFile(new URL('../src/lib/report/personal-narrative.ts', import.meta.url), 'utf8');
const focusedSource = await readFile(new URL('../src/lib/report/focused-report.ts', import.meta.url), 'utf8');
const reportUiSource = await readFile(new URL('../src/components/paid-report-pages.tsx', import.meta.url), 'utf8');
const docsSource = await readFile(new URL('../docs/PAID-REPORT-STYLE-v2.0.md', import.meta.url), 'utf8');

test('paid report style contract is production-locked', () => {
  for (const required of [
    'ZW-PAID-ART-REPORT-2.0',
    '命局证据 → 命理作用 → 人生含义 → 视觉象征',
    '9:16 iPhone优先',
    'STONE 原創',
    '护法/法器：必须由命局结果推导'
  ]) {
    assert.match(styleSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('documentation and code use the same paid report contract id', () => {
  assert.match(docsSource, /ZW-PAID-ART-REPORT-2\.0/);
  assert.match(docsSource, /判斷先於敘事/);
  assert.match(docsSource, /任何關鍵項失敗：\*\*不得作為收費版交付。\*\*/);
});

test('premium composition formula is locked in both contract and docs', () => {
  for (const required of [
    '最終敘事是一個場景，不是四張拼貼卡',
    '天地／年柱',
    '場域／月柱',
    '主體／日柱',
    '出口／時柱',
    '法器不得由「某干支＝某物件」死表生成',
    '時辰未知時不補造未來、晚景或固定法器',
  ]) {
    assert.match(docsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(styleSource, /compositionFormula/);
  assert.match(styleSource, /年干=天空气质与色温，年支=远景地貌/);
  assert.match(styleSource, /时干只提供法器的五行质地/);
});

test('one-chart-one-scene contract is wired into the current continuous report', () => {
  assert.match(styleSource, /reportArchitecture/);
  assert.doesNotMatch(styleSource, /pageArchitecture/);
  assert.match(styleSource, /首屏直接答案仍在最前/);
  assert.match(styleSource, /不恢复固定九页／多 session/);
  assert.match(narrativeSource, /buildPersonalReportNarrative/);
  assert.match(narrativeSource, /evidenceHeading:\s*"Basis"|evidenceHeading:\s*hant \? "依據"/);
  assert.match(focusedSource, /narrative: buildPersonalReportNarrative\(result\)/);
  assert.match(reportUiSource, /<NarrativePlate narrative=\{narrative\}/);
});
