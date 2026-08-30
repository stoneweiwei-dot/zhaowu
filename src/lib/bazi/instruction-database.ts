import {
  zhaowuInstructionDatabase as baseInstructionDatabase,
  type InstructionRule as BaseInstructionRule,
} from './instruction-database-base';

export type InstructionTrigger = {
  /** Any matching natal or active branch enables this instruction. */
  branchAny?: readonly string[];
};

export type InstructionRule = BaseInstructionRule & {
  trigger?: InstructionTrigger;
};

export const FOUR_TOMB_BRANCHES = ['辰', '戌', '丑', '未'] as const;
export type FourTombBranch = (typeof FOUR_TOMB_BRANCHES)[number];

/**
 * 病藥不是「缺什麼補什麼」，也不是把偏枯本身浪漫化成富貴。
 * 這一層把命局結構、十神習氣、現實代價、自主對治與歲運觸發串成同一條判斷鏈。
 */
export const pathologyRemedyInstructionRule: InstructionRule = {
  id: 'ZW-BAZI-PATHOLOGY-REMEDY-1.0',
  title: '八字病藥／習氣對治協議',
  status: 'production',
  layer: 'bazi',
  priority: 7,
  purpose: '把「病藥」從單純喜忌或歲運等待，提升為命局結構 → 習氣 → 現實代價 → 對治功能 → 自主行動 → 歲運助力的完整分析鏈。',
  rules: [
    '先辨病，再取藥。病不是某五行缺失、數量太少或形式上的不平均，而是由月令、根氣、透藏、流通、制化、承載、寒暖燥濕與十神作用共同形成的核心結構性矛盾。',
    '不得把「偏枯、失衡、衝突很大」本身直接判成富貴、爆發力或高階格局；失衡只代表張力與風險，是否成用必須看是否存在可行的制、化、泄、通關、調候與承載路徑。',
    '病要落到功能層：指出哪一股力量過度、受阻、失去出口、承載不足、互相絞殺或寒暖燥濕失調，以及它如何影響全局做功。',
    '十神配合五行可用來描述習氣與行為慣性，但十神不是人格標籤。必須把命理結構翻譯成可驗證的現實模式，例如控制、競爭、拖延、過度承擔、衝動輸出、資源分散、界線不足或封閉內耗。',
    '固定分析順序為：命局之病 → 習氣表現 → 現實代價 → 對治之藥 → 自主可做 → 歲運何時助力。不得跳過中間鏈條直接從某個十神或五行跳到事件結論。',
    '藥是功能，不是元素貼紙。可用的藥包括制、化、泄、通關、調候、培根、建立承載、疏導出口、重新分配資源與邊界；最後才映射到合適的工作方式、關係策略、作息、環境與決策。',
    '不能只靠歲運。大運、流年、流月只負責觸發、放大、提供條件或改變可用資源；若原局之病可以透過行為、制度、技能、合作方式或生活結構改善，必須同時給出本人可主動執行的對治。',
    '歲運之藥必須與原局病根建立可解釋的干支／五行／十神作用鏈，不能因某一年出現喜用五行就直接說「病被治好」或「必發」。',
    '若病重而藥弱、藥受制、藥無根或承載不足，應表述為「可用但成本高／需條件／暫不足以完全轉化」；若病藥關係尚未成立，保持 UNKNOWN，不硬取用神。',
    '經典出處校正：本協議引用的「有病方為貴，無傷不是奇；格中如去病，財祿兩相隨」按當前資料標記為《五言獨步》（收於《淵海子平》），後由《神峰通考·病藥說》引用並發揮；不得誤標為《滴天髓》。',
  ],
  guards: [
    '禁止「失衡越大越富貴」「百億格局」「有病必貴」「藥到必發」等單因果或財富神話式斷語。',
    '禁止五行缺什麼補什麼、數量少就補、顏色／方位直接當用神。',
    '禁止把十神當固定性格標籤或道德評價。',
    '禁止把焦慮、疾病、困境浪漫化成「修行機緣」而忽略現實處理；健康議題仍守醫療邊界。',
    '禁止只等大運流年、不提供任何可執行的自主對治。',
    '禁止引用經典時張冠李戴；來源不確定時必須標示來源層級或待核。',
  ],
  outputContract: [
    '至少輸出：核心病點、結構證據、習氣／行為表現、現實代價、對治功能、本人可執行行動、歲運助力條件、限制與驗證點。',
    '若沒有足夠結構證據，只能寫「病藥未定」，不得為了完整而硬造病或藥。',
  ],
};

