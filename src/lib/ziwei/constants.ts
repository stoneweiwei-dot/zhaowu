export const PALACE_BRANCHES = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'] as const;
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

export type PalaceBranch = (typeof PALACE_BRANCHES)[number];
export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];
export type HeavenlyStem = (typeof HEAVENLY_STEMS)[number];

export const PALACE_SEQUENCE = [
  ['SOUL', '命'],
  ['SIBLINGS', '兄弟'],
  ['SPOUSE', '夫妻'],
  ['CHILDREN', '子女'],
  ['WEALTH', '財帛'],
  ['HEALTH', '疾厄'],
  ['TRAVEL', '遷移'],
  ['FRIENDS', '交友'],
  ['CAREER', '官祿'],
  ['PROPERTY', '田宅'],
  ['FORTUNE', '福德'],
  ['PARENTS', '父母'],
] as const;

export const FIVE_TIGER_START: Record<HeavenlyStem, HeavenlyStem> = {
  甲: '丙', 己: '丙',
  乙: '戊', 庚: '戊',
  丙: '庚', 辛: '庚',
  丁: '壬', 壬: '壬',
  戊: '甲', 癸: '甲',
};

export const STEM_BUREAU_VALUE: Record<HeavenlyStem, number> = {
  甲: 1, 乙: 1, 丙: 2, 丁: 2, 戊: 3, 己: 3, 庚: 4, 辛: 4, 壬: 5, 癸: 5,
};

export const BRANCH_BUREAU_VALUE: Record<EarthlyBranch, number> = {
  子: 1, 午: 1, 丑: 1, 未: 1,
  寅: 2, 申: 2, 卯: 2, 酉: 2,
  辰: 3, 戌: 3, 巳: 3, 亥: 3,
};

export const BUREAU_BY_VALUE = {
  1: { name: '木三局', number: 3 },
  2: { name: '金四局', number: 4 },
  3: { name: '水二局', number: 2 },
  4: { name: '火六局', number: 6 },
  5: { name: '土五局', number: 5 },
} as const;

export const ZIWEI_OFFSETS = {
  紫微: 0,
  天機: -1,
  太陽: -3,
  武曲: -4,
  天同: -5,
  廉貞: -8,
} as const;

export const TIANFU_OFFSETS = {
  天府: 0,
  太陰: 1,
  貪狼: 2,
  巨門: 3,
  天相: 4,
  天梁: 5,
  七殺: 6,
  破軍: 10,
} as const;

export const LUCUN_BY_STEM: Record<HeavenlyStem, EarthlyBranch> = {
  甲: '寅', 乙: '卯', 丙: '巳', 丁: '午', 戊: '巳', 己: '午', 庚: '申', 辛: '酉', 壬: '亥', 癸: '子',
};

export const FIRE_BELL_ANCHORS = {
  申子辰: { fire: '寅', bell: '戌' },
  寅午戌: { fire: '丑', bell: '卯' },
  巳酉丑: { fire: '卯', bell: '戌' },
  亥卯未: { fire: '酉', bell: '戌' },
} as const;

export const KUI_YUE_SOUTH: Record<HeavenlyStem, { kui: EarthlyBranch; yue: EarthlyBranch }> = {
  甲: { kui: '丑', yue: '未' },
  戊: { kui: '丑', yue: '未' },
  庚: { kui: '丑', yue: '未' },
  乙: { kui: '子', yue: '申' },
  己: { kui: '子', yue: '申' },
  辛: { kui: '午', yue: '寅' },
  壬: { kui: '卯', yue: '巳' },
  癸: { kui: '卯', yue: '巳' },
  丙: { kui: '亥', yue: '酉' },
  丁: { kui: '亥', yue: '酉' },
};

export const MUTAGENS_SOUTH = {
  甲: { 祿: '廉貞', 權: '破軍', 科: '武曲', 忌: '太陽' },
  乙: { 祿: '天機', 權: '天梁', 科: '紫微', 忌: '太陰' },
  丙: { 祿: '天同', 權: '天機', 科: '文昌', 忌: '廉貞' },
  丁: { 祿: '太陰', 權: '天同', 科: '天機', 忌: '巨門' },
  戊: { 祿: '貪狼', 權: '太陰', 科: '右弼', 忌: '天機' },
  己: { 祿: '武曲', 權: '貪狼', 科: '天梁', 忌: '文曲' },
  庚: { 祿: '太陽', 權: '武曲', 科: '太陰', 忌: '天同' },
  辛: { 祿: '巨門', 權: '太陽', 科: '文曲', 忌: '文昌' },
  壬: { 祿: '天梁', 權: '紫微', 科: '左輔', 忌: '武曲' },
  癸: { 祿: '破軍', 權: '巨門', 科: '太陰', 忌: '貪狼' },
} as const;

export const MUTAGENS_QUANSHU_TRANSCRIPTION = {
  ...MUTAGENS_SOUTH,
  壬: { 祿: '天梁', 權: '紫微', 科: '天府', 忌: '武曲' },
} as const;
