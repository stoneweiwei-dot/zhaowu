export type ZiweiSourceConfidence =
  | 'historical_text_cross_checked'
  | 'historical_text_single_transcription'
  | 'variant_locked'
  | 'pinned_implementation_only'
  | 'unverified';

export type ZiweiRuleSource = {
  id: string;
  label: string;
  confidence: ZiweiSourceConfidence;
  evidence: readonly string[];
  note?: string;
};

/**
 * Evidence registry for the deterministic Ziwei calculation layer.
 *
 * This is intentionally stricter than a bibliography: every calculation family is
 * classified by what kind of evidence currently supports it. A modern implementation
 * match is not silently promoted to historical-text verification, and genuine school
 * differences are preserved through explicit calculation profiles.
 */
export const ZIWEI_RULE_SOURCES = {
  soulBodyAndPalaces: {
    id: 'quanshu-v2-soul-body-palaces', label: '命身宮、十二宮', confidence: 'historical_text_cross_checked',
    evidence: ['《紫微斗數全書》卷二：安身命例、安十二宮例', '中國哲學書電子化計劃「紫微斗數」推算方法：安十二宮'],
  },
  fiveTigerPalaceStems: {
    id: 'quanshu-v2-five-tiger', label: '五虎遁宮干', confidence: 'historical_text_cross_checked',
    evidence: ['《紫微斗數全書》卷二：起五行寅例', '中國哲學書電子化計劃「紫微斗數」：起寅首、定納音五行局'],
  },
  fiveElementsBureau: {
    id: 'quanshu-v2-bureau', label: '五行局', confidence: 'historical_text_cross_checked',
    evidence: ['《紫微斗數全書》卷二：六十花甲子納音歌、五局紫微圖', '中國哲學書電子化計劃「紫微斗數」：水二、木三、金四、土五、火六局'],
  },
  ziweiAnchor: {
    id: 'quanshu-v2-ziwei-anchor', label: '紫微星定位', confidence: 'historical_text_cross_checked',
    evidence: ['《紫微斗數全書》卷二：五局紫微圖（30生日×5局）', '《紫微斗數全書》卷二安身命例：火六局正月初一紫微在酉之例', '中國哲學書電子化計劃「紫微斗數」：定紫微星算法'],
  },
  majorStarSequence: {
    id: 'quanshu-v2-major-stars', label: '十四主星星系排列', confidence: 'historical_text_cross_checked',
    evidence: ['《紫微斗數全書》卷二：安南北斗諸星訣', '中國哲學書電子化計劃「紫微斗數」：安主星'],
  },
  changQuNatal: {
    id: 'quanshu-v2-chang-qu', label: '文昌文曲（本命時系）', confidence: 'historical_text_cross_checked', evidence: ['《紫微斗數全書》卷二：安文昌文曲星訣'],
  },
  zuoYouNatal: {
    id: 'quanshu-v2-zuo-you', label: '左輔右弼（本命月系）', confidence: 'historical_text_cross_checked', evidence: ['《紫微斗數全書》卷二：安左輔右弼星訣'],
  },
  kuiYueNatal: {
    id: 'kui-yue-south-v1', label: '天魁天鉞', confidence: 'variant_locked',
    evidence: ['《紫微斗數全書》卷二安天魁天鉞訣（網路轉錄存在「豬狗／豬雞」字異）', '現代通行古訣：甲戊庚牛羊、乙己鼠猴、丙丁豬雞、辛馬虎、壬癸兔蛇'],
    note: '目前 south_iztro_v1 明確採丙丁亥酉；不把轉錄異文偷偷改寫成單一古本真值。',
  },
  tianmaNatal: {
    id: 'quanshu-v2-tianma', label: '天馬', confidence: 'historical_text_cross_checked', evidence: ['《紫微斗數全書》卷二：安天馬星訣'],
  },
  lucunYangTuoNatal: {
    id: 'quanshu-v2-lucun-yang-tuo', label: '祿存、擎羊、陀羅', confidence: 'historical_text_cross_checked', evidence: ['《紫微斗數全書》卷二：安祿存星訣、安擎羊陀羅二星訣'],
  },
  huoLingNatal: {
    id: 'quanshu-v2-huo-ling', label: '火星、鈴星', confidence: 'variant_locked',
    evidence: ['《紫微斗數全書》卷二：安火鈴二星訣（明載四组三合起位）', 'iztro 2.6.0 pinned implementation：由年支定起子時位，再順數生時'],
    note: '古訣正文足以鎖定四組起位；完整時辰步進另以 pinned deterministic implementation 交叉驗證。',
  },
  kongJieNatal: {
    id: 'quanshu-v2-kong-jie', label: '地空、地劫', confidence: 'historical_text_cross_checked', evidence: ['《紫微斗數全書》卷二：天空地劫訣（亥上子時，劫順空逆）'],
  },
  natalMutagensQuanshu: {
    id: 'quanshu-v2-mutagens', label: '《全書》十干四化', confidence: 'historical_text_cross_checked', evidence: ['《紫微斗數全書》卷二：安祿權科忌四星變化訣'],
    note: '壬干明載梁紫府武；與《全集》/現代南派梁紫左武分開保存。',
  },
  natalMutagensSouth: {
    id: 'south-mutagens-v1', label: '南派／《全集》四化 profile', confidence: 'variant_locked', evidence: ['現代《全集》系統通行表：壬梁紫左武；iztro 2.6.0 cross-check'],
    note: '與《全書》profile 並存，不做靜默合併。',
  },
  hongluanTianxi: {
    id: 'quanshu-v2-hongluan-tianxi', label: '紅鸞、天喜', confidence: 'historical_text_cross_checked', evidence: ['《紫微斗數全書》卷二：安紅鸞天喜訣'],
  },
  decadalDirection: {
    id: 'quanshu-v2-decadal-direction', label: '大限順逆', confidence: 'historical_text_cross_checked', evidence: ['《紫微斗數全書》卷二：安大限訣'],
  },
  decadalAgeStart: {
    id: 'quanshu-v2-decadal-age-start', label: '大限起歲', confidence: 'historical_text_cross_checked', evidence: ['《紫微斗數全書》卷二五局圖題：水二、木三、金四、土五、火六局起歲'],
  },
  yearlyLucunYangTuo: {
    id: 'quanshu-v2-yearly-lucun-yang-tuo', label: '流祿、流羊、流陀', confidence: 'historical_text_cross_checked', evidence: ['《紫微斗數全書》卷二：安流祿流羊流陀訣（己丑年午／未／巳例）'],
  },
  majorStarBrightness: {
    id: 'brightness-iztro-2.6.0-v1', label: '十四主星完整廟旺利陷', confidence: 'pinned_implementation_only',
    evidence: [
      'iztro 2.6.0 commit 1ba89cca577c6d5d46754d6f49b6b51467c577d1：完整 14×12 七級亮度表',
      '《紫微斗數全書》卷一：十二宮諸星得地／失陷諸訣，可核對大量強弱落點但不是同一張七級表',
      '王亭之《中州派紫微斗數初級講義》：正曜廟旺用法與現代七級表存在口徑差異',
    ],
    note: '廟旺表具有流派／版本差異；昭梧固定採 iztro_2_6_0_v1，不宣稱其為唯一古籍表。',
  },
  scopeChangQuKuiYue: {
    id: 'scope-stars-iztro-2.6.0-v1', label: '大限／流年流曜 profile', confidence: 'pinned_implementation_only',
    evidence: [
      '王亭之《中州派紫微斗數初級講義》：大限按宮干取四化、祿羊陀、魁鉞、昌曲，按宮支取天馬',
      'iztro 2.6.0 horoscopeStar.ts：魁鉞昌曲祿羊陀馬鸞喜；流年另加年解',
      '《紫微斗數全書》卷二：流祿流羊流陀明例',
    ],
    note: '不同派別對流曜集合不完全一致；昭梧固定採 iztro_2_6_0_v1，完整集合不可無版本標籤混用。',
  },
} as const satisfies Record<string, ZiweiRuleSource>;

const ZIWEI_RULE_SOURCE_ENTRIES = Object.entries(ZIWEI_RULE_SOURCES) as Array<[string, ZiweiRuleSource]>;

/** Any unverified calculation family blocks use of the deterministic data layer. */
export const ZIWEI_CALCULATION_DATA_BLOCKERS = ZIWEI_RULE_SOURCE_ENTRIES
  .filter(([, source]) => source.confidence === 'unverified')
  .map(([rule]) => rule);

/**
 * True means every implemented calculation family is either historically checked,
 * variant-locked, or pinned to an immutable implementation profile. It does not mean
 * all Ziwei schools use the same table.
 */
export const ZIWEI_CALCULATION_DATA_READY = ZIWEI_CALCULATION_DATA_BLOCKERS.length === 0;

/** Historical-source completeness is deliberately stricter than production usability. */
export const ZIWEI_PRIMARY_SOURCE_BLOCKERS = ZIWEI_RULE_SOURCE_ENTRIES
  .filter(([, source]) => source.confidence !== 'historical_text_cross_checked')
  .map(([rule]) => rule);

export const ZIWEI_PRIMARY_SOURCE_READY = ZIWEI_PRIMARY_SOURCE_BLOCKERS.length === 0;
