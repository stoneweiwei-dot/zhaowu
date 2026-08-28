import {
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  KUI_YUE_SOUTH,
  LUCUN_BY_STEM,
  PALACE_BRANCHES,
  PALACE_SEQUENCE,
  type EarthlyBranch,
  type HeavenlyStem,
  type PalaceBranch,
} from './constants';
import {
  branchFromPalaceIndex,
  getMutagens,
  getPalaceStem,
  mod12,
  palaceIndexOf,
  type ZiweiCoreChart,
  type ZiweiMutagenProfile,
} from './core';
import { ZIWEI_ENGINE_READINESS } from './profiles';

export type ZiweiDirectionBasis = 'male' | 'female';
export type ZiweiScope = 'natal' | 'decadal' | 'yearly';
export type ZiweiBrightness = '廟' | '旺' | '得' | '利' | '平' | '不' | '陷';
export type ZiweiTransformation = '祿' | '權' | '科' | '忌';

export const ZIWEI_REFERENCE_LOCK = {
  iztroVersion: '2.6.0',
  iztroCommit: '1ba89cca577c6d5d46754d6f49b6b51467c577d1',
} as const;

const MAJOR_STAR_BRIGHTNESS: Record<string, readonly ZiweiBrightness[]> = {
  紫微: ['旺', '旺', '得', '旺', '廟', '廟', '旺', '旺', '得', '旺', '平', '廟'],
  天機: ['得', '旺', '利', '平', '廟', '陷', '得', '旺', '利', '平', '廟', '陷'],
  太陽: ['旺', '廟', '旺', '旺', '旺', '得', '得', '陷', '不', '陷', '陷', '不'],
  武曲: ['得', '利', '廟', '平', '旺', '廟', '得', '利', '廟', '平', '旺', '廟'],
  天同: ['利', '平', '平', '廟', '陷', '不', '旺', '平', '平', '廟', '旺', '不'],
  廉貞: ['廟', '平', '利', '陷', '平', '利', '廟', '平', '利', '陷', '平', '利'],
  天府: ['廟', '得', '廟', '得', '旺', '廟', '得', '旺', '廟', '得', '廟', '廟'],
  太陰: ['旺', '陷', '陷', '陷', '不', '不', '利', '不', '旺', '廟', '廟', '廟'],
  貪狼: ['平', '利', '廟', '陷', '旺', '廟', '平', '利', '廟', '陷', '旺', '廟'],
  巨門: ['廟', '廟', '陷', '旺', '旺', '不', '廟', '廟', '陷', '旺', '旺', '不'],
  天相: ['廟', '陷', '得', '得', '廟', '得', '廟', '陷', '得', '得', '廟', '廟'],
  天梁: ['廟', '廟', '廟', '陷', '廟', '旺', '陷', '得', '廟', '陷', '廟', '旺'],
  七殺: ['廟', '旺', '廟', '平', '旺', '廟', '廟', '廟', '廟', '平', '旺', '廟'],
  破軍: ['得', '陷', '旺', '平', '廟', '旺', '得', '陷', '旺', '平', '廟', '旺'],
};

const SCOPE_CHANG_QU: Record<HeavenlyStem, { chang: EarthlyBranch; qu: EarthlyBranch }> = {
  甲: { chang: '巳', qu: '酉' },
  乙: { chang: '午', qu: '申' },
  丙: { chang: '申', qu: '午' },
  丁: { chang: '酉', qu: '巳' },
  戊: { chang: '申', qu: '午' },
  己: { chang: '酉', qu: '巳' },
  庚: { chang: '亥', qu: '卯' },
  辛: { chang: '子', qu: '寅' },
  壬: { chang: '寅', qu: '子' },
  癸: { chang: '卯', qu: '亥' },
};

const NIANJIE_BY_YEAR_BRANCH: Record<EarthlyBranch, PalaceBranch> = {
  子: '戌', 丑: '酉', 寅: '申', 卯: '未', 辰: '午', 巳: '巳',
  午: '辰', 未: '卯', 申: '寅', 酉: '丑', 戌: '子', 亥: '亥',
};

export type ZiweiStarPlacement = {
  star: string;
  scope: ZiweiScope;
  branch: PalaceBranch;
  palaceIndex: number;
  brightness: ZiweiBrightness | null;
};

export type ZiweiMutagenEvent = {
  scope: Exclude<ZiweiScope, 'natal'> | 'natal';
  transformation: ZiweiTransformation;
  targetStar: string;
  branch: PalaceBranch | null;
  palaceIndex: number | null;
  natalPalaceId: ZiweiCoreChart['palaces'][number]['id'] | null;
  natalPalaceName: ZiweiCoreChart['palaces'][number]['name'] | null;
};

