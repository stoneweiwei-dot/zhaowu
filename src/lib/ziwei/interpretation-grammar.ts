import type { ZiweiScope, ZiweiTransformation } from './horoscope';

export const ZIWEI_INTERPRETATION_GRAMMAR_VERSION = 'zhaowu_ziwei_interpretation_v1.0' as const;

export type ZiweiClaimClass =
  | 'calculation_truth'
  | 'classical_interpretation'
  | 'modern_interpretation'
  | 'owner_material'
  | 'quarantine';

export type ZiweiClaimStrength = 'observation' | 'supported' | 'reinforced';

export const ZIWEI_MUTAGEN_OPERATION: Record<ZiweiTransformation, {
  action: string;
  normal: readonly string[];
  overload: readonly string[];
  short: string;
}> = {
  祿: {
    action: '輸入／獲得／黏合',
    normal: ['資源進入', '關係增益', '機會增加', '需求較易得到滿足'],
    overload: ['貪多', '依賴順境', '黏住', '資源過載'],
    short: '什麼正在進入',
  },
  權: {
    action: '推動／控制／承擔',
    normal: ['決策', '執行', '主導', '責任集中'],
    overload: ['控制過強', '爭奪', '權責壓力', '強迫推進'],
    short: '什麼正在被推動',
  },
  科: {
    action: '顯化／規範／認可',
    normal: ['名譽', '資格', '表達', '被看見與被理解'],
    overload: ['形象負擔', '評價焦慮', '重形式', '為認可而過度修飾'],
    short: '什麼正在被看見',
  },
  忌: {
    action: '收縮／阻滯／代價',
    normal: ['聚焦問題', '修正', '反覆處理', '成本顯現'],
    overload: ['消耗', '執著', '延遲', '難以脫身'],
    short: '什麼正在付出代價',
  },
};

export const ZIWEI_PROCESS_MODIFIER = {
  左輔: ['幫助', '轉圜', '協作', '支援'],
  右弼: ['幫助', '轉圜', '協作', '支援'],
  文昌: ['文字', '資訊', '學習', '表達', '規範'],
  文曲: ['文字', '資訊', '學習', '表達', '規範'],
  天魁: ['機會', '提攜', '被識別', '關鍵支持'],
  天鉞: ['機會', '提攜', '被識別', '關鍵支持'],
  擎羊: ['直接', '尖銳', '切割', '硬碰'],
  陀羅: ['拖延', '糾纏', '反覆', '慢性消耗'],
  火星: ['突然', '快速', '爆發', '短時高壓'],
  鈴星: ['潛伏', '累積', '隱性壓力', '後發'],
  地空: ['抽空', '落差', '脫離', '預期落空'],
  地劫: ['損耗', '落差', '中斷', '資源流失感'],
} as const;

export type ZiweiPalaceName =
  | '命' | '兄弟' | '夫妻' | '子女' | '財帛' | '疾厄'
  | '遷移' | '交友' | '官祿' | '田宅' | '福德' | '父母';

export const ZIWEI_PALACE_CONTEXT: Record<ZiweiPalaceName, {
  domain: string;
  interpretationBoundary: string;
}> = {
  命: { domain: '自我定位、行為方式、主導感', interpretationBoundary: '只描述本人如何承接與表現，不直接等同某個外部事件。' },
  兄弟: { domain: '手足、同輩、資源分配與近身協作', interpretationBoundary: '不可由單一星曜直接判手足吉凶。' },
  夫妻: { domain: '親密關係、伴侶互動、承諾與權責', interpretationBoundary: '不可由單一化忌或煞曜直接判離婚。' },
  子女: { domain: '子女、作品、創造、下屬與延伸成果', interpretationBoundary: '需依問題語境區分子女與作品／專案，不可機械等同。' },
  財帛: { domain: '收入、資源配置、交易與價值交換', interpretationBoundary: '有財務能力不等於必然致富，仍需現實承載與其他宮位配合。' },
  疾厄: { domain: '身體承載、壓力出口、生活節奏與恢復', interpretationBoundary: '只作身心壓力與照顧提示，禁止疾病診斷、手術或死亡斷語。' },
  遷移: { domain: '外部環境、移動、異地、對外互動', interpretationBoundary: '只描述外部場景與適應方式，不直接保證遷移成敗。' },
  交友: { domain: '朋友、合作、團隊、客戶與人脈分工', interpretationBoundary: '不可把煞曜直接等同小人、背叛或法律事件。' },
  官祿: { domain: '職涯、角色、專業責任、決策與工作方式', interpretationBoundary: '職權或能力不等於必然升職；需看財帛、命、遷移等關聯。' },
  田宅: { domain: '家庭、居住、資產、空間與基礎盤', interpretationBoundary: '不可把星曜象義直接當房產漲跌或風水結論。' },
  福德: { domain: '精神節奏、內在需求、恢復方式與長期滿足', interpretationBoundary: '不可把精神壓力直接診斷成心理或身體疾病。' },
  父母: { domain: '長輩、制度、支持、資格與上級關係', interpretationBoundary: '不可由單一星曜直接判父母壽夭或必然衝突。' },
};

