import {
  zhaowuInstructionDatabase as legacyInstructionDatabase,
  type InstructionRule,
} from './instruction-database-base-legacy';
import { HUAGAI_KNOWLEDGE } from '../knowledge/huagai';
import {
  BAZI_ANALYSIS_MAINLINE,
  BAZI_CURRENT_MASTER_SOURCE,
  BAZI_HARD_GUARDS,
  BAZI_RUNTIME_CONTRACT_VERSION,
} from './runtime-contract';
import {
  lifestyleFiveElementSymbolismInstructionRule,
  wealthEnvironmentSymbolismInstructionRule,
} from './folk-environment-symbolism';

export type { InstructionRule } from './instruction-database-base-legacy';

/**
 * 現行唯一母本 runtime gate。
 * 舊 R6.1 規則保留為被繼承的細則，但不得越過此 Gate 或改寫主線順序。
 */
export const currentMasterRuntimeInstructionRule: InstructionRule = {
  id: 'ZW-CURRENT-MASTER-R6.2.1',
  title: 'STONE R6.2.1 GENERALIZED／現行唯一子平母本',
  status: 'production',
  layer: 'core',
  priority: 0,
  purpose: `把 ${BAZI_CURRENT_MASTER_SOURCE} 綁定到網站 runtime：任何子平分析都先遵守 ${BAZI_RUNTIME_CONTRACT_VERSION} 的 23 步主線與硬性禁區，再調用既有細則。`,
  rules: [
    `完整子平主線固定依序為：${BAZI_ANALYSIS_MAINLINE.map((step, index) => `${index + 1}.${step}`).join(' → ')}。`,
    '從化判定必須先於一般格局取用；真從、假從、化格、專旺未成立時回到正常子平格局，不得見五行偏多就斷從。',
    '月令為綱，先看司令、主中餘氣、透干、根氣與格局來源，再論後續體用、病藥與流通。',
    '調候看寒暖燥濕；調候用神不等於唯一用神，必須與承載、格局病藥、流通制化共同判定。',
    '病藥是最高核心之一：先指出主病、病源，再判藥神是否有根、有透、有路，是否被合沖鎖住，以及藥太過是否形成新病。',
    '合、沖、刑、害、破、庫一律放回月令、透干、根氣、用神／病源與歲運觸發判斷；合不等於化，沖也不預設為凶。',
    '原局定結構，大運定階段轉移，流年定事件觸發；不得只列吉凶，必須說清楚觸發哪一條原局結構。',
    '所有重要結論都要翻成現實語言並給驗證錨點；資料不足時標示不作判定，不用神煞、旁證或五行數量補成確定答案。',
    '子平負責主判；紫微斗數與一掌經僅在各自獨立欄位補充現象／象徵，不得拿來替代月令、格局、病藥、調候或承載判定。',
    '古籍原意、近現代整理與網站的現代應用推論必須分層，不得把現代職業、心理或商業策略冒充古書原文。',
    ...BAZI_HARD_GUARDS,
  ],
  guards: [
    '禁止五行數量餅圖、十神票數、元素平均或「最多的是什麼」成為命局主判。',
    '禁止「缺什麼補什麼」、生肖性格、單一日柱、單一神煞決定整盤。',
    '禁止見合即化、見沖即凶、見庫即財、見七殺即災。',
    '禁止資料不足仍輸出確定時辰、紫微宮位、一掌經時宮或高精度歲運事件。',
    '禁止宿命論、恐嚇式斷語與醫療／法律／投資保證。',
  ],
  outputContract: [
    '重要結論按需要使用【確定結構】【較高概率】【歲運觸發】【紫微補充】【一掌經象徵】【不作判定】。',
    '完整報告每一層都要同時包含：命理依據、白話表現、有利與失衡兩面、實際行動建議。',
    '普通問答仍遵守直接回答協議，但直接答案也不得跳過會改變結論的前置 Gate。',
  ],
};

/**
 * 直接回答契約：任何命理模組運行前，先鎖定使用者真正問的問題，
 * 防止「問 A 答 B」、整盤傾倒、旁證越權和用術語製造專業感。
 */