export type ZiweiScopePalace = {
  branch: PalaceBranch;
  palaceIndex: number;
  id: ZiweiCoreChart['palaces'][number]['id'];
  name: ZiweiCoreChart['palaces'][number]['name'];
};

export type ZiweiDecadal = {
  index: number;
  ageStart: number;
  ageEnd: number;
  direction: 1 | -1;
  branch: PalaceBranch;
  palaceIndex: number;
  stem: HeavenlyStem;
  palaceNames: ZiweiScopePalace[];
  mutagens: ZiweiMutagenEvent[];
  movingStars: ZiweiStarPlacement[];
};

export type ZiweiYearlyScope = {
  targetYear: number;
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  lifeBranch: PalaceBranch;
  lifePalaceIndex: number;
  palaceNames: ZiweiScopePalace[];
  mutagens: ZiweiMutagenEvent[];
  movingStars: ZiweiStarPlacement[];
};

export type ZiweiActivationEvent = {
  scope: Exclude<ZiweiScope, 'natal'>;
  sourceType: 'mutagen' | 'moving_star' | 'palace_overlap';
  sourceName: string;
  targetStar?: string;
  branch: PalaceBranch;
  palaceIndex: number;
  natalPalaceId: ZiweiCoreChart['palaces'][number]['id'];
  natalPalaceName: ZiweiCoreChart['palaces'][number]['name'];
  relationToNatalLife: 'same' | 'opposite' | 'trine' | 'adjacent' | 'other';
};

export type ZiweiTruthExtension = {
  truthVersion: 'ziwei_truth_extension_v0.5';
  productionReady: true;
  calculationDataReady: true;
  primarySourceComplete: false;
  calculationProfileId: typeof ZIWEI_ENGINE_READINESS.profile.id;
  referenceLock: typeof ZIWEI_REFERENCE_LOCK;
  natalStars: ZiweiStarPlacement[];
  natalMutagens: ZiweiMutagenEvent[];
  decadals: ZiweiDecadal[];
  yearly: ZiweiYearlyScope | null;
  activationEvents: ZiweiActivationEvent[];
};

export function getTianma(branch: EarthlyBranch): PalaceBranch {
  if (['申', '子', '辰'].includes(branch)) return '寅';
  if (['寅', '午', '戌'].includes(branch)) return '申';
  if (['巳', '酉', '丑'].includes(branch)) return '亥';
  return '巳';
}

export function getHongluanTianxi(branch: EarthlyBranch): { hongluan: PalaceBranch; tianxi: PalaceBranch } {
  const hongluanIndex = mod12(palaceIndexOf('卯') - EARTHLY_BRANCHES.indexOf(branch));
  return {
    hongluan: branchFromPalaceIndex(hongluanIndex),
    tianxi: branchFromPalaceIndex(hongluanIndex + 6),
  };
}

export function getMajorStarBrightness(star: string, branch: EarthlyBranch | PalaceBranch): ZiweiBrightness | null {
  const row = MAJOR_STAR_BRIGHTNESS[star];
  if (!row) return null;
  return row[palaceIndexOf(branch)] ?? null;
}

function starPlacement(star: string, scope: ZiweiScope, branch: EarthlyBranch | PalaceBranch): ZiweiStarPlacement {
  const fixedBranch = branchFromPalaceIndex(palaceIndexOf(branch));
  return {
    star,
    scope,
    branch: fixedBranch,
    palaceIndex: palaceIndexOf(fixedBranch),
    brightness: scope === 'natal' ? getMajorStarBrightness(star, fixedBranch) : null,
  };
}

export function getNatalStarPlacements(chart: ZiweiCoreChart): ZiweiStarPlacement[] {
  const placements: ZiweiStarPlacement[] = [];
  for (const [star, branch] of Object.entries(chart.majorStars)) placements.push(starPlacement(star, 'natal', branch));
  for (const [star, branch] of Object.entries(chart.auxiliaries)) placements.push(starPlacement(star, 'natal', branch));
  placements.push(starPlacement('天馬', 'natal', getTianma(chart.input.yearBranch)));
  const { hongluan, tianxi } = getHongluanTianxi(chart.input.yearBranch);
  placements.push(starPlacement('紅鸞', 'natal', hongluan), starPlacement('天喜', 'natal', tianxi));
  return placements;
}

