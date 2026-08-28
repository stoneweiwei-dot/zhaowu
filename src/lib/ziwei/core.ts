import {
  BRANCH_BUREAU_VALUE,
  BUREAU_BY_VALUE,
  EARTHLY_BRANCHES,
  FIRE_BELL_ANCHORS,
  FIVE_TIGER_START,
  HEAVENLY_STEMS,
  KUI_YUE_SOUTH,
  LUCUN_BY_STEM,
  MUTAGENS_QUANSHU_TRANSCRIPTION,
  MUTAGENS_SOUTH,
  PALACE_BRANCHES,
  PALACE_SEQUENCE,
  STEM_BUREAU_VALUE,
  TIANFU_OFFSETS,
  ZIWEI_OFFSETS,
  type EarthlyBranch,
  type HeavenlyStem,
  type PalaceBranch,
} from './constants';

export type ZiweiMutagenProfile = 'south_iztro_v1' | 'quanshu_transcription_v1';
export type ZiweiKuiYueProfile = 'south_iztro_v1';

export type NormalizedZiweiBirth = {
  yearStem: HeavenlyStem;
  yearBranch: EarthlyBranch;
  lunarMonth: number;
  lunarDay: number;
  timeBranch: EarthlyBranch;
};

export type ZiweiPalace = {
  id: (typeof PALACE_SEQUENCE)[number][0];
  name: (typeof PALACE_SEQUENCE)[number][1];
  branch: PalaceBranch;
  stem: HeavenlyStem;
  branchIndex: number;
  isBodyPalace: boolean;
};

export type ZiweiCoreChart = {
  calculationVersion: 'ziwei_truth_core_v0.4';
  productionReady: true;
  calculationDataReady: true;
  primarySourceComplete: false;
  boundaryPolicy: 'normalized_input_only';
  input: NormalizedZiweiBirth;
  soulPalace: PalaceBranch;
  bodyPalace: PalaceBranch;
  soulPalaceStem: HeavenlyStem;
  fiveElementsBureau: { name: '水二局' | '木三局' | '金四局' | '土五局' | '火六局'; number: 2 | 3 | 4 | 5 | 6 };
  palaces: ZiweiPalace[];
  majorStars: Record<string, PalaceBranch>;
  mutagens: Record<'祿' | '權' | '科' | '忌', string>;
  auxiliaries: Record<string, EarthlyBranch>;
  profiles: {
    mutagen: ZiweiMutagenProfile;
    kuiYue: ZiweiKuiYueProfile;
  };
  provenance: string[];
};

export function mod12(value: number): number {
  return ((value % 12) + 12) % 12;
}

export function palaceIndexOf(branch: EarthlyBranch | PalaceBranch): number {
  const index = PALACE_BRANCHES.indexOf(branch as PalaceBranch);
  if (index < 0) throw new Error(`Invalid palace branch: ${branch}`);
  return index;
}

export function earthlyIndexOf(branch: EarthlyBranch): number {
  const index = EARTHLY_BRANCHES.indexOf(branch);
  if (index < 0) throw new Error(`Invalid earthly branch: ${branch}`);
  return index;
}

export function branchFromPalaceIndex(index: number): PalaceBranch {
  return PALACE_BRANCHES[mod12(index)];
}

export function branchFromEarthlyIndex(index: number): EarthlyBranch {
  return EARTHLY_BRANCHES[mod12(index)];
}

function assertNormalizedBirth(input: NormalizedZiweiBirth) {
  if (!HEAVENLY_STEMS.includes(input.yearStem)) throw new Error('yearStem must be a valid heavenly stem');
  if (!EARTHLY_BRANCHES.includes(input.yearBranch)) throw new Error('yearBranch must be a valid earthly branch');
  if (!Number.isInteger(input.lunarMonth) || input.lunarMonth < 1 || input.lunarMonth > 12) {
    throw new Error('lunarMonth must already be normalized to 1..12');
  }
  if (!Number.isInteger(input.lunarDay) || input.lunarDay < 1 || input.lunarDay > 30) {
    throw new Error('lunarDay must be 1..30');
  }
  if (!EARTHLY_BRANCHES.includes(input.timeBranch)) throw new Error('timeBranch must be explicitly known');
}

