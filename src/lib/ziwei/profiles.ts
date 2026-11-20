import {
  ZIWEI_CALCULATION_DATA_READY,
  ZIWEI_PRIMARY_SOURCE_BLOCKERS,
  ZIWEI_PRIMARY_SOURCE_READY,
} from './source-registry';

export type ZiweiBrightnessProfile = 'iztro_2_6_0_v1';
export type ZiweiScopeStarProfile = 'iztro_2_6_0_v1';

export const ZIWEI_BRIGHTNESS_PROFILES = {
  iztro_2_6_0_v1: {
    id: 'iztro_2_6_0_v1',
    label: 'iztro 2.6.0 七級廟旺利陷',
    referenceCommit: '1ba89cca577c6d5d46754d6f49b6b51467c577d1',
    levels: ['廟', '旺', '得', '利', '平', '不', '陷'],
    schoolVariance: true,
  },
} as const;

export const ZIWEI_SCOPE_STAR_PROFILES = {
  iztro_2_6_0_v1: {
    id: 'iztro_2_6_0_v1',
    label: 'iztro 2.6.0 大限／流年流曜',
    referenceCommit: '1ba89cca577c6d5d46754d6f49b6b51467c577d1',
    decadalStars: ['天魁', '天鉞', '文昌', '文曲', '祿存', '擎羊', '陀羅', '天馬', '紅鸞', '天喜'],
    yearlyAdditionalStars: ['年解'],
    schoolVariance: true,
  },
} as const;

export const ZHAOWU_ZIWEI_CALCULATION_PROFILE = {
  id: 'zhaowu_ziwei_v0.5.2',
  brightness: 'iztro_2_6_0_v1' as ZiweiBrightnessProfile,
  scopeStars: 'iztro_2_6_0_v1' as ZiweiScopeStarProfile,
  mutagen: 'south_iztro_v1' as const,
  kuiYue: 'south_iztro_v1' as const,
  calendar: {
    lateZiPolicy: 'current_day',
    leapMonthPolicy: 'same_month',
    yearBoundary: 'lunar_new_year',
  },
} as const;

/**
 * Production readiness and historical-source completeness are intentionally separate.
 * The calculation data may be production-usable because every surviving school choice
 * is explicit and pinned, while `primarySourceComplete` remains false until no variant
 * or transcription dispute remains.
 */
export const ZIWEI_ENGINE_READINESS = {
  calculationDataReady: ZIWEI_CALCULATION_DATA_READY,
  primarySourceComplete: ZIWEI_PRIMARY_SOURCE_READY,
  primarySourceBlockers: ZIWEI_PRIMARY_SOURCE_BLOCKERS,
  profile: ZHAOWU_ZIWEI_CALCULATION_PROFILE,
} as const;