export function getScopeMovingStars(
  stem: HeavenlyStem,
  branch: EarthlyBranch,
  scope: Exclude<ZiweiScope, 'natal'>,
): ZiweiStarPlacement[] {
  const lu = LUCUN_BY_STEM[stem];
  const luIndex = palaceIndexOf(lu);
  const kuiYue = KUI_YUE_SOUTH[stem];
  const changQu = SCOPE_CHANG_QU[stem];
  const { hongluan, tianxi } = getHongluanTianxi(branch);
  const stars: Array<[string, EarthlyBranch | PalaceBranch]> = [
    ['天魁', kuiYue.kui],
    ['天鉞', kuiYue.yue],
    ['文昌', changQu.chang],
    ['文曲', changQu.qu],
    ['祿存', lu],
    ['擎羊', branchFromPalaceIndex(luIndex + 1)],
    ['陀羅', branchFromPalaceIndex(luIndex - 1)],
    ['天馬', getTianma(branch)],
    ['紅鸞', hongluan],
    ['天喜', tianxi],
  ];
  if (scope === 'yearly') stars.push(['年解', NIANJIE_BY_YEAR_BRANCH[branch]]);
  return stars.map(([star, target]) => starPlacement(star, scope, target));
}

function findNatalBranch(chart: ZiweiCoreChart, star: string): PalaceBranch | null {
  const major = chart.majorStars[star];
  if (major) return major;
  const aux = chart.auxiliaries[star];
  return aux ? branchFromPalaceIndex(palaceIndexOf(aux)) : null;
}

function natalPalaceAt(chart: ZiweiCoreChart, branch: EarthlyBranch | PalaceBranch) {
  const targetIndex = palaceIndexOf(branch);
  return chart.palaces.find((palace) => palace.branchIndex === targetIndex) ?? null;
}

export function getMutagenEvents(
  chart: ZiweiCoreChart,
  stem: HeavenlyStem,
  scope: ZiweiScope,
  profile: ZiweiMutagenProfile = chart.profiles.mutagen,
): ZiweiMutagenEvent[] {
  const mutagens = getMutagens(stem, profile);
  return (Object.entries(mutagens) as Array<[ZiweiTransformation, string]>).map(([transformation, targetStar]) => {
    const branch = findNatalBranch(chart, targetStar);
    const natalPalace = branch ? natalPalaceAt(chart, branch) : null;
    return {
      scope,
      transformation,
      targetStar,
      branch,
      palaceIndex: branch ? palaceIndexOf(branch) : null,
      natalPalaceId: natalPalace?.id ?? null,
      natalPalaceName: natalPalace?.name ?? null,
    };
  });
}

export function getScopePalaces(lifeIndex: number): ZiweiScopePalace[] {
  return PALACE_BRANCHES.map((branch, palaceIndex) => {
    const sequence = mod12(lifeIndex - palaceIndex);
    const [id, name] = PALACE_SEQUENCE[sequence];
    return { branch, palaceIndex, id, name };
  });
}

export function getDecadalDirection(yearStem: HeavenlyStem, basis: ZiweiDirectionBasis): 1 | -1 {
  const yearIsYang = HEAVENLY_STEMS.indexOf(yearStem) % 2 === 0;
  const basisIsYang = basis === 'male';
  return yearIsYang === basisIsYang ? 1 : -1;
}

export function buildDecadals(chart: ZiweiCoreChart, basis: ZiweiDirectionBasis): ZiweiDecadal[] {
  const direction = getDecadalDirection(chart.input.yearStem, basis);
  const lifeIndex = palaceIndexOf(chart.soulPalace);
  return Array.from({ length: 12 }, (_, index) => {
    const palaceIndex = mod12(lifeIndex + direction * index);
    const branch = branchFromPalaceIndex(palaceIndex);
    const stem = getPalaceStem(chart.input.yearStem, branch);
    const ageStart = chart.fiveElementsBureau.number + 10 * index;
    return {
      index,
      ageStart,
      ageEnd: ageStart + 9,
      direction,
      branch,
      palaceIndex,
      stem,
      palaceNames: getScopePalaces(palaceIndex),
      mutagens: getMutagenEvents(chart, stem, 'decadal'),
      movingStars: getScopeMovingStars(stem, branch, 'decadal'),
    };
  });
}

