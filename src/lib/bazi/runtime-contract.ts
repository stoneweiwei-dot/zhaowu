export const BAZI_RUNTIME_CONTRACT_VERSION = 'R6.2.1' as const;
export const BAZI_CURRENT_MASTER_SOURCE = 'docs/STONE-R6.2.1-CURRENT-MASTER.md' as const;
export const BAZI_RUNTIME_PATCH_SOURCES = [
  'docs/STONE-R6.2.1-P2-STRUCTURAL-DYNAMICS.md',
  'docs/STONE-R6.2.1-P3-PINKU-BINGYAO-GATE.md',
] as const;

/**
 * R6.2.2 is the CURRENT GOVERNANCE MASTER. It is an evidence/execution overlay,
 * not a rewrite of deterministic chart truth — the code-level engine identifier
 * intentionally remains R6.2.1 (see docs/STONE-R6.2.2-CURRENT-MASTER.md §8).
 */
export const BAZI_GOVERNANCE_MASTER_VERSION = 'R6.2.2' as const;
export const BAZI_GOVERNANCE_MASTER_SOURCE = 'docs/STONE-R6.2.2-CURRENT-MASTER.md' as const;
export const BAZI_SIX_MINIMUM_PATCHES_SOURCE = 'docs/STONE-R6.2.2-SIX-PATCHES.md' as const;
export const BAZI_MASTER_DECLARATION_SOURCE =
  'docs/STONE-R6.2.2-CURRENT-MASTER-DECLARATION.md' as const;

/**
 * Five-layer governance taxonomy — owner-specified 2026-09-27, verbatim scope.
 * This is a documentation / routing map only: it does not create a second
 * execution order and does not change BAZI_ANALYSIS_MAINLINE below. The six
 * minimum patches (see BAZI_SIX_MINIMUM_PATCHES_SOURCE) refine specific L2/L3/L4
 * items in place; they are not a separate sixth layer.
 */
export const BAZI_GOVERNANCE_LAYER_MODEL = [
  {
    layer: 'L1',
    name: 'CORE ZI-PING',
    source: BAZI_CURRENT_MASTER_SOURCE,
    scope: '月令、調候、根氣、格局、體用、病藥、制化、流通、承載。',
  },
  {
    layer: 'L2',
    name: 'STRUCTURAL PATCH',
    source: 'docs/STONE-R6.2.1-P2-STRUCTURAL-DYNAMICS.md, docs/STONE-R6.2.1-P3-PINKU-BINGYAO-GATE.md',
    scope: 'GF-13、TG-FS、P2、PK-6、EC-7、ODL→FC、墓庫、辰庫六態、NEG-QA。PATCH 01 擴展 GF-13、PATCH 02 把 ODL→FC 延伸為 ODL→FC→CAPACITY，均在本層原地加固，不新增第二套判法。',
  },
  {
    layer: 'L3',
    name: 'TEMPORAL / EVENT',
    source: 'BAZI_ANALYSIS_MAINLINE (原局→大運→流年→流月), LBX 四軸, kinship-runtime 六親事件鏈',
    scope: '原局 → 大運 → 流年 → 流月；LBX、事件分類、六親／事件對象定位。PATCH 03 時間層證據缺口與 PATCH 05 事件鏈分離在本層加固。',
  },
  {
    layer: 'L4',
    name: 'EVIDENCE / AUXILIARY',
    source: BAZI_GOVERNANCE_MASTER_SOURCE,
    scope: 'SRC、VAL、AUX、胎元、命宮、身宮、神煞、十干外應、紫微等旁證。PATCH 04 資料證據邊界與 PATCH 06 年度機制獨立／VAL-C 回溯降級在本層加固。',
  },
  {
    layer: 'L5',
    name: 'OPERATIONAL INFRASTRUCTURE',
    source: 'AGENTS.md, docs/INSTRUCTION-REGISTRY.md, docs/CURRENT-STATE.md, supabase/migrations',
    scope: 'Execution Manifest、G0–G4、REASONED、MSC、EVP、Conflict Matrix、SH-FECM、Regression、release ledger、classic_passages 古籍治理、部署／成本護欄。',
  },
] as const;

