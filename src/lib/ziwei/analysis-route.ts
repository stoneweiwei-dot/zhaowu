export const ZIWEI_ADVANCED_ANALYSIS_ROUTE_VERSION = 'zhaowu_ziwei_advanced_analysis_route_v1.0' as const;

export type ZiweiEvidenceLevel = 'provided' | 'deterministic_derivation' | 'unavailable';
export type ZiweiImpactLevel = 'low' | 'medium' | 'high' | 'very_high';
export type ZiweiTrend = 'favorable' | 'mixed' | 'caution' | 'neutral';

export type ZiweiAnalysisRouteStep = {
  id: string;
  title: string;
  purpose: string;
  requiredEvidence: readonly string[];
  unavailableRule?: string;
};

/**
 * 昭梧紫微斗數高階分析的固定順序。
 *
 * 原則：先結構、後飛化、再時間；同一結論必須盡量跨層驗證。
 * 不允許用「單星＝單一事件」取代完整結構，也不允許把缺失的專業版
 * 流月／流日／流時資料硬補成已知事實。
 */
export const ZIWEI_ADVANCED_ANALYSIS_ROUTE: readonly ZiweiAnalysisRouteStep[] = [
  {
    id: 'source_boundary',
    title: '資料邊界與真值分層',
    purpose: '先標記哪些是來源直接提供、哪些可由已知規則確定推導、哪些目前無法驗證。',
    requiredEvidence: ['排盤來源', '版本／profile', '出生資料', '已提供歲運層級'],
  },
  {
    id: 'natal_backbone',
    title: '本命骨架',
    purpose: '先抓全盤主軸，不以單星逐宮斷語取代整體結構。',
    requiredEvidence: ['命宮', '身宮', '主星', '輔煞', '廟旺利陷'],
  },
  {
    id: 'life_body_trines',
    title: '命身宮與三方四正',
    purpose: '以命、財、官、遷等結構判斷資源、能力與人生著力點。',
    requiredEvidence: ['命宮', '身宮', '三方', '對宮'],
  },
  {
    id: 'six_opposition_axes',
    title: '六組對宮軸線／河洛結構',
    purpose: '觀察六條宮位軸線的互補、張力與反覆主題。',
    requiredEvidence: ['十二宮定位', '六組對宮'],
  },
  {
    id: 'natal_four_transformations',
    title: '生年四化',
    purpose: '分析祿、權、科、忌落宮形成的本命資源、推動、顯化與成本鏈。',
    requiredEvidence: ['生年天干', '生年四化', '四化落宮'],
  },
  {
    id: 'palace_stem_flying_transformations',
    title: '十二宮宮干飛化',
    purpose: '逐宮觀察宮干四化飛往何宮，建立宮與宮之間的作用鏈。',
    requiredEvidence: ['十二宮宮干', '採用的十干四化 profile'],
    unavailableRule: '未選定或未驗證宮干四化 profile 時，不得把流派差異靜默合併。',
  },
  {
    id: 'qintian_self_transformations',
    title: '欽天向心／離心自化',
    purpose: '分析來源明示的向心、離心、自化與對宮化入，與生年四化及飛宮結構交叉驗證。',
    requiredEvidence: ['明示自化符號或已驗證欽天 profile'],
    unavailableRule: '來源未提供自化符號、且站內沒有已驗證 profile 時，必須標為無法驗證，不得自行補箭頭。',
  },
  {
    id: 'cause_palace',
    title: '來因宮',
    purpose: '以來因宮作為事件／因緣入口之一，再與其宮干飛化、對宮與三方交叉判讀。',
    requiredEvidence: ['來源明示來因宮或已驗證推導規則'],
    unavailableRule: '沒有可靠來源時不得自行指定來因宮。',
  },
  {
    id: 'decadal_transformations',
    title: '大限宮位與大限宮干四化',
    purpose: '先定十年主場景，再看大限宮干如何重新分配祿權科忌。',
    requiredEvidence: ['大限宮位', '大限宮干', '大限四化'],
  },
  {
    id: 'yearly_palace_transformations',
    title: '流年落宮與流年天干四化',
    purpose: '判斷年度觸發場景及該年四化作用，不把單一流年直接升格為必然事件。',
    requiredEvidence: ['流年落宮', '流年干支', '流年四化'],
  },
  {
    id: 'decadal_year_cross_validation',
    title: '大限 × 流年交叉驗證',
    purpose: '檢查限流疊宮、同一宮位／同一主題是否在本命、大限、流年重複引動。',
    requiredEvidence: ['本命', '大限', '流年'],
  },
  {
    id: 'domain_synthesis',
    title: '人生主題綜合',
    purpose: '把前述結構整合到健康、學業、事業、財運、人際、婚姻感情，而不是重新做單星列表。',
    requiredEvidence: ['至少兩個相互支持的宮位／四化／歲運訊號'],
  },
  {
    id: 'key_windows',
    title: '關鍵時間窗口',
    purpose: '對重要年份或區間標示主題、吉凶傾向、影響程度與注意事項。',
    requiredEvidence: ['大限', '流年', '重複引動證據'],
  },
  {
    id: 'practical_advice',
    title: '實務建議',
    purpose: '把象義翻譯為可執行的風險控制、溝通、工作、財務與生活建議。',
    requiredEvidence: ['前述綜合結論'],
  },
  {
    id: 'research_disclaimer',
    title: '研究／娛樂用途聲明',
    purpose: '提醒紫微斗數屬傳統術數與文化性解讀，不取代醫療、法律、財務等專業意見。',
    requiredEvidence: [],
  },
] as const;

export const ZIWEI_ADVANCED_ANALYSIS_POLICY = {
  order: '先本命結構 → 再四化飛化／自化 → 再大限流年 → 最後跨主題綜合',
  sourceBoundaryRequired: true,
  singleStarEventJudgmentForbidden: true,
  inventedMissingTimingDataForbidden: true,
  inventedSelfTransformationForbidden: true,
  crossLayerValidationPreferred: true,
  minimumAlignedLayersForMajorClaim: 2,
  professionalAddonRule: '來源沒有流月、流日、流時或專業版歲運資料時，只能分析現有層級；不得把推估寫成來源已提供。',
  qintianRule: '欽天向心／離心自化只在來源明示符號或已選定且驗證的 profile 下啟用；否則保留為 unavailable。',
  annualSequenceRule: '需要逐年分析時，每一年至少輸出流年落宮、主要主題、四化作用、吉凶傾向、影響程度與注意事項；若某欄缺乏可靠資料必須明示。',
  healthRule: '疾厄只作象徵性壓力與照顧提示，不作疾病診斷、手術必然性、死亡或壽夭斷語。',
  certaintyRule: '使用「傾向、窗口、較值得留意」等分級語言，禁止把術數象義寫成確定事件。',
} as const;

export const ZIWEI_DOMAIN_SYNTHESIS_ORDER = [
  '健康',
  '學業／學習',
  '事業',
  '財運',
  '人際／合作',
  '婚姻／感情',
] as const;

export const ZIWEI_ANNUAL_OUTPUT_FIELDS = [
  '流年落宮',
  '流年天干四化',
  '主要事件主題',
  '吉凶傾向',
  '影響程度',
  '注意事項',
] as const;

export function describeZiweiAdvancedAnalysisRoute(): string {
  return ZIWEI_ADVANCED_ANALYSIS_ROUTE.map((step, index) => `${index + 1}. ${step.title}`).join(' → ');
}
