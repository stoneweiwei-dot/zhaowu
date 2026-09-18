import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  BAZI_ANALYSIS_MAINLINE,
  BAZI_DATA_VALIDATION_SUBSTEPS,
  BAZI_CURRENT_MASTER_SOURCE,
  BAZI_HARD_GUARDS,
  BAZI_RUNTIME_CONTRACT_VERSION,
  BAZI_RUNTIME_PATCH_SOURCES,
} from '../src/lib/bazi/runtime-contract.ts';

test('R6.2.1 is the machine-readable current Bazi runtime contract', () => {
  assert.equal(BAZI_RUNTIME_CONTRACT_VERSION, 'R6.2.1');
  assert.equal(BAZI_CURRENT_MASTER_SOURCE, 'docs/STONE-R6.2.1-CURRENT-MASTER.md');
  assert.equal(BAZI_ANALYSIS_MAINLINE.length, 20);
  assert.deepEqual(
    [BAZI_ANALYSIS_MAINLINE[0], BAZI_ANALYSIS_MAINLINE[1], BAZI_ANALYSIS_MAINLINE[6], BAZI_ANALYSIS_MAINLINE[8], BAZI_ANALYSIS_MAINLINE[9], BAZI_ANALYSIS_MAINLINE[14], BAZI_ANALYSIS_MAINLINE[19]],
    ['資料校驗', '從化真假／特殊格', 'PK-6 偏枯病藥 Gate', 'ODL（是否有路）', 'FC（流通結果）', 'LBX 四軸', '白話輸出'],
  );
  assert.deepEqual(BAZI_DATA_VALIDATION_SUBSTEPS, ['出生時間／時區／夏令時', '節氣換月／節氣切界', '曆法口徑', '跨日邏輯', '性別／出生地', '真太陽時必要性']);
  assert.ok(BAZI_RUNTIME_PATCH_SOURCES.includes('docs/STONE-R6.2.1-P2-STRUCTURAL-DYNAMICS.md'));
  assert.ok(BAZI_RUNTIME_PATCH_SOURCES.includes('docs/STONE-R6.2.1-P3-PINKU-BINGYAO-GATE.md'));
  assert.ok(BAZI_HARD_GUARDS.some((guard) => guard.includes('五行數量')));
  assert.ok(BAZI_HARD_GUARDS.some((guard) => guard.includes('缺什麼補什麼')));
  assert.ok(BAZI_HARD_GUARDS.some((guard) => guard.includes('合不等於化')));
  assert.ok(BAZI_HARD_GUARDS.some((guard) => guard.includes('偏枯')));
  assert.ok(BAZI_HARD_GUARDS.some((guard) => guard.includes('藥是能真正修復功能')));
});

test('current master is bound ahead of legacy instruction rules', async () => {
  const source = await readFile(new URL('../src/lib/bazi/instruction-database-base.ts', import.meta.url), 'utf8');
  assert.match(source, /ZW-CURRENT-MASTER-R6\.2\.1/);
  assert.match(source, /ZW-BAZI-PINKU-BINGYAO-P3/);
  assert.match(source, /currentMasterRuntimeInstructionRule,[\s\S]*groupMainlineEc7RuntimeInstructionRule,[\s\S]*pinkuBingyaoRuntimeInstructionRule,[\s\S]*directAnswerRoutingInstructionRule,[\s\S]*\.\.\.legacyInstructionDatabase/);
});

test('runtime interpretation does not rank Ten Gods by counted votes', async () => {
  const source = await readFile(new URL('../src/lib/bazi/interpret.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /function\s+countGods\s*\(/);
  assert.doesNotMatch(source, /function\s+topGod\s*\(/);
  assert.doesNotMatch(source, /可见十神侧重/);
  assert.match(source, /月令主气功能为/);
});

test('structure output exposes the active runtime contract for auditability', async () => {
  const source = await readFile(new URL('../src/lib/bazi/structure.ts', import.meta.url), 'utf8');
  assert.match(source, /runtimeContractVersion:\s*BAZI_RUNTIME_CONTRACT_VERSION/);
  assert.match(source, /runtimeMasterSource:\s*BAZI_CURRENT_MASTER_SOURCE/);
  assert.match(source, /runtimePatchSources:\s*BAZI_RUNTIME_PATCH_SOURCES/);
  assert.match(source, /requiredAnalysisOrder:\s*BAZI_ANALYSIS_MAINLINE/);
});
