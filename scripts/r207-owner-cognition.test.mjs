import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  FIVE_ELEMENT_FIVE_CONSTANTS,
  FOUR_TOMB_OWNER_CHEATSHEET,
  OWNER_FIVE_ELEMENT_COGNITION_SOURCE,
  TEN_STEM_SOCIAL_SHORTHAND,
  ownerFiveElementCognitionInstructionRule,
} from '../src/lib/bazi/owner-five-element-cognition.ts';
import { buildFourTombsRuntimeText } from '../src/lib/bazi/four-tombs-runtime.ts';

function pillar(key, zhi) {
  return { key, zhi, ready: true };
}

test('r207 owner cognition material stays bounded to symbolic/training use', () => {
  assert.equal(OWNER_FIVE_ELEMENT_COGNITION_SOURCE.provenance, 'OWNER_MATERIAL');
  assert.equal(OWNER_FIVE_ELEMENT_COGNITION_SOURCE.authority, 'symbolic-training-only');
  assert.equal(ownerFiveElementCognitionInstructionRule.layer, 'training');
  const body = [...ownerFiveElementCognitionInstructionRule.rules, ...ownerFiveElementCognitionInstructionRule.guards].join('\n');
  assert.match(body, /缺某五行＝人格缺陷|五行缺失＝人格缺陷/);
  assert.match(body, /十干.*正式/);
  assert.match(body, /沖庫必開/);
});

test('r207 preserves five-constant mapping and all ten stem social shorthands', () => {
  assert.equal(FIVE_ELEMENT_FIVE_CONSTANTS.metal.virtue, '義');
  assert.equal(FIVE_ELEMENT_FIVE_CONSTANTS.wood.virtue, '仁');
  assert.equal(FIVE_ELEMENT_FIVE_CONSTANTS.water.virtue, '智');
  assert.equal(FIVE_ELEMENT_FIVE_CONSTANTS.fire.virtue, '禮');
  assert.equal(FIVE_ELEMENT_FIVE_CONSTANTS.earth.virtue, '信');
  assert.equal(Object.keys(TEN_STEM_SOCIAL_SHORTHAND).length, 10);
  assert.match(TEN_STEM_SOCIAL_SHORTHAND.甲, /不改/);
  assert.match(TEN_STEM_SOCIAL_SHORTHAND.癸, /爆發/);
});

test('r207 four-tomb cheat sheet keeps identity, climate and hidden stems separate', () => {
  assert.deepEqual(FOUR_TOMB_OWNER_CHEATSHEET.辰, { identity: '水庫', climate: '濕土', hidden: ['戊', '乙', '癸'] });
  assert.deepEqual(FOUR_TOMB_OWNER_CHEATSHEET.丑, { identity: '金庫', climate: '濕寒土', hidden: ['己', '癸', '辛'] });
  assert.deepEqual(FOUR_TOMB_OWNER_CHEATSHEET.未, { identity: '木庫', climate: '燥土', hidden: ['己', '丁', '乙'] });
  assert.deepEqual(FOUR_TOMB_OWNER_CHEATSHEET.戌, { identity: '火庫', climate: '燥土', hidden: ['戊', '辛', '丁'] });
});

test('r207 four-tomb runtime exposes climate/storehouse labels without changing truth guards', () => {
  const chart = {
    dayMaster: '壬',
    pillars: [pillar('year', '辰'), pillar('month', '酉'), pillar('day', '辰'), pillar('time', '寅')],
  };
  const text = buildFourTombsRuntimeText(chart);
  assert.match(text, /濕土／水庫/);
  assert.match(text, /本氣戊七殺/);
  assert.match(text, /庫氣癸劫財/);
  assert.match(text, /不得由四庫直接推出/);
});

test('r207 production registry wires the bounded cognition rule', async () => {
  const source = await readFile(new URL('../src/lib/bazi/instruction-database-base.ts', import.meta.url), 'utf8');
  assert.match(source, /ownerFiveElementCognitionInstructionRule/);
  assert.match(source, /ownerFiveElementCognitionInstructionRule,[\s\S]*lifestyleFiveElementSymbolismInstructionRule/);
});