export function calculateSoulAndBody(lunarMonth: number, timeBranch: EarthlyBranch) {
  if (!Number.isInteger(lunarMonth) || lunarMonth < 1 || lunarMonth > 12) throw new Error('lunarMonth must be 1..12');
  const monthIndex = lunarMonth - 1;
  const timeIndex = earthlyIndexOf(timeBranch);
  return {
    soulIndex: mod12(monthIndex - timeIndex),
    bodyIndex: mod12(monthIndex + timeIndex),
    soulBranch: branchFromPalaceIndex(monthIndex - timeIndex),
    bodyBranch: branchFromPalaceIndex(monthIndex + timeIndex),
  };
}

export function getPalaceStem(yearStem: HeavenlyStem, branch: EarthlyBranch | PalaceBranch): HeavenlyStem {
  const startStem = FIVE_TIGER_START[yearStem];
  const startIndex = HEAVENLY_STEMS.indexOf(startStem);
  const branchIndex = palaceIndexOf(branch);
  return HEAVENLY_STEMS[(startIndex + branchIndex) % 10];
}

export function buildPalaces(yearStem: HeavenlyStem, soulIndex: number, bodyIndex: number): ZiweiPalace[] {
  return PALACE_SEQUENCE.map(([id, name], sequence) => {
    const branchIndex = mod12(soulIndex - sequence);
    const branch = branchFromPalaceIndex(branchIndex);
    return {
      id,
      name,
      branch,
      stem: getPalaceStem(yearStem, branch),
      branchIndex,
      isBodyPalace: branchIndex === mod12(bodyIndex),
    };
  });
}

export function getFiveElementsBureau(stem: HeavenlyStem, branch: EarthlyBranch) {
  let value = STEM_BUREAU_VALUE[stem] + BRANCH_BUREAU_VALUE[branch];
  if (value > 5) value -= 5;
  const bureau = BUREAU_BY_VALUE[value as keyof typeof BUREAU_BY_VALUE];
  if (!bureau) throw new Error(`Unable to resolve five-elements bureau for ${stem}${branch}`);
  return bureau;
}

export function getMajorStarAnchors(lunarDay: number, bureauNumber: 2 | 3 | 4 | 5 | 6) {
  if (!Number.isInteger(lunarDay) || lunarDay < 1 || lunarDay > 30) throw new Error('lunarDay must be 1..30');
  let offset = 0;
  while ((lunarDay + offset) % bureauNumber !== 0) offset += 1;
  const quotient = (lunarDay + offset) / bureauNumber;
  let ziweiIndex = quotient - 1;
  ziweiIndex += offset % 2 === 0 ? offset : -offset;
  ziweiIndex = mod12(ziweiIndex);
  return { ziweiIndex, tianfuIndex: mod12(12 - ziweiIndex) };
}

export function getMajorStars(lunarDay: number, bureauNumber: 2 | 3 | 4 | 5 | 6): Record<string, PalaceBranch> {
  const { ziweiIndex, tianfuIndex } = getMajorStarAnchors(lunarDay, bureauNumber);
  const stars: Record<string, PalaceBranch> = {};
  for (const [star, offset] of Object.entries(ZIWEI_OFFSETS)) stars[star] = branchFromPalaceIndex(ziweiIndex + offset);
  for (const [star, offset] of Object.entries(TIANFU_OFFSETS)) stars[star] = branchFromPalaceIndex(tianfuIndex + offset);
  return stars;
}

export function getMutagens(stem: HeavenlyStem, profile: ZiweiMutagenProfile): Record<'祿' | '權' | '科' | '忌', string> {
  const table = profile === 'south_iztro_v1' ? MUTAGENS_SOUTH : MUTAGENS_QUANSHU_TRANSCRIPTION;
  return { ...table[stem] };
}

