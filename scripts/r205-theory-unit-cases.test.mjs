import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  THEORY_UNIT_CASES,
  THEORY_UNIT_CASE_SOURCE,
  THEORY_UNIT_CASE_VERSION,
} from '../src/lib/bazi/theory-unit-cases.ts';
import { blindTheoryOperationalInstructionRule } from '../src/lib/bazi/blind-theory-instruction.ts';

test('r205 theory unit case registry is bounded owner material', () => {
  assert.equal(THEORY_UNIT_CASE_VERSION, '0.1');
  assert.equal(THEORY_UNIT_CASE_SOURCE.provenance, 'OWNER_MATERIAL');
  assert.equal(THEORY_UNIT_CASE_SOURCE.role, 'regression-only');
  assert.equal(THEORY_UNIT_CASES.length, 12);
  assert.equal(new Set(THEORY_UNIT_CASES.map((item) => item.id)).size, 12);
});

test('r205 cases preserve the intended failure boundaries', () => {
  const byId = Object.fromEntries(THEORY_UNIT_CASES.map((item) => [item.id, item]));
  assert.match(byId['TUC-01'].expected.join(' '), /宮位/);
  assert.match(byId['TUC-04'].failIf.join(' '), /見合即吉/);
  assert.match(byId['TUC-05'].failIf.join(' '), /逢沖必開庫/);
  assert.match(byId['TUC-09'].expected.join(' '), /不作重大事件確斷/);
  assert.match(byId['TUC-10'].expected.join(' '), /較高概率|合理推論/);
  assert.match(byId['TUC-12'].expected.join(' '), /做功鏈/);
});

test('r205 operational rule supplements rather than replaces CURRENT mainline', () => {
  assert.equal(blindTheoryOperationalInstructionRule.status, 'production');
  assert.equal(blindTheoryOperationalInstructionRule.layer, 'bazi');
  assert.ok(blindTheoryOperationalInstructionRule.rules.some((rule) => rule.includes('宮位先定')));
  assert.ok(blindTheoryOperationalInstructionRule.rules.some((rule) => rule.includes('原局定結構')));
  assert.ok(blindTheoryOperationalInstructionRule.guards.some((guard) => guard.includes('禁止把盲派口訣')));
  assert.ok(blindTheoryOperationalInstructionRule.guards.some((guard) => guard.includes('OWNER_MATERIAL')));
});

test('r205 production instruction registry includes the bounded rule', async () => {
  const source = await readFile(new URL('../src/lib/bazi/instruction-database-base.ts', import.meta.url), 'utf8');
  assert.match(source, /blindTheoryOperationalInstructionRule/);
  assert.match(source, /currentMasterRuntimeInstructionRule,[\s\S]*blindTheoryOperationalInstructionRule/);
});