export function buildYearlyScope(chart: ZiweiCoreChart, targetYear: number, stem: HeavenlyStem, branch: EarthlyBranch): ZiweiYearlyScope {
  if (!Number.isInteger(targetYear)) throw new Error('targetYear must be an integer');
  const lifePalaceIndex = palaceIndexOf(branch);
  return {
    targetYear,
    stem,
    branch,
    lifeBranch: branchFromPalaceIndex(lifePalaceIndex),
    lifePalaceIndex,
    palaceNames: getScopePalaces(lifePalaceIndex),
    mutagens: getMutagenEvents(chart, stem, 'yearly'),
    movingStars: getScopeMovingStars(stem, branch, 'yearly'),
  };
}

export function palaceRelation(originIndex: number, targetIndex: number): ZiweiActivationEvent['relationToNatalLife'] {
  const delta = mod12(targetIndex - originIndex);
  if (delta === 0) return 'same';
  if (delta === 6) return 'opposite';
  if (delta === 4 || delta === 8) return 'trine';
  if (delta === 1 || delta === 11) return 'adjacent';
  return 'other';
}

function activationFromBranch(
  chart: ZiweiCoreChart,
  scope: Exclude<ZiweiScope, 'natal'>,
  sourceType: ZiweiActivationEvent['sourceType'],
  sourceName: string,
  branch: PalaceBranch,
  targetStar?: string,
): ZiweiActivationEvent {
  const natalPalace = natalPalaceAt(chart, branch);
  if (!natalPalace) throw new Error(`Unable to resolve natal palace for ${branch}`);
  const palaceIndex = palaceIndexOf(branch);
  return {
    scope,
    sourceType,
    sourceName,
    targetStar,
    branch,
    palaceIndex,
    natalPalaceId: natalPalace.id,
    natalPalaceName: natalPalace.name,
    relationToNatalLife: palaceRelation(palaceIndexOf(chart.soulPalace), palaceIndex),
  };
}

export function buildActivationEvents(
  chart: ZiweiCoreChart,
  decadal: ZiweiDecadal | null,
  yearly: ZiweiYearlyScope | null,
): ZiweiActivationEvent[] {
  const events: ZiweiActivationEvent[] = [];
  if (decadal) {
    events.push(activationFromBranch(chart, 'decadal', 'palace_overlap', '大限命宮', decadal.branch));
    for (const event of decadal.mutagens) {
      if (event.branch) events.push(activationFromBranch(chart, 'decadal', 'mutagen', `大限化${event.transformation}`, event.branch, event.targetStar));
    }
    for (const star of decadal.movingStars) events.push(activationFromBranch(chart, 'decadal', 'moving_star', star.star, star.branch));
  }
  if (yearly) {
    events.push(activationFromBranch(chart, 'yearly', 'palace_overlap', '流年命宮', yearly.lifeBranch));
    for (const event of yearly.mutagens) {
      if (event.branch) events.push(activationFromBranch(chart, 'yearly', 'mutagen', `流年化${event.transformation}`, event.branch, event.targetStar));
    }
    for (const star of yearly.movingStars) events.push(activationFromBranch(chart, 'yearly', 'moving_star', star.star, star.branch));
  }
  return events;
}

export function buildZiweiTruthExtension(input: {
  chart: ZiweiCoreChart;
  directionBasis: ZiweiDirectionBasis;
  targetYear?: { year: number; stem: HeavenlyStem; branch: EarthlyBranch } | null;
  activeDecadalIndex?: number | null;
}): ZiweiTruthExtension {
  const natalStars = getNatalStarPlacements(input.chart);
  const natalMutagens = getMutagenEvents(input.chart, input.chart.input.yearStem, 'natal');
  const decadals = buildDecadals(input.chart, input.directionBasis);
  const yearly = input.targetYear
    ? buildYearlyScope(input.chart, input.targetYear.year, input.targetYear.stem, input.targetYear.branch)
    : null;
  const activeDecadal = input.activeDecadalIndex == null ? null : decadals[input.activeDecadalIndex] ?? null;
  return {
    truthVersion: 'ziwei_truth_extension_v0.5',
    productionReady: ZIWEI_ENGINE_READINESS.calculationDataReady,
    calculationDataReady: ZIWEI_ENGINE_READINESS.calculationDataReady,
    primarySourceComplete: ZIWEI_ENGINE_READINESS.primarySourceComplete,
    calculationProfileId: ZIWEI_ENGINE_READINESS.profile.id,
    referenceLock: ZIWEI_REFERENCE_LOCK,
    natalStars,
    natalMutagens,
    decadals,
    yearly,
    activationEvents: buildActivationEvents(input.chart, activeDecadal, yearly),
  };
}