function yearBranchTrine(branch: EarthlyBranch): keyof typeof FIRE_BELL_ANCHORS {
  if (['申', '子', '辰'].includes(branch)) return '申子辰';
  if (['寅', '午', '戌'].includes(branch)) return '寅午戌';
  if (['巳', '酉', '丑'].includes(branch)) return '巳酉丑';
  return '亥卯未';
}

export function getAuxiliaries(input: NormalizedZiweiBirth, kuiYueProfile: ZiweiKuiYueProfile = 'south_iztro_v1'): Record<string, EarthlyBranch> {
  if (kuiYueProfile !== 'south_iztro_v1') throw new Error('Unsupported Kui/Yue profile');
  const timeIndex = earthlyIndexOf(input.timeBranch);
  const luIndex = earthlyIndexOf(LUCUN_BY_STEM[input.yearStem]);
  const fireBell = FIRE_BELL_ANCHORS[yearBranchTrine(input.yearBranch)];
  const kuiYue = KUI_YUE_SOUTH[input.yearStem];
  const haiIndex = earthlyIndexOf('亥');
  const chenIndex = earthlyIndexOf('辰');
  const xuIndex = earthlyIndexOf('戌');

  return {
    祿存: branchFromEarthlyIndex(luIndex),
    擎羊: branchFromEarthlyIndex(luIndex + 1),
    陀羅: branchFromEarthlyIndex(luIndex - 1),
    火星: branchFromEarthlyIndex(earthlyIndexOf(fireBell.fire) + timeIndex),
    鈴星: branchFromEarthlyIndex(earthlyIndexOf(fireBell.bell) + timeIndex),
    地空: branchFromEarthlyIndex(haiIndex - timeIndex),
    地劫: branchFromEarthlyIndex(haiIndex + timeIndex),
    左輔: branchFromEarthlyIndex(chenIndex + (input.lunarMonth - 1)),
    右弼: branchFromEarthlyIndex(xuIndex - (input.lunarMonth - 1)),
    文昌: branchFromEarthlyIndex(xuIndex - timeIndex),
    文曲: branchFromEarthlyIndex(chenIndex + timeIndex),
    天魁: kuiYue.kui,
    天鉞: kuiYue.yue,
  };
}

export function buildZiweiCoreChart(
  input: NormalizedZiweiBirth,
  options: { mutagenProfile: ZiweiMutagenProfile; kuiYueProfile?: ZiweiKuiYueProfile },
): ZiweiCoreChart {
  assertNormalizedBirth(input);
  const soulBody = calculateSoulAndBody(input.lunarMonth, input.timeBranch);
  const soulBranch = soulBody.soulBranch;
  const soulStem = getPalaceStem(input.yearStem, soulBranch);
  const bureau = getFiveElementsBureau(soulStem, soulBranch);

  return {
    calculationVersion: 'ziwei_truth_core_v0.4',
    productionReady: true,
    calculationDataReady: true,
    primarySourceComplete: false,
    boundaryPolicy: 'normalized_input_only',
    input: { ...input },
    soulPalace: soulBranch,
    bodyPalace: soulBody.bodyBranch,
    soulPalaceStem: soulStem,
    fiveElementsBureau: bureau,
    palaces: buildPalaces(input.yearStem, soulBody.soulIndex, soulBody.bodyIndex),
    majorStars: getMajorStars(input.lunarDay, bureau.number),
    mutagens: getMutagens(input.yearStem, options.mutagenProfile),
    auxiliaries: getAuxiliaries(input, options.kuiYueProfile),
    profiles: {
      mutagen: options.mutagenProfile,
      kuiYue: options.kuiYueProfile ?? 'south_iztro_v1',
    },
    provenance: [
      '紫微斗數全書: 命身十二宮/五虎遁/主星/祿羊陀/火鈴/空劫/左右昌曲/四化訣',
      'calculation rules are deterministic; school variants are explicit profiles',
      'calendar/leap-month/late-zi/year-boundary normalization intentionally not implemented in this layer',
    ],
  };
}