export const directAnswerRoutingInstructionRule: InstructionRule = {
  id: 'ZW-DIRECT-ANSWER-ROUTING-R6.1',
  title: 'R6.1 問題定位／直接回答最高優先協議',
  status: 'production',
  layer: 'core',
  priority: 0,
  purpose: '先識別使用者究竟在問什麼，再只調用會改變該問題答案的命理結構；第一屏必須給到問題本身的明確答案，禁止東扯西扯。',
  rules: [
    '先把使用者問題壓縮成一個明確的 question_target：對象是誰、問的是格局／原因／選擇／時間／關係／事業／財務／健康邊界／行動中的哪一種、需要回答到什麼粒度。',
    '輸出第一段必須直接回答 question_target。默認 1–3 句，不得以出生資料複述、命盤總鑑、術語定義、免責聲明或旁證開場。',
    '若問題是選擇題，第一句先給 A／B／暫緩；若是時間題，先給時間窗口或明確說當前證據無法精確到該級；若是格局題，先給主格、成立程度與結構容量；若是原因題，先給最主要 1–3 個原因；若是行動題，先給最優先動作。',
    '只展開與 question_target 有直接因果關係的 2–5 條核心依據。其他正確但不會改變答案的命盤知識一律不主動展開。',
    '禁止把每個問題都回答成完整命盤總鑑。使用者沒問性格、健康、婚姻、父母、前世、神煞、D60、紫微等內容時，不得自動擴寫到這些領域。',
    '旁證模組只在它能改變置信度、時間定位或現實場景時才調用；否則省略。不得為了顯得「全面」而堆疊紫微、神煞、納音、D60、一掌經等。',
    '回答必須明確區分：直接結論、核心依據、限制／反證、下一步。不得在同一段反覆改口，或先給一個結論後用大量無關內容把它沖淡。',
    '若使用者的問題已經包含明確候選，例如「線上還是線下」「今年還是明年」「是不是某格」，不得擅自換成另一個問題回答。',
    '若資料不足以回答 question_target，只說明真正缺少且會改變結論的資料；不得用現有無關資訊湊一個貌似完整的答案。',
    '專業感來自結構與證據，不來自術語密度。任何專業術語出現後都要立刻翻成該問題的現實含義。',
    '每次最後只給 1–3 個真正可執行的動作，且動作必須與直接結論一致。',
  ],
  guards: [
    '禁止問 A 答 B、先講半頁背景再回答、把資料庫內容當答案傾倒。',
    '禁止未經使用者提問自動擴展到敏感或高風險領域。',
    '禁止把「可能」「也許」「某方面」堆疊成模糊答案；證據足夠時必須明確偏向，證據不足時明確 UNKNOWN。',
    '禁止用多個互相衝突的流派結論並排後讓使用者自行猜哪個才是答案。',
    '禁止在同一答案重複出生資料、四柱、十神表、格局名稱來填充篇幅。',
  ],
  outputContract: [
    '第一屏順序固定：直接答案 → 可信度標籤 → 2–5 條核心依據。',
    '第二層才允許：限制／反證 → 時間或條件 → 現實下一步。',
    '除非使用者明確要求完整研究報告，否則不輸出與 question_target 無關的模組。',
  ],
};

/**
 * 華蓋只作神煞旁證，不可越權主判。
 * 來源：站主 2026-09-09 提供的《華蓋壓命，天才不入群》材料，
 * 已整理到 HUAGAI_KNOWLEDGE；古籍引文在未獨立核驗前維持 OWNER_MATERIAL 層級。
 */
