import {
  zhaowuInstructionDatabase as legacyInstructionDatabase,
  type InstructionRule,
} from './instruction-database-base-legacy';
import { HUAGAI_KNOWLEDGE } from '../knowledge/huagai';
import {
  lifestyleFiveElementSymbolismInstructionRule,
  wealthEnvironmentSymbolismInstructionRule,
} from './folk-environment-symbolism';

export type { InstructionRule } from './instruction-database-base-legacy';

/**
 * R6.1 直接回答契约：任何命理模块运行前，先锁定用户真正问的问题，
 * 防止“问 A 答 B”、整盘倾倒、旁证越权和用术语制造专业感。
 */
export const directAnswerRoutingInstructionRule: InstructionRule = {
  id: 'ZW-DIRECT-ANSWER-ROUTING-R6.1',
  title: 'R6.1 问题定位／直接回答最高优先协议',
  status: 'production',
  layer: 'core',
  priority: 0,
  purpose: '先识别用户究竟在问什么，再只调用会改变该问题答案的命理结构；第一屏必须给到问题本身的明确答案，禁止东扯西扯。',
  rules: [
    '先把用户问题压缩成一个明确的 question_target：对象是谁、问的是格局／原因／选择／时间／关系／事业／财务／健康边界／行动中的哪一种、需要回答到什么粒度。',
    '输出第一段必须直接回答 question_target。默认 1–3 句，不得以出生资料复述、命盘总鉴、术语定义、免责声明或旁证开场。',
    '若问题是选择题，第一句先给 A／B／暂缓；若是时间题，先给时间窗口或明确说当前证据无法精确到该级；若是格局题，先给主格、成立程度与结构容量；若是原因题，先给最主要 1–3 个原因；若是行动题，先给最优先动作。',
    '只展开与 question_target 有直接因果关系的 2–5 条核心依据。其他正确但不会改变答案的命盘知识一律不主动展开。',
    '禁止把每个问题都回答成完整命盘总鉴。用户没问性格、健康、婚姻、父母、前世、神煞、D60、紫微等内容时，不得自动扩写到这些领域。',
    '旁证模块只在它能改变置信度、时间定位或现实场景时才调用；否则省略。不得为了显得“全面”而堆叠紫微、神煞、纳音、D60、一掌经等。',
    '回答必须明确区分：直接结论、核心依据、限制／反证、下一步。不得在同一段反复改口，或先给一个结论后用大量无关内容把它冲淡。',
    '若用户的问题已经包含明确候选，例如“线上还是线下”“今年还是明年”“是不是某格”，不得擅自换成另一个问题回答。',
    '若资料不足以回答 question_target，只说明真正缺少且会改变结論的資料；不得用現有無關信息湊一個貌似完整的答案。',
    '專業感來自結構與證據，不來自術語密度。任何專業術語出現後都要立刻翻成該問題的現實含義。',
    '每次最後只給 1–3 個真正可執行的動作，且動作必須與直接結論一致。',
  ],
  guards: [
    '禁止問 A 答 B、先講半頁背景再回答、把數據庫內容當答案傾倒。',
    '禁止未經用戶提問自動擴展到敏感或高風險領域。',
    '禁止把“可能”“也許”“某方面”堆疊成模糊答案；證據足夠時必須明確偏向，證據不足時明確 UNKNOWN。',
    '禁止用多個互相衝突的流派結論並排後讓用戶自行猜哪個才是答案。',
    '禁止在同一答案重複出生資料、四柱、十神表、格局名稱來填充篇幅。',
  ],
  outputContract: [
    '第一屏順序固定：直接答案 → 可信度標籤 → 2–5 條核心依據。',
    '第二層才允許：限制／反證 → 時間或條件 → 現實下一步。',
    '除非用戶明確要求完整研究報告，否則不輸出與 question_target 無關的模塊。',
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
    '“華蓋逢空，偏宜僧道”不可機械解成必然出家或通靈。只可條件化取象為世俗黏著降低，注意力較易轉向宗教、哲學、藝術、玄學、生死、宇宙秩序、古籍或技術研究。',
    '華蓋的高低用以“是否落地成器”為核心檢驗：把閱讀變文章、理法變系統、審美變作品、經驗變方法、專業深度變成能解決問題的成果。',
    '現實建議固定保留：獨處但不切斷關係；安排社交恢復期；以飲食、睡眠、運動、工作、期限、合作與責任作現實錨點；不以“沒人懂我”替代作品與現實驗證。',
    '若只有華蓋存在，而沒有十神、宮位、格局、病藥、四庫動態或歲運交叉支持，固定標示“低權重旁證”，不得為了內容完整硬造性格故事。',
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
  directAnswerRoutingInstructionRule,
  ...legacyInstructionDatabase,
  huagaiAuxiliaryInstructionRule,
  wealthEnvironmentSymbolismInstructionRule,
  lifestyleFiveElementSymbolismInstructionRule,
];

export function getInstructionRule(id: string): InstructionRule | undefined {
  return zhaowuInstructionDatabase.find((rule) => rule.id === id);
}

export const zhaowuInstructionDatabaseUpdatedAt = '2026-09-13T21:16:00+10:00';