export const ZIWEI_RELATION_NETWORK = {
  natalPalace: '本宮＝主場景',
  trine: '三方＝資源、結構支援與互相牽動',
  opposite: '對宮＝外部回饋、張力、互補或鏡像',
} as const;

export const ZIWEI_INTERPRETATION_POLICY = {
  primarySystem: '子平八字',
  ziweiRole: '現象／場景驗證層',
  syntax: ['星曜定功能', '宮位定場景', '四化定變化方式', '輔煞定過程性質', '三方四正定結構關聯', '大限流年定觸發時間'],
  minAlignedScopesForStrongClaim: 2,
  natalImmutable: true,
  numericSeverityScoringForbidden: true,
  diagnosisForbidden: true,
  deterministicEventGuaranteeForbidden: true,
  bodyMode: 'symbolic_stress_only',
  bodyOutputAllowed: ['壓力較易落在哪類身體功能', '過程偏急／慢／滯／虛／緊／耗／反覆／外力', '哪個階段值得現實檢查與照顧'],
  bodyOutputForbidden: ['疾病名稱', '癌症／中風／糖尿病等診斷', '手術必然性', '死亡／壽夭', '停藥或替代醫療建議'],
  conflictPolicy: {
    calculation: '有流派差異時必須保留 profile／version，不得靜默合併。',
    interpretation: '不同來源解釋並存時保留差異並降級語氣，不硬湊單一答案。',
    crossSystem: '紫微不得覆蓋八字月令、調候、格局、病藥與承載；若現實反覆支持紫微，只能觸發八字回溯複核。',
  },
} as const;

export const ZIWEI_CLAIM_SOURCE_POLICY: Record<ZiweiClaimClass, string> = {
  calculation_truth: '可重現的排盤／星曜落宮／四化／歲運計算資料。',
  classical_interpretation: '可追溯傳統文本的星曜或宮位象義。',
  modern_interpretation: '近現代流派整理或可明確標記來源的現代轉譯。',
  owner_material: '站主提供的教學、實戰或整理素材；可作解釋參考，但不得冒充古籍真值。',
  quarantine: '醫療診斷、死亡／災禍直斷、未驗證數值權重、單一星曜直接對應重大事件等，禁止進入客戶結論。',
};

export function classifyScopeAlignment(scopes: readonly ZiweiScope[]): ZiweiClaimStrength {
  const unique = new Set(scopes);
  if (unique.size >= 3) return 'reinforced';
  if (unique.size >= ZIWEI_INTERPRETATION_POLICY.minAlignedScopesForStrongClaim) return 'supported';
  return 'observation';
}

export function canUseStrongClaimLanguage(scopes: readonly ZiweiScope[]): boolean {
  return classifyScopeAlignment(scopes) !== 'observation';
}

export function describeMutagenOperation(transformation: ZiweiTransformation) {
  return ZIWEI_MUTAGEN_OPERATION[transformation];
}

export function describeProcessModifier(star: keyof typeof ZIWEI_PROCESS_MODIFIER) {
  return ZIWEI_PROCESS_MODIFIER[star];
}

export function getPalaceContext(name: ZiweiPalaceName) {
  return ZIWEI_PALACE_CONTEXT[name];
}
