import { addCivilDays, ganzhiOf, toLunar, yearMonthPillars } from '../bazi/calendar';
import { EARTHLY_BRANCHES, type EarthlyBranch, type HeavenlyStem } from './constants';
import type { NormalizedZiweiBirth } from './core';

export type ZiweiLateZiPolicy = 'current_day' | 'forward_day';
export type ZiweiLeapMonthPolicy = 'same_month' | 'next_month' | 'split_after_15';
export type ZiweiYearBoundary = 'lunar_new_year' | 'lichun';
export type ZiweiTimeConfidence = 'certain' | 'unknown';

export type ZiweiCalendarProfile = {
  id: string;
  lateZiPolicy: ZiweiLateZiPolicy;
  leapMonthPolicy: ZiweiLeapMonthPolicy;
  yearBoundary: ZiweiYearBoundary;
};

export type ZiweiCivilDateTime = {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
};

export type ZiweiNormalizedCalendarBirth = {
  normalizationVersion: 'ziwei_calendar_normalization_v0.4.1';
  productionReady: true;
  calculationDataReady: true;
  primarySourceComplete: false;
  profile: ZiweiCalendarProfile;
  timeConfidence: ZiweiTimeConfidence;
  rawTimeIndex: number | null;
  isLateZi: boolean | null;
  timeBranch: EarthlyBranch | null;
  civilDate: ZiweiCivilDateTime;
  effectiveCivilDate: { year: number; month: number; day: number };
  sourceLunarDate: { year: number; month: number; day: number; isLeap: boolean };
  effectiveLunarDate: { year: number; month: number; day: number; isLeap: boolean };
  placementLunarMonth: number;
  placementLunarDay: number;
  effectiveYearGanzhi: string | null;
  coreInput: NormalizedZiweiBirth | null;
  blockedFields: string[];
  provenance: string[];
};

function assertCivilDate(input: ZiweiCivilDateTime) {
  if (!Number.isInteger(input.year) || input.year < 1900 || input.year > 2100) {
    throw new Error('Ziwei calendar normalization currently supports civil years 1900..2100');
  }
  if (!Number.isInteger(input.month) || input.month < 1 || input.month > 12) throw new Error('civil month must be 1..12');
  if (!Number.isInteger(input.day) || input.day < 1 || input.day > 31) throw new Error('civil day must be 1..31');
  if (input.hour != null && (!Number.isInteger(input.hour) || input.hour < 0 || input.hour > 23)) {
    throw new Error('civil hour must be 0..23');
  }
  if (input.minute != null && (!Number.isInteger(input.minute) || input.minute < 0 || input.minute > 59)) {
    throw new Error('civil minute must be 0..59');
  }
}

export function rawZiweiTimeIndexFromHour(hour: number): number {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) throw new Error('hour must be 0..23');
  if (hour === 23) return 12;
  if (hour === 0) return 0;
  return Math.floor((hour + 1) / 2);
}

export function timeBranchFromRawZiweiIndex(rawTimeIndex: number): EarthlyBranch {
  if (!Number.isInteger(rawTimeIndex) || rawTimeIndex < 0 || rawTimeIndex > 12) {
    throw new Error('rawTimeIndex must be 0..12');
  }
  return EARTHLY_BRANCHES[rawTimeIndex % 12];
}

function nextPlacementMonth(month: number): number {
  return month === 12 ? 1 : month + 1;
}

export function resolvePlacementLunarMonth(input: {
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
  rawTimeIndex: number | null;
  policy: ZiweiLeapMonthPolicy;
}): number {
  const { lunarMonth, lunarDay, isLeapMonth, rawTimeIndex, policy } = input;
  if (!isLeapMonth || policy === 'same_month') return lunarMonth;
  if (policy === 'next_month') return nextPlacementMonth(lunarMonth);
  // Modern deterministic profile used by iztro/x-iztro: leap month day 16+ counts
  // as next month, except raw late-Zi index 12.
  if (lunarDay > 15 && rawTimeIndex !== 12) return nextPlacementMonth(lunarMonth);
  return lunarMonth;
}

function lunarYearGanzhi(lunarYear: number): string {
  return ganzhiOf(((lunarYear - 1984) % 60 + 60) % 60);
}

function naiveCivilInstant(civil: ZiweiCivilDateTime, fallbackHour = 12): Date {
  return new Date(Date.UTC(civil.year, civil.month - 1, civil.day, civil.hour ?? fallbackHour, civil.minute ?? 0, 0));
}

