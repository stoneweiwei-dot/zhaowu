export type ZiweiClassicalElement = '木' | '火' | '土' | '金' | '水' | '水金' | '水木' | '火金' | null;
export type ZiweiClassicalDipper = '中天' | '南斗' | '北斗' | '南北斗' | null;
export type ZiweiClassicalPolarity = '陽' | '陰' | null;

export type ZiweiClassicalStarMetadata = {
  star: string;
  element: ZiweiClassicalElement;
  polarity: ZiweiClassicalPolarity;
  dipper: ZiweiClassicalDipper;
  transformation: string | null;
  office: string | null;
  sourceId: 'quanshu-v2-star-properties';
};

/**
 * Classical star attributes explicitly stated in 《紫微斗數全書》卷二
 * 「論諸星分屬南北斗化吉凶並分屬五行」.
 *
 * `polarity` is deliberately null: that passage does not provide a complete
 * yin/yang table, so this data layer will not infer one from later summaries.
 */
export const ZIWEI_CLASSICAL_STAR_METADATA: Record<string, ZiweiClassicalStarMetadata> = {
  紫微: { star: '紫微', element: '土', polarity: null, dipper: '南北斗', transformation: '帝座', office: '官祿主', sourceId: 'quanshu-v2-star-properties' },
  天機: { star: '天機', element: '木', polarity: null, dipper: '南斗', transformation: '善', office: '兄弟主', sourceId: 'quanshu-v2-star-properties' },
  祿存: { star: '祿存', element: '土', polarity: null, dipper: '北斗', transformation: '司爵貴壽', office: null, sourceId: 'quanshu-v2-star-properties' },
  太陽: { star: '太陽', element: '火', polarity: null, dipper: '南北斗', transformation: '貴', office: '官祿主', sourceId: 'quanshu-v2-star-properties' },
  天同: { star: '天同', element: '水金', polarity: null, dipper: '南斗', transformation: '福', office: '福德主', sourceId: 'quanshu-v2-star-properties' },
  廉貞: { star: '廉貞', element: '火', polarity: null, dipper: '北斗', transformation: '殺囚', office: '官祿主／身命次桃花', sourceId: 'quanshu-v2-star-properties' },
  武曲: { star: '武曲', element: '金', polarity: null, dipper: '北斗', transformation: '財', office: '財帛主', sourceId: 'quanshu-v2-star-properties' },
  天府: { star: '天府', element: '土', polarity: null, dipper: '南斗', transformation: '令', office: '財帛田宅主', sourceId: 'quanshu-v2-star-properties' },
  太陰: { star: '太陰', element: '水', polarity: null, dipper: '南北斗', transformation: '富', office: '財帛田宅主', sourceId: 'quanshu-v2-star-properties' },
  貪狼: { star: '貪狼', element: '水木', polarity: null, dipper: '北斗', transformation: '桃花殺', office: '主禍福', sourceId: 'quanshu-v2-star-properties' },
  巨門: { star: '巨門', element: '水', polarity: null, dipper: '北斗', transformation: '暗', office: '主是非', sourceId: 'quanshu-v2-star-properties' },
  天相: { star: '天相', element: '水', polarity: null, dipper: '南斗', transformation: '印', office: '官祿主', sourceId: 'quanshu-v2-star-properties' },
  天梁: { star: '天梁', element: '土', polarity: null, dipper: '南斗', transformation: '蔭', office: '壽星', sourceId: 'quanshu-v2-star-properties' },
  七殺: { star: '七殺', element: '火金', polarity: null, dipper: '南斗', transformation: '降星／遇帝為權', office: null, sourceId: 'quanshu-v2-star-properties' },
  破軍: { star: '破軍', element: '水', polarity: null, dipper: '北斗', transformation: '耗', office: '司夫妻子女奴僕', sourceId: 'quanshu-v2-star-properties' },
  文昌: { star: '文昌', element: '金', polarity: null, dipper: '南北斗', transformation: '司科甲', office: '文魁之首', sourceId: 'quanshu-v2-star-properties' },
  文曲: { star: '文曲', element: '水', polarity: null, dipper: '北斗', transformation: '主科甲', office: null, sourceId: 'quanshu-v2-star-properties' },
  天魁: { star: '天魁', element: '火', polarity: null, dipper: null, transformation: null, office: '吉星', sourceId: 'quanshu-v2-star-properties' },
  天鉞: { star: '天鉞', element: '火', polarity: null, dipper: null, transformation: null, office: '吉星', sourceId: 'quanshu-v2-star-properties' },
  天馬: { star: '天馬', element: '火', polarity: null, dipper: null, transformation: null, office: '吉星', sourceId: 'quanshu-v2-star-properties' },
  擎羊: { star: '擎羊', element: '金', polarity: null, dipper: '北斗', transformation: '刑', office: '浮星', sourceId: 'quanshu-v2-star-properties' },
  陀羅: { star: '陀羅', element: '金', polarity: null, dipper: '北斗', transformation: '忌', office: '助星', sourceId: 'quanshu-v2-star-properties' },
  火星: { star: '火星', element: '火', polarity: null, dipper: '南斗', transformation: null, office: '助星', sourceId: 'quanshu-v2-star-properties' },
  鈴星: { star: '鈴星', element: '火', polarity: null, dipper: '南斗', transformation: null, office: '助星', sourceId: 'quanshu-v2-star-properties' },
  地空: { star: '地空', element: '火', polarity: null, dipper: null, transformation: null, office: null, sourceId: 'quanshu-v2-star-properties' },
  地劫: { star: '地劫', element: '火', polarity: null, dipper: null, transformation: null, office: null, sourceId: 'quanshu-v2-star-properties' },
  紅鸞: { star: '紅鸞', element: '水', polarity: null, dipper: null, transformation: null, office: null, sourceId: 'quanshu-v2-star-properties' },
  天喜: { star: '天喜', element: '水', polarity: null, dipper: null, transformation: null, office: null, sourceId: 'quanshu-v2-star-properties' },
};

export function getZiweiClassicalStarMetadata(star: string): ZiweiClassicalStarMetadata | null {
  return ZIWEI_CLASSICAL_STAR_METADATA[star] ?? null;
}
