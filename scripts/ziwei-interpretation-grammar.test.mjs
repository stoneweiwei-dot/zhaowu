import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ZIWEI_BRIGHTNESS_SEMANTICS,
  ZIWEI_CLAIM_SOURCE_POLICY,
  ZIWEI_INTERPRETATION_GRAMMAR_VERSION,
  ZIWEI_INTERPRETATION_POLICY,
  ZIWEI_MUTAGEN_OPERATION,
  ZIWEI_PALACE_CONTEXT,
  ZIWEI_PROCESS_MODIFIER,
  ZIWEI_STAR_FUNCTION,
  canUseStrongClaimLanguage,
  classifyScopeAlignment,
  describeMutagenOperation,
} from '../src/lib/ziwei/index.ts';

test('四化是作用方式而不是吉凶标签', () => {
  assert.equal(ZIWEI_MUTAGEN_OPERATION.祿.short, '什麼正在進入');
  assert.equal(ZIWEI_MUTAGEN_OPERATION.權.short, '什麼正在被推動');
  assert.equal(ZIWEI_MUTAGEN_OPERATION.科.short, '什麼正在被看見');
  assert.equal(ZIWEI_MUTAGEN_OPERATION.忌.short, '什麼正在付出代價');
  assert.match(describeMutagenOperation('忌').action, /阻滯|代價/);
  assert.doesNotMatch(describeMutagenOperation('忌').action, /必凶|災/);
});

test('主星功能、十二宫场景与庙旺语义分层存在', () => {
  assert.equal(Object.keys(ZIWEI_STAR_FUNCTION).length >= 18, true);
  assert.deepEqual(ZIWEI_STAR_FUNCTION.天機, ['機變', '規劃', '資訊', '調度']);
  assert.equal(Object.keys(ZIWEI_PALACE_CONTEXT).length, 12);
  for (const context of Object.values(ZIWEI_PALACE_CONTEXT)) {
    assert.ok(context.domain.length > 0);
    assert.ok(context.interpretationBoundary.length > 0);
  }
  assert.equal(Object.keys(ZIWEI_BRIGHTNESS_SEMANTICS).length, 7);
  assert.match(ZIWEI_INTERPRETATION_POLICY.brightnessRule, /不直接等同吉凶/);
  assert.match(ZIWEI_INTERPRETATION_POLICY.emptyPalaceRule, /空宮不等於空白或凶/);
});

test('十二宫都存在禁止误用边界', () => {
  assert.match(ZIWEI_PALACE_CONTEXT.疾厄.interpretationBoundary, /禁止疾病診斷/);
  assert.match(ZIWEI_PALACE_CONTEXT.夫妻.interpretationBoundary, /不可.*離婚/);
  assert.match(ZIWEI_INTERPRETATION_POLICY.bodyPalaceRule, /不取代命宮/);
});

test('辅煞只改过程性质，不内置疾病或灾祸诊断词', () => {
  const forbidden = /腫瘤|癌|中風|糖尿病|車禍|死亡|絕症|手術/;
  for (const words of Object.values(ZIWEI_PROCESS_MODIFIER)) {
    assert.doesNotMatch(words.join('、'), forbidden);
  }
  assert.deepEqual(ZIWEI_PROCESS_MODIFIER.擎羊, ['直接', '尖銳', '切割', '硬碰']);
  assert.deepEqual(ZIWEI_PROCESS_MODIFIER.陀羅, ['拖延', '糾纏', '反覆', '慢性消耗']);
});

test('本命大限流年使用叠层验证，单一流年不得升级成强结论', () => {
  assert.equal(classifyScopeAlignment(['yearly']), 'observation');
  assert.equal(canUseStrongClaimLanguage(['yearly']), false);
  assert.equal(classifyScopeAlignment(['natal', 'yearly']), 'supported');
  assert.equal(canUseStrongClaimLanguage(['natal', 'yearly']), true);
  assert.equal(classifyScopeAlignment(['natal', 'decadal', 'yearly']), 'reinforced');
});

test('解释政策锁定八字主判、本命不可被岁运覆盖、无数值严重度评分', () => {
  assert.equal(ZIWEI_INTERPRETATION_POLICY.primarySystem, '子平八字');
  assert.equal(ZIWEI_INTERPRETATION_POLICY.ziweiRole, '現象／場景驗證層');
  assert.equal(ZIWEI_INTERPRETATION_POLICY.natalImmutable, true);
  assert.equal(ZIWEI_INTERPRETATION_POLICY.numericSeverityScoringForbidden, true);
  assert.equal(ZIWEI_INTERPRETATION_POLICY.diagnosisForbidden, true);
  assert.equal(ZIWEI_INTERPRETATION_POLICY.minAlignedScopesForStrongClaim, 2);
  assert.match(ZIWEI_INTERPRETATION_POLICY.palaceStemSelfTransformationRule, /未有明確 profile 前不得混入/);
});

test('知识来源分层包含计算真值、解释层与隔离层', () => {
  assert.equal(ZIWEI_INTERPRETATION_GRAMMAR_VERSION, 'zhaowu_ziwei_interpretation_v1.1');
  assert.match(ZIWEI_CLAIM_SOURCE_POLICY.calculation_truth, /排盤/);
  assert.match(ZIWEI_CLAIM_SOURCE_POLICY.owner_material, /不得冒充古籍真值/);
  assert.match(ZIWEI_CLAIM_SOURCE_POLICY.quarantine, /禁止進入客戶結論/);
});