/**
 * PATCH 01｜GF-13 擴展：GF-13 不只檢查「格局真假」，而是檢查所有命名結構真假
 * （包括但不限於：傷官配印、殺印相生、財官印相生、官殺取清、木火通明、金白水清、
 * 水火既濟、食傷生財、比劫奪財／合作、從格）。硬規則：「有其名 ≠ 有其實」。
 */
export const BAZI_GF13_NAMED_STRUCTURE_EXAMPLES = [
  '傷官配印',
  '殺印相生',
  '財官印相生',
  '官殺取清',
  '木火通明',
  '金白水清',
  '水火既濟',
  '食傷生財',
  '比劫奪財／合作',
  '從格',
] as const;
export const BAZI_GF13_VERIFICATION_AXES = [
  '月令',
  '根氣',
  '調候',
  '承載',
  '制化',
  '流通',
  '反證',
] as const;

/**
 * PATCH 02｜ODL → FC → CAPACITY 三段：存在關係 ≠ 作用有效 ≠ 結果落地。
 * 禁止把前一階段直接等於後一階段。
 */
export const BAZI_ODL_FC_CAPACITY_STAGES = [
  { stage: 'ODL', question: '有沒有根／透／路（存在關係 existence）。' },
  { stage: 'FC', question: '作用是否真的有效（effectiveness）。' },
  { stage: 'CAPACITY', question: '結果是否能被日主／整體結構承載並落到現實（capacity）。' },
] as const;

/**
 * PATCH 03｜時間層 Evidence Gap：重大事件在原局／大運／流年分別記錄
 * PRESENT／ABSENT／UNKNOWN；流月只負責縮窗。禁止「流年 > 大運 > 原局」
 * 或「流年力量永遠最大」的固定階層語句。
 */
export const BAZI_TIME_LAYER_EVIDENCE_STATES = ['PRESENT', 'ABSENT', 'UNKNOWN'] as const;
export const BAZI_TIME_LAYERS_FOR_EVIDENCE_GAP = ['原局', '大運', '流年'] as const;
export const BAZI_TIME_LAYER_FIXED_STATEMENT =
  '原局定結構；大運定十年條件；流年定年度觸發；流月只縮小時間窗口。' as const;

/**
 * PATCH 04｜Data Evidence Boundary：命理輸出細度不得超過已知資料細度。
 * 例：只知道「住院」不得自行補病名；只知道「事故」不得補事故方式；
 * 只知道「官非」不得補罪名／判決；日期未知不得補年月日。UNKNOWN 就明確寫 UNKNOWN。
 */
export const BAZI_DATA_EVIDENCE_BOUNDARY_EXAMPLES = [
  { known: '住院', forbidden: '自行補病名' },
  { known: '事故', forbidden: '自行補事故方式' },
  { known: '官非', forbidden: '自行補罪名／判決' },
  { known: '日期未知', forbidden: '自行補年月日' },
] as const;

/**
 * PATCH 05｜Event Chain Separation：本人、配偶、父親、母親、兄弟姐妹、子女
 * 必須分別建立 Evidence Chain；同一年發生多件事情 ≠ 同一個命理機制。
 * 每條鏈固定四步：目標對象 → 原局根 → 大運場 → 流年觸發 → 現實反饋。
 */
export const BAZI_EVENT_CHAIN_ROLES = [
  '本人',
  '配偶',
  '父親',
  '母親',
  '兄弟姐妹',
  '子女',
] as const;
export const BAZI_EVENT_CHAIN_STEPS = [
  '目標對象',
  '原局根',
  '大運場',
  '流年觸發',
  '現實反饋',
] as const;

/**
 * PATCH 06｜年度機制獨立 + 回溯降級：連續兩年發生同類事件，也必須分別解釋
 * 當年的實際作用鏈。知道答案後才倒推年月日，只能標 VAL-C／回溯支持，不得算成
 * 前瞻預測命中或正式 empirical validity。
 */
