import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ZHAOWU_ZIWEI_CALCULATION_PROFILE,
  ZIWEI_BRIGHTNESS_PROFILES,
  ZIWEI_CALCULATION_DATA_BLOCKERS,
  ZIWEI_CALCULATION_DATA_READY,
  ZIWEI_ENGINE_READINESS,
  ZIWEI_PRIMARY_SOURCE_BLOCKERS,
  ZIWEI_PRIMARY_SOURCE_READY,
  ZIWEI_RULE_SOURCES,
  ZIWEI_SCOPE_STAR_PROFILES,
  getScopeMovingStars,
} from '../src/lib/ziwei/index.ts';

test('计算资料可生产使用与古籍单一真值完成度是两个不同状态', () => {
  assert.equal(ZIWEI_CALCULATION_DATA_READY, true);
  assert.deepEqual(ZIWEI_CALCULATION_DATA_BLOCKERS, []);
  assert.equal(ZIWEI_PRIMARY_SOURCE_READY, false);
  assert.ok(ZIWEI_PRIMARY_SOURCE_BLOCKERS.length > 0);
  assert.ok(ZIWEI_PRIMARY_SOURCE_BLOCKERS.includes('majorStarBrightness'));
  assert.ok(ZIWEI_PRIMARY_SOURCE_BLOCKERS.includes('scopeChangQuKuiYue'));
});

test('昭梧 v0.5.2 把亮度与流曜集合明确锁到 iztro 2.6.0 profile', () => {
  assert.equal(ZHAOWU_ZIWEI_CALCULATION_PROFILE.id, 'zhaowu_ziwei_v0.5.2');
  assert.equal(ZHAOWU_ZIWEI_CALCULATION_PROFILE.brightness, 'iztro_2_6_0_v1');
  assert.equal(ZHAOWU_ZIWEI_CALCULATION_PROFILE.scopeStars, 'iztro_2_6_0_v1');
  assert.equal(ZIWEI_BRIGHTNESS_PROFILES.iztro_2_6_0_v1.referenceCommit, '1ba89cca577c6d5d46754d6f49b6b51467c577d1');
  assert.equal(ZIWEI_SCOPE_STAR_PROFILES.iztro_2_6_0_v1.referenceCommit, '1ba89cca577c6d5d46754d6f49b6b51467c577d1');
  assert.equal(ZIWEI_BRIGHTNESS_PROFILES.iztro_2_6_0_v1.schoolVariance, true);
  assert.equal(ZIWEI_SCOPE_STAR_PROFILES.iztro_2_6_0_v1.schoolVariance, true);
});

test('profile 声明的流曜集合与实际 deterministic 函数完全一致', () => {
  const declared = ZIWEI_SCOPE_STAR_PROFILES.iztro_2_6_0_v1;
  assert.deepEqual(
    getScopeMovingStars('甲', '子', 'decadal').map((item) => item.star),
    declared.decadalStars,
  );
  assert.deepEqual(
    getScopeMovingStars('甲', '子', 'yearly').map((item) => item.star),
    [...declared.decadalStars, ...declared.yearlyAdditionalStars],
  );
});

test('source registry 不再把派别差异误写成数据缺失', () => {
  assert.equal(ZIWEI_RULE_SOURCES.majorStarBrightness.id, 'brightness-iztro-2.6.0-v1');
  assert.equal(ZIWEI_RULE_SOURCES.scopeChangQuKuiYue.id, 'scope-stars-iztro-2.6.0-v1');
  assert.equal(ZIWEI_RULE_SOURCES.majorStarBrightness.confidence, 'pinned_implementation_only');
  assert.equal(ZIWEI_RULE_SOURCES.scopeChangQuKuiYue.confidence, 'pinned_implementation_only');
  assert.ok(ZIWEI_RULE_SOURCES.majorStarBrightness.note.includes('流派'));
  assert.ok(ZIWEI_RULE_SOURCES.scopeChangQuKuiYue.note.includes('不同派別'));
});

test('engine readiness 汇总对象保留 production usable / primary-source incomplete 双状态', () => {
  assert.equal(ZIWEI_ENGINE_READINESS.calculationDataReady, true);
  assert.equal(ZIWEI_ENGINE_READINESS.primarySourceComplete, false);
  assert.deepEqual(ZIWEI_ENGINE_READINESS.primarySourceBlockers, ZIWEI_PRIMARY_SOURCE_BLOCKERS);
  assert.equal(ZIWEI_ENGINE_READINESS.profile.id, 'zhaowu_ziwei_v0.5.2');
});
