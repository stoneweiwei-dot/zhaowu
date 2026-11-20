import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeZiweiCalendarBirth,
  rawZiweiTimeIndexFromHour,
  resolvePlacementLunarMonth,
  timeBranchFromRawZiweiIndex,
} from '../src/lib/ziwei/index.ts';

const profile = (overrides = {}) => ({
  id: 'test-profile',
  lateZiPolicy: 'current_day',
  leapMonthPolicy: 'same_month',
  yearBoundary: 'lunar_new_year',
  ...overrides,
});

test('raw Ziwei time index preserves early Zi 0 and late Zi 12 as distinct identities', () => {
  assert.equal(rawZiweiTimeIndexFromHour(0), 0);
  assert.equal(rawZiweiTimeIndexFromHour(1), 1);
  assert.equal(rawZiweiTimeIndexFromHour(22), 11);
  assert.equal(rawZiweiTimeIndexFromHour(23), 12);
  assert.equal(timeBranchFromRawZiweiIndex(0), '子');
  assert.equal(timeBranchFromRawZiweiIndex(12), '子');
});

test('late-Zi policy is explicit and can cross Lunar New Year without losing raw index 12', () => {
  const current = normalizeZiweiCalendarBirth({
    civilDate: { year: 2026, month: 2, day: 16, hour: 23, minute: 30 },
    timeConfidence: 'certain',
    profile: profile({ lateZiPolicy: 'current_day' }),
  });
  const forward = normalizeZiweiCalendarBirth({
    civilDate: { year: 2026, month: 2, day: 16, hour: 23, minute: 30 },
    timeConfidence: 'certain',
    profile: profile({ lateZiPolicy: 'forward_day' }),
  });

  assert.equal(current.rawTimeIndex, 12);
  assert.equal(forward.rawTimeIndex, 12);
  assert.equal(current.isLateZi, true);
  assert.equal(forward.isLateZi, true);
  assert.equal(current.timeBranch, '子');
  assert.equal(forward.timeBranch, '子');
  assert.deepEqual(current.effectiveCivilDate, { year: 2026, month: 2, day: 16 });
  assert.deepEqual(forward.effectiveCivilDate, { year: 2026, month: 2, day: 17 });
  assert.equal(current.effectiveYearGanzhi, '乙巳');
  assert.equal(forward.effectiveYearGanzhi, '丙午');
  assert.equal(forward.effectiveLunarDate.month, 1);
  assert.equal(forward.effectiveLunarDate.day, 1);
});

test('year boundary profile reproduces lunar-new-year versus Lichun difference', () => {
  const lunarBoundary = normalizeZiweiCalendarBirth({
    civilDate: { year: 2026, month: 2, day: 10, hour: 12 },
    timeConfidence: 'certain',
    profile: profile({ yearBoundary: 'lunar_new_year' }),
  });
  const lichunBoundary = normalizeZiweiCalendarBirth({
    civilDate: { year: 2026, month: 2, day: 10, hour: 12 },
    timeConfidence: 'certain',
    profile: profile({ yearBoundary: 'lichun' }),
  });
  assert.equal(lunarBoundary.effectiveYearGanzhi, '乙巳');
  assert.equal(lichunBoundary.effectiveYearGanzhi, '丙午');
});

test('split-after-15 leap profile matches the modern deterministic rule and late-Zi exception', () => {
  const day15 = normalizeZiweiCalendarBirth({
    civilDate: { year: 2025, month: 8, day: 8, hour: 12 },
    timeConfidence: 'certain',
    profile: profile({ leapMonthPolicy: 'split_after_15' }),
  });
  const day16 = normalizeZiweiCalendarBirth({
    civilDate: { year: 2025, month: 8, day: 9, hour: 12 },
    timeConfidence: 'certain',
    profile: profile({ leapMonthPolicy: 'split_after_15' }),
  });
  const lateZiDay16 = normalizeZiweiCalendarBirth({
    civilDate: { year: 2025, month: 8, day: 9, hour: 23 },
    timeConfidence: 'certain',
    profile: profile({ leapMonthPolicy: 'split_after_15' }),
  });

  assert.equal(day15.sourceLunarDate.isLeap, true);
  assert.equal(day15.sourceLunarDate.month, 6);
  assert.equal(day15.sourceLunarDate.day, 15);
  assert.equal(day15.placementLunarMonth, 6);
  assert.equal(day16.sourceLunarDate.day, 16);
  assert.equal(day16.placementLunarMonth, 7);
  assert.equal(lateZiDay16.rawTimeIndex, 12);
  assert.equal(lateZiDay16.placementLunarMonth, 6);
});

test('leap month policy differences are explicit rather than silently merged', () => {
  assert.equal(resolvePlacementLunarMonth({ lunarMonth: 6, lunarDay: 3, isLeapMonth: true, rawTimeIndex: 5, policy: 'same_month' }), 6);
  assert.equal(resolvePlacementLunarMonth({ lunarMonth: 6, lunarDay: 3, isLeapMonth: true, rawTimeIndex: 5, policy: 'next_month' }), 7);
  assert.equal(resolvePlacementLunarMonth({ lunarMonth: 6, lunarDay: 16, isLeapMonth: true, rawTimeIndex: 5, policy: 'split_after_15' }), 7);
});

test('unknown birth time never defaults to Zi hour or produces a deterministic core chart input', () => {
  const normalized = normalizeZiweiCalendarBirth({
    civilDate: { year: 2026, month: 2, day: 10 },
    timeConfidence: 'unknown',
    profile: profile(),
  });
  assert.equal(normalized.rawTimeIndex, null);
  assert.equal(normalized.timeBranch, null);
  assert.equal(normalized.coreInput, null);
  assert.ok(normalized.blockedFields.includes('bodyPalace'));
  assert.ok(normalized.blockedFields.includes('changQu'));
  assert.ok(normalized.blockedFields.includes('kongJie'));
  assert.ok(normalized.blockedFields.includes('huoLing'));
});

test('normalization is production-ready and records that timezone/true-solar correction is upstream', () => {
  const normalized = normalizeZiweiCalendarBirth({
    civilDate: { year: 2026, month: 2, day: 10, hour: 12 },
    timeConfidence: 'certain',
    profile: profile(),
  });
  assert.equal(normalized.productionReady, true);
  assert.equal(normalized.calculationDataReady, true);
  assert.equal(normalized.primarySourceComplete, false);
  assert.ok(normalized.provenance.some((item) => item.includes('true-solar-time')));
  assert.ok(normalized.coreInput);
});