export const BAZI_VALIDATION_CLASSES = [
  { code: 'VAL-A', name: '前瞻驗證', note: '結論在事件發生前已鎖定，不可事後修改。' },
  { code: 'VAL-B', name: '獨立盲回溯', note: '判斷者不知結果情況下獨立作出，事後核對。' },
  {
    code: 'VAL-C',
    name: '解釋性回溯／回溯支持',
    note: '已知結果後才倒推年月日的事後解釋；可用於案例研究，不得算成前瞻預測命中或正式 empirical validity。',
  },
] as const;
export const BAZI_INTERPRETATION_GUARD_SOURCES = [
  'docs/WFX-WANGSHI-ZHIHUA-v1.0.md',
  'docs/THREE-YUAN-AUXILIARY-RULE.md',
] as const;

/**
 * STONE R6.2.1 GENERALIZED 的子平主線。
 * 這是網站 runtime 的機器可讀契約，不代表每個低階函式單獨完成全部步驟；
 * 上層分析流程必須依此順序組裝，不能跳過前置 Gate 後直接用局部規則下結論。
 */
export const BAZI_DATA_VALIDATION_SUBSTEPS = [
  '出生時間／時區／夏令時',
  '節氣換月／節氣切界',
  '曆法口徑',
  '跨日邏輯',
  '性別／出生地',
  '真太陽時必要性',
] as const;

export const BAZI_ANALYSIS_MAINLINE = [
  '資料校驗',
  '從化真假／特殊格',
  '月令',
  '調候',
  '根氣透藏',
  '格局',
  'PK-6 偏枯病藥 Gate',
  '病藥',
  'ODL（是否有路）',
  'FC（流通結果）',
  '承載',
  '刑沖合害／四庫',
  '大運',
  '流年',
  'LBX 四軸',
  '事件性質',
  '六親定位',
  '流月窗口',
  '可信度／依據',
  '白話輸出',
] as const;

export const BAZI_STRUCTURE_STATES = [
  '候選格',
  '成格',
  '成而有病',
  '破格',
  '假格／變格',
] as const;

export const BAZI_EVIDENCE_LAYERS = [
  'CURRENT 主裁決',
  '格局狀態',
  '扶抑／強弱旁證',
  '病藥／ODL／FC／承載',
  '低權重旁證',
  'UNKNOWN／未決',
] as const;