export const huagaiAuxiliaryInstructionRule: InstructionRule = {
  id: 'ZW-BAZI-HUAGAI-AUX-1.0',
  title: '華蓋神煞／墓庫歸藏輔助取象協議',
  status: 'production',
  layer: 'bazi',
  priority: 18,
  purpose: `把 ${HUAGAI_KNOWLEDGE.id} 的查法、墓庫歸藏、十神搭配、高低用與現實落地納入昭梧命理旁證，同時鎖定神煞不得越權主判。`,
  rules: [
    '傳統主查法以年支起：寅午戌見戌、亥卯未見未、申子辰見辰、巳酉丑見丑。若採用日支起查，必須標示為後世實務旁證，不得與年支法混成唯一標準。',
    '華蓋只屬神煞旁證。任何人格、智力、社交、宗教、職業、婚姻、財富或人生層級結論，都必須先由完整命局、十神、格局、病藥與歲運成立。',
    '華蓋底層取象先連到辰戌丑未墓庫與三合歸藏：水墓辰、火墓戌、金墓丑、木墓未；核心是收、藏、沉澱、內觀、研究與創作，不是單純的孤獨。',
    '華蓋得用可條件化映射為專注、研究、技術、藝術、冷門學問與深度輸出；失衡可映射為封閉、自我循環、精神潔癖、優越感或拒絕反饋，但兩面都必須有主盤交叉證據。',
    '華蓋配印：優先觀察學問、典籍、思想、考據與研究；若印重而缺食傷疏泄，提醒想多做少與知識封閉。',
    '華蓋配食傷：優先觀察創作、寫作、設計、手藝、技術、表達與完成能力；有感受而無完成品時不得把靈感本身升格為才華成果。',
    '華蓋配官殺：優先觀察規則、責任、紀律、承壓、專業標準與壁壘；官殺過重又無印化或食泄時，提醒過度硬扛與自我壓迫。',
    '華蓋配財：優先觀察資源交換、市場通路與把小眾深度轉為產品、服務或收入的能力；沒有承載與通路時，不得說冷門專業自然會變現。',
    '「華蓋逢空，偏宜僧道」不可機械解成必然出家或通靈。只可條件化取象為世俗黏著降低，注意力較易轉向宗教、哲學、藝術、玄學、生死、宇宙秩序、古籍或技術研究。',
    '華蓋的高低用以「是否落地成器」為核心檢驗：把閱讀變文章、理法變系統、審美變作品、經驗變方法、專業深度變成能解決問題的成果。',
    '現實建議固定保留：獨處但不切斷關係；安排社交恢復期；以飲食、睡眠、運動、工作、期限、合作與責任作現實錨點；不以「沒人懂我」替代作品與現實驗證。',
    '若只有華蓋存在，而沒有十神、宮位、格局、病藥、四庫動態或歲運交叉支持，固定標示「低權重旁證」，不得為了內容完整硬造性格故事。',
  ],
  guards: [
    '禁止華蓋＝天才、I 人、孤僻、清高、通靈、必出家、必無人緣、必信教、必適合玄學。',
    '禁止把夢境、巧合、情緒波動直接升格為預兆、神諭或超自然證據。',
    '禁止用華蓋推翻月令、格局、十神、病藥、四庫動態、用神或歲運主判。',
    '禁止把文章中的現代心理描述當作臨床診斷；若現實功能受損，命理不得替代心理或醫療專業。',
  ],
  outputContract: [
    '華蓋輸出固定順序：查法與成立位置 → 墓庫歸藏取象 → 十神／格局交叉 → 高用／失衡兩面 → 現實驗證點 → 可執行落地建議 → 輔助層限制。',
    '若年支法與日支法得出不同結果，分欄標示，不合併成單一確定結論。',
  ],
};

export const zhaowuInstructionDatabase: InstructionRule[] = [
  currentMasterRuntimeInstructionRule,
  directAnswerRoutingInstructionRule,
  ...legacyInstructionDatabase,
  huagaiAuxiliaryInstructionRule,
  wealthEnvironmentSymbolismInstructionRule,
  lifestyleFiveElementSymbolismInstructionRule,
];

export function getInstructionRule(id: string): InstructionRule | undefined {
  return zhaowuInstructionDatabase.find((rule) => rule.id === id);
}

export const zhaowuInstructionDatabaseUpdatedAt = '2026-09-15T00:35:00+10:00';