export const fourTombsInstructionRule: InstructionRule = {
  id: 'ZW-FOUR-TOMBS-MUKU-1.0',
  title: '辰戌丑未四庫／墓庫動態分析協議',
  status: 'production',
  layer: 'bazi',
  priority: 8,
  purpose: '凡四柱或歲運出現辰、戌、丑、未，強制切換到四庫專門分析：分離本氣、庫氣與中餘氣，處理合沖刑會的收束與鬆動，並防止把庫氣名稱誤當力量排序或把本氣十神混成庫氣十神。',
  trigger: { branchAny: FOUR_TOMB_BRANCHES },
  rules: [
    '觸發條件：年、月、日、時任一地支為辰戌丑未即啟用原局四庫分析；若原局無四庫而大運或流年出現四庫，只在歲運觸發層啟用，不反向改寫原局常態。',
    '四庫身份按十二長生墓位處理：辰為水庫、戌為火庫、丑為金庫、未為木庫。這是墓庫身份與可被引動的五行對象，不等於藏干力量排序，也不預設吉凶。',
    '必須分開列出本氣、中氣／餘氣、庫氣及其對日主的十神。不得把本氣十神與庫氣十神混用。例：壬日主見辰，辰庫氣癸水為劫財，辰本氣戊土才是七殺；不能把「辰本氣七殺」寫成「七殺庫」。',
    '「旺者為庫，衰者為墓」的旺衰主詞，是被墓／被庫的那個五行在全局或該步歲運中的旺衰，不是日主身強身弱。日主強而某十神之氣弱入墓，仍可按墓論。',
    '庫氣不等於最強藏干。藏干分日歷代版本有差異，不能因「庫氣」名稱就判它強於中氣或餘氣；力量仍回到月令、透干、根氣、貼近、制化與歲運引動。',
    '辰戌沖、丑未沖不得只斷「化土」，也不得只斷「開庫」。同時評估土支互相耗動、庫門鬆動、藏氣釋放、損根與重新入局，明確指出被動的是哪個藏干、十神、用神或病源。',
    '開庫機制與開庫結果必須分開：沖、刑、拱／會、干透、歲運引動屬於「如何動庫」；喜忌、病藥、承載與流通屬於「動後結果」。不得把「喜忌定吉凶」列成第五種開庫手段。',
    '四庫在三合、三會、六合上的方向並不對稱：辰可被引向水、木、金；戌三合與六合多指向火而三會可向金；丑可被引向金、水、土；未可被引向木、火，而午未六合的化氣方向有傳統分歧，優先論牽制與收束，不強斷化氣。',
    '「六合閉庫」不可一刀切。辰酉、卯戌可形成較明確的身份收束；子丑多先論合住與收束，化氣仍須條件；午未先論協調、牽制、收束，除非月令、透干、根氣與全局條件足以支持，否則不強判合化。',
    '同一庫同時受合鎖與自刑、沖、刑、三合或三會時，不得寫「鎖死」。例如雙辰自刑又見辰酉合，要比較收束／牽制與耗損／鬆動兩股力量；優先級回到月令、透干、貼近日主或關鍵宮位、是否觸及病藥，以及歲運是否引動。',
    '辰戌丑未之所以兼具土與墓庫功能，先按四季交接的承載、收束背景理解；具體辰收水、未收木、戌收火、丑收金，再回到十二長生墓位。不得把「四庫」理解成四個完全相同的普通土支。',
    '位置只決定歸屬與場景，不直接決定吉凶：年、月、日、時所在宮位要和藏干十神、合沖刑會、病藥與歲運一起看。',
    '任何歲運斷語都必須展示實際干支鏈條。原局、大運、流年沒有形成對應關係時，不得憑空寫「丑未大沖」「辰戌開庫」等懸空事件句。',
    '墓庫相關現實映射只可翻譯為資源內收、流通受阻、蓄積待用、被引動後釋放或震盪等結構語言，再由具體十神與宮位落到事業、財務、關係或生活；禁止直接套死亡、離婚、失職、墜胎、抑鬱早逝、被騙等固定事件。',
  ],
  guards: [
    '禁止「庫氣比餘氣強」或「得庫氣必吉」。',
    '禁止「開庫必發財」「沖庫必凶」「沖庫必開」等單因果斷語。',
    '禁止把六合直接等同合化，或把所有四庫六合一律寫成同一種「閉庫」。',
    '禁止把辰戌沖／丑未沖簡化成單純化土，亦禁止忽略土支耗動與藏氣重新入局。',
    '禁止混用本氣十神與庫氣十神。',
    '禁止因四庫名稱直接推出婚變、官非、死亡、疾病、破產等恐嚇性結論。',
    '禁止忽略雙辰自刑、丑未戌刑局或其他同時存在的合沖刑會，只保留單一「鎖庫」敘事。',
    '禁止沒有原局／大運／流年干支證據就製造歲運事件。',
  ],
  outputContract: [
    '觸發後至少輸出：四庫位置 → 本氣／中餘氣／庫氣及十神 → 庫／墓判定 → 合沖刑會動態 → 病藥與流通影響 → 歲運觸發條件 → 現實映射與驗證點。',
    '若四庫只是存在但未被透干、合沖刑會或歲運有效引動，明確標示「庫在而未動」，不得為了內容完整而硬斷事件。',
  ],
};