function lichunYearGanzhi(civil: ZiweiCivilDateTime, timeConfidence: ZiweiTimeConfidence): string | null {
  if (timeConfidence === 'certain') return yearMonthPillars(naiveCivilInstant(civil)).year;
  const start = yearMonthPillars(new Date(Date.UTC(civil.year, civil.month - 1, civil.day, 0, 0, 0))).year;
  const end = yearMonthPillars(new Date(Date.UTC(civil.year, civil.month - 1, civil.day, 23, 59, 59))).year;
  return start === end ? start : null;
}

function splitGanzhi(ganzhi: string): { stem: HeavenlyStem; branch: EarthlyBranch } {
  const stem = ganzhi[0] as HeavenlyStem;
  const branch = ganzhi[1] as EarthlyBranch;
  return { stem, branch };
}

/**
 * Normalize a pre-corrected civil wall time into the Ziwei calculation contract.
 *
 * Upstream remains responsible for birthplace timezone and true-solar-time correction.
 * This layer intentionally does not mutate the locked Bazi calendar implementation; it
 * only reuses its deterministic civil/lunar and solar-term primitives.
 */
export function normalizeZiweiCalendarBirth(input: {
  civilDate: ZiweiCivilDateTime;
  timeConfidence: ZiweiTimeConfidence;
  profile: ZiweiCalendarProfile;
}): ZiweiNormalizedCalendarBirth {
  assertCivilDate(input.civilDate);
  const { civilDate, timeConfidence, profile } = input;

  if (timeConfidence === 'certain' && civilDate.hour == null) {
    throw new Error('certain birth time requires civilDate.hour');
  }

  const rawTimeIndex = timeConfidence === 'certain' ? rawZiweiTimeIndexFromHour(civilDate.hour!) : null;
  const isLateZi = rawTimeIndex == null ? null : rawTimeIndex === 12;
  const timeBranch = rawTimeIndex == null ? null : timeBranchFromRawZiweiIndex(rawTimeIndex);

  const sourceLunar = toLunar(civilDate.year, civilDate.month, civilDate.day);
  if (!sourceLunar) throw new Error('Unable to convert civil date to lunar date');

  const rollForward = isLateZi === true && profile.lateZiPolicy === 'forward_day';
  const effectiveCivil = rollForward
    ? addCivilDays(civilDate.year, civilDate.month, civilDate.day, 1)
    : { year: civilDate.year, month: civilDate.month, day: civilDate.day };
  const effectiveLunar = toLunar(effectiveCivil.year, effectiveCivil.month, effectiveCivil.day);
  if (!effectiveLunar) throw new Error('Unable to convert effective civil date to lunar date');

  const placementLunarMonth = resolvePlacementLunarMonth({
    lunarMonth: sourceLunar.month,
    lunarDay: sourceLunar.day,
    isLeapMonth: sourceLunar.isLeap,
    rawTimeIndex,
    policy: profile.leapMonthPolicy,
  });

  const effectiveYearGanzhi = profile.yearBoundary === 'lunar_new_year'
    ? lunarYearGanzhi(effectiveLunar.year)
    : lichunYearGanzhi(civilDate, timeConfidence);

  const blockedFields: string[] = [];
  if (timeConfidence === 'unknown') {
    blockedFields.push('bodyPalace', 'timeDrivenStars', 'changQu', 'kongJie', 'huoLing');
  }
  if (effectiveYearGanzhi == null) blockedFields.push('yearStem', 'yearBranch', 'yearDrivenStars', 'natalMutagens');

  let coreInput: NormalizedZiweiBirth | null = null;
  if (timeBranch && effectiveYearGanzhi) {
    const { stem, branch } = splitGanzhi(effectiveYearGanzhi);
    coreInput = {
      yearStem: stem,
      yearBranch: branch,
      lunarMonth: placementLunarMonth,
      lunarDay: effectiveLunar.day,
      timeBranch,
    };
  }

  return {
    normalizationVersion: 'ziwei_calendar_normalization_v0.4.1',
    productionReady: true,
    calculationDataReady: true,
    primarySourceComplete: false,
    profile: { ...profile },
    timeConfidence,
    rawTimeIndex,
    isLateZi,
    timeBranch,
    civilDate: { ...civilDate },
    effectiveCivilDate: effectiveCivil,
    sourceLunarDate: { ...sourceLunar },
    effectiveLunarDate: { ...effectiveLunar },
    placementLunarMonth,
    placementLunarDay: effectiveLunar.day,
    effectiveYearGanzhi,
    coreInput,
    blockedFields,
    provenance: [
      'calendar primitive: existing zhaowu bazi/calendar.ts (read-only dependency)',
      'late-Zi identity: raw time index 0..12 preserved; 12 is late Zi',
      'leap-month behavior is explicit through a named calculation profile',
      'year boundary is explicit: lunar_new_year or lichun',
      'birthplace timezone / true-solar-time correction must happen upstream',
    ],
  };
}