export const BAZI_HARD_GUARDS = [
  '格局／病藥／流通／承載主鏈高於扶抑強弱；扶抑只能作旁證，不得與主裁決平權投票。',
  '不同方法若推出相反喜忌，不得同時展示為兩套同等最終喜用；必須標方法層級並由 CURRENT 主鏈裁決，無法裁決則保留未決。',
  '格局狀態至少區分候選格／成格／成而有病／破格／假格或變格，且每一狀態必須有可追溯證據。',
  '五行量化分數只能描述分布，不得直接推出身強、喜忌、用神、人格、職業、疾病或吉凶。',
  '神煞、納音、十二長生僅作低權重旁證；稱骨等民俗算法不得進入子平核心裁決。',
  '日柱／納音／生肖等通用人格文案不得充當個人正式結論；必須回到完整結構與本題證據。',
  '不得以五行數量、平均或十神票數作主判；數量不等於力量。',
  '不得使用「缺什麼補什麼」作取用邏輯。',
  '十天干、十二地支沒有先天高低貴賤；本象只描述功能與氣象，任何好壞都必須回到月令、位置、十神、制化、病藥、流通與承載。',
  '「為何而生／使命／宿命／人生方向」只能翻譯為結構功能、反覆課題與現實選擇；不得包裝成上天指令、客觀前世事實或不可驗證的命定目的。',
  '圖像、神獸、自然物象與漫畫只能作為既有分析的下游翻譯層；不得從圖像反推格局、喜用、吉凶或人生結論。',
  '旺不得直接等於喜、用或天賦；必須在月令、根氣、透藏、病藥、流通與承載之後判定其作用。',
  '五行五常只作文化象義與教學旁證；不得以「缺金」「火多」等直接作人格、道德或可否深交的判決。',
  '印旺不得直接等於有福；必須判斷印的喜忌、來源、作用鏈、承載與出口。',
  '城市、地理、髮色、衣著、方位與日柱俗訣只作環境應象或文化旁證，不得覆蓋子平主判或獨立推出吉凶。',
  '胎元、命宮、身宮只作四柱主判完成後的低權重補證；不得併入四柱旺衰、五行票數、格局計分或用神裁決，也不得合成所謂七柱重新主判。',
  '合不等於化；必須檢查月令、透干、根氣、環境與歲運引動。',
  '穿／害只表示關係摩擦、暗損或牽制，不得直接等同「控制」「制取」或成功駕馭某十神。',
  '十神身份不因合、沖、刑、害、穿而變成另一個十神；只能在既有身份上判斷功能是否受制、轉向、失效或被引動。',
  '墓庫不得機械套用「逢沖必開、逢合必閉」；必須回到月令、透干、根氣、庫中藏干與歲運觸發判斷。',
  '有路不等於有效流通；僅見相生或中介通道，仍須檢查力量、位置、根氣、阻隔與承載後才能判定通關成立。',
  '命理取象、職業映射與心理語言不得與單一十神、五行或刑沖關係做一對一硬映射。',
  '偏枯只作結構診斷，不得直接等同命差、貧命、大格或任何價值判決。',
  '氣勢集中只可作主軸候選訊號，不得直接等同人格更果斷、人生方向更清楚、能力更強或成就更高。',
  '雙強相戰只可先標記為結構張力；必須再判旺衰、得令、根氣、通關、制化、受損對象與 FC，不得直接翻譯成爆發力或破局能力。',
  '中和是功能上的生克制化得宜，不等於五行數量平均；五行齊全不等於平庸，五行偏枯也不等於高級。',
  '缺項不等於病、補項不等於藥；古典「木旺喜金／火旺喜水」等象法只能作條件性判斷，不得升格為固定配藥公式。',
  '通關只在兩神真實相戰且第三者能承接生化時成立，不得把「通關之神」當成所有失衡的通用同義詞。',
  '跑步屬木、游泳屬水、重量訓練屬金等生活映射只能作現代象意，不得反向修改格局、用神、相神、喜忌、病藥或歲運。',
  '所有八字／命理專項分組必須繼承同一條主鏈；專項只能放大自己的步驟，不能跳過上游 Gate。旁證體系不適用的步驟標記 N/A。',
  '不得以五行字數、百分比、不透干或單純強弱直接判偏枯；弱而有根、有源、有路時不得判死枯。',
  '極旺／極弱不得直接升格為從旺、從弱、專旺或化氣；特殊格必須先過獨立真假 Gate。',
  '病藥必須功能化：病是阻斷、壅滯、過載、失衡、承載不足或作用鏈失效；藥是能真正修復功能的結構，不等同固定某一五行。',
  '偏枯 Gate 後必須先判 ODL，再判 FC；有路不等於有效流通。',
  '墓庫藏干不得直接視為可用藥神，逢沖也不得自動視為出庫。',
  '五行象義不得直接推出人格、疾病、職業、婚姻或財富；至少須經十神、位置、格局、制化、流通、承載與歲運。',
  '顏色、家具、材質、水景、方位、寵物、植物等只作低權重文化／生活象義，不得作核心補命算法。',
  '通根與十二長生分開判定，不得建立固定倍數或固定位置權重。',
  '病藥是核心分析層，不得被單一格局名稱取代。',
  '資料不足時必須降級信度或標示不作判定，不得用旁證補成確定結論。',
  '子平為主判；紫微斗數與一掌經只能作各自獨立的補充層，不得互相代替。',
  '不得把命理結論寫成醫療、法律、投資或其他高風險專業保證。',
] as const;

export const BAZI_CONFIDENCE_LABELS = [
  '【確定結構】',
  '【較高概率】',
  '【歲運觸發】',
  '【紫微補充】',
  '【一掌經象徵】',
  '【不作判定】',
] as const;