/** Preserve all legacy production instructions and append the pathology/remedy + four-tombs modules. */
export const zhaowuInstructionDatabase: InstructionRule[] = [
  ...baseInstructionDatabase,
  pathologyRemedyInstructionRule,
  fourTombsInstructionRule,
];

export type InstructionContext = {
  natalBranches?: readonly string[];
  /** Dayun / annual / monthly branches currently being evaluated. */
  activeBranches?: readonly string[];
};

export function getFourTombsTriggerContext(
  context: InstructionContext = {},
): 'natal' | 'transit' | null {
  const natal = context.natalBranches ?? [];
  if (natal.some((branch) => FOUR_TOMB_BRANCHES.includes(branch as FourTombBranch))) return 'natal';
  const active = context.activeBranches ?? [];
  if (active.some((branch) => FOUR_TOMB_BRANCHES.includes(branch as FourTombBranch))) return 'transit';
  return null;
}

function triggerMatches(rule: InstructionRule, context: InstructionContext): boolean {
  const branchAny = rule.trigger?.branchAny;
  if (!branchAny?.length) return true;
  const branches = [...(context.natalBranches ?? []), ...(context.activeBranches ?? [])];
  return branches.some((branch) => branchAny.includes(branch));
}

/**
 * Canonical instruction router for BaZi analysis.
 * ZW-BAZI-PATHOLOGY-REMEDY-1.0 is always injected as the generic pathology/remedy layer.
 * Any 辰／戌／丑／未 in natal branches or active luck/year branches additionally injects
 * ZW-FOUR-TOMBS-MUKU-1.0 before the generic event-inference protocol.
 */
export function getApplicableInstructionRules(
  context: InstructionContext = {},
): InstructionRule[] {
  return zhaowuInstructionDatabase
    .filter((rule) => triggerMatches(rule, context))
    .sort((a, b) => a.priority - b.priority);
}

export function getInstructionRule(id: string): InstructionRule | undefined {
  return zhaowuInstructionDatabase.find((rule) => rule.id === id);
}

export const zhaowuInstructionDatabaseUpdatedAt = '2026-08-30T12:45:00Z';
