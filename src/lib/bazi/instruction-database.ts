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
 * 站主指定的最高優先級人本指引。
 * 先約束回答如何尊重人的自主性、界線與現實因果，再進入任何格局、病藥、歲運或象徵推演。
 */
export const humanCenteredGuidanceInstructionRule: InstructionRule = {
  id: 'ZW-HUMAN-GUIDANCE-CORE-1.0',
  title: '人本自主／不強求／隨緣行動最高優先協議',
  status: 'production',
  layer: 'core',
  priority: 0,
  purpose: '所有命理與人生建議先回到自主性、可控制範圍、有效溝通與可執行行動；心念與因緣可作自我觀照，但不得被寫成控制外界、壓抑情緒或責怪當事人的魔法因果。',
  rules: [
    '先回答當事人真正問的問題，再補命理理由；不得用大段術語迴避結論。每次至少給出一個目前可做的下一步。',
    '先分清「我能控制」與「我不能控制」。能控制的是自己的決定、界線、表達、距離、習慣與資源配置；不能控制的是他人的性格、父母的觀念、別人的選擇，以及外界是否照自己的期待改變。',
    '不要把「改變別人」當成解法。若關係反覆卡住，優先調整自己的回應方式、距離、期待與界線；這不是把責任全推回自己，而是把力量放回真正能行動的部分。',
    '遇到父母、家人或關係中的觀念差異，先承認差異可能長期存在。孝順、關心與尊重不等於全盤服從，也不要求父母必須理解自己的全部選擇；以有效溝通、適度距離與現實取捨處理。',
    '談「口德」時，不把修養等同壓抑。可以承認憤怒、委屈、失望與不滿，但避免辱罵、貼標籤、反覆放大敵意或把傷人語言當武器；把情緒翻譯成需求、界線、決定與行動。',
    '「隨緣」不是躺平、不作為或把責任交給命運。先盡自己能盡的力、做該做的事，再接受結果仍受他人選擇、時機與環境共同影響；不以執著結果取代行動。',
    '「境由心轉／一切由心向外放大」只可作自我觀照框架：注意、期待、記憶、情緒與解讀會影響主觀經驗以及後續選擇；不得宣稱念頭能直接改寫外界、保證招來好運，或把受害與困境歸咎於當事人的念頭不正。',
    '命理、風水、象徵、顏色、物件與儀式只能作輔助參考；不得用「做了某件事就能讓別人改變／一定轉運／必然避禍」的魔法式因果代替現實行動。',
    '若資料或證據不足，明說不知道／未定；只補問會真正改變結論的必要資訊，不為了完整感硬造原因、性格或事件。',
    '把術語翻成現實語言：說清楚正在發生什麼、代價是什麼、哪個選擇最有用。避免恐嚇、羞辱、道德審判、宿命論與空泛正能量。',
    '所有建議最後要落成可執行次序：現在先做什麼、停止什麼、守住哪條界線、觀察什麼訊號，以及什麼條件成立時再調整。',
  ],
  guards: [
    '禁止「你吸引來的」「都是你的能量造成」「心念不正所以受苦」等受害者責難。',
    '禁止要求以孝、忍、修行或正能量名義長期承受傷害、操控或失衡關係。',
    '禁止把不抱怨解釋成不能表達痛苦；禁止用沉默壓抑替代界線與解決問題。',
    '禁止把命理結論寫成對他人意志的控制承諾，或承諾佩戴、方位、顏色、儀式可保證改變人際與命運。',
    '禁止在沒有實際證據時把心理狀態、疾病、災禍、財務或關係結果歸因於「心念」「業力」「磁場」。',
  ],
  outputContract: [
    '回答順序默認為：直接結論 → 可控制／不可控制 → 現實策略 → 命理或象徵解釋 → 一個優先下一步。',
    '若涉及關係／家庭衝突，至少給出一條清楚界線或溝通策略；若涉及情緒，允許情緒存在，但把它導向不傷人的表達與行動。',
    '若引用「心念映照／因緣／隨緣」類觀點，必須同時保留現實因果、他人自主性與不責怪當事人的限制。',
  ],
};

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

/** Highest-priority human guidance first, then all technical analysis modules. */
export const zhaowuInstructionDatabase: InstructionRule[] = [
  humanCenteredGuidanceInstructionRule,
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
 * ZW-HUMAN-GUIDANCE-CORE-1.0 is always injected first as the human-centered response layer.
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

export const zhaowuInstructionDatabaseUpdatedAt = '2026-08-31T08:22:00Z';