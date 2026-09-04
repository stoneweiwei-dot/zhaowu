import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ZIWEI_ADVANCED_ANALYSIS_POLICY,
  ZIWEI_ADVANCED_ANALYSIS_ROUTE,
  ZIWEI_ADVANCED_ANALYSIS_ROUTE_VERSION,
  ZIWEI_ANNUAL_OUTPUT_FIELDS,
  ZIWEI_DOMAIN_SYNTHESIS_ORDER,
  describeZiweiAdvancedAnalysisRoute,
} from '../src/lib/ziwei/index.ts';

test('昭梧紫微高阶分析路线顺序固定', () => {
  assert.equal(ZIWEI_ADVANCED_ANALYSIS_ROUTE_VERSION, 'zhaowu_ziwei_advanced_analysis_route_v1.0');
  assert.deepEqual(
    ZIWEI_ADVANCED_ANALYSIS_ROUTE.map((step) => step.id),
    [
      'source_boundary',
      'natal_backbone',
      'life_body_trines',
      'six_opposition_axes',
      'natal_four_transformations',
      'palace_stem_flying_transformations',
      'qintian_self_transformations',
      'cause_palace',
      'decadal_transformations',
      'yearly_palace_transformations',
      'decadal_year_cross_validation',
      'domain_synthesis',
      'key_windows',
      'practical_advice',
      'research_disclaimer',
    ],
  );
  assert.match(describeZiweiAdvancedAnalysisRoute(), /本命骨架/);
  assert.match(describeZiweiAdvancedAnalysisRoute(), /欽天向心／離心自化/);
  assert.match(describeZiweiAdvancedAnalysisRoute(), /大限 × 流年交叉驗證/);
});

test('禁止单星断事、补造缺失专业岁运与自化', () => {
  assert.equal(ZIWEI_ADVANCED_ANALYSIS_POLICY.singleStarEventJudgmentForbidden, true);
  assert.equal(ZIWEI_ADVANCED_ANALYSIS_POLICY.inventedMissingTimingDataForbidden, true);
  assert.equal(ZIWEI_ADVANCED_ANALYSIS_POLICY.inventedSelfTransformationForbidden, true);
  assert.equal(ZIWEI_ADVANCED_ANALYSIS_POLICY.minimumAlignedLayersForMajorClaim, 2);
  assert.match(ZIWEI_ADVANCED_ANALYSIS_POLICY.professionalAddonRule, /不得把推估寫成來源已提供/);
  assert.match(ZIWEI_ADVANCED_ANALYSIS_POLICY.qintianRule, /unavailable/);
});

test('逐年与主题综合输出字段完整', () => {
  assert.deepEqual(ZIWEI_DOMAIN_SYNTHESIS_ORDER, ['健康', '學業／學習', '事業', '財運', '人際／合作', '婚姻／感情']);
  assert.deepEqual(ZIWEI_ANNUAL_OUTPUT_FIELDS, ['流年落宮', '流年天干四化', '主要事件主題', '吉凶傾向', '影響程度', '注意事項']);
  assert.match(ZIWEI_ADVANCED_ANALYSIS_POLICY.annualSequenceRule, /每一年至少輸出/);
  assert.match(ZIWEI_ADVANCED_ANALYSIS_POLICY.healthRule, /不作疾病診斷/);
  assert.match(ZIWEI_ADVANCED_ANALYSIS_POLICY.certaintyRule, /禁止把術數象義寫成確定事件/);
});
