import type { InstructionRule } from './instruction-database-base-legacy';
import {
  BAZI_DATA_EVIDENCE_BOUNDARY_EXAMPLES,
  BAZI_EVENT_CHAIN_ROLES,
  BAZI_EVENT_CHAIN_STEPS,
  BAZI_GF13_NAMED_STRUCTURE_EXAMPLES,
  BAZI_GF13_VERIFICATION_AXES,
  BAZI_GOVERNANCE_MASTER_SOURCE,
  BAZI_ODL_FC_CAPACITY_STAGES,
  BAZI_SIX_MINIMUM_PATCHES_SOURCE,
  BAZI_TIME_LAYERS_FOR_EVIDENCE_GAP,
  BAZI_TIME_LAYER_EVIDENCE_STATES,
  BAZI_TIME_LAYER_FIXED_STATEMENT,
  BAZI_VALIDATION_CLASSES,
} from './runtime-contract';

/**
 * STONE R6.2.2 六項最小補丁 — 2026-09-27 最後一次收口，源自站主 128 頁 PDF 壓力測試。
 * 這是 L2／L3／L4 治理加固層，不新增子平判法，不改寫 L1 CORE ZI-PING 或既有
 * L2 STRUCTURAL PATCH（P2／P3）的計算真值；只收緊具名結構、時間層、事件鏈與
 * 回溯解釋的呈現邊界。完整條文見 docs/STONE-R6.2.2-SIX-PATCHES.md。
 */
export const sixMinimumPatchesInstructionRule: InstructionRule = {
  id: 'ZW-R6.2.2-SIX-PATCHES-1.0',
  title: 'R6.2.2 六項最小補丁：GF-13擴展／ODL-FC-CAPACITY／時間層Gap／資料邊界／事件鏈分離／年度回溯降級',
  status: 'production',
  layer: 'core',
  priority: 0,
  purpose:
    `把 ${BAZI_GOVERNANCE_MASTER_SOURCE} 與 ${BAZI_SIX_MINIMUM_PATCHES_SOURCE} 的六項最小補丁綁定到 runtime：任何具名結構、時間層、事件鏈或回溯解釋斷語，輸出前都必須先通過對應補丁檢查。`,
  rules: [
    `PATCH 01／GF-13 擴展：GF-13 不只檢查「格局真假」，而是檢查所有命名結構真假，包括但不限於${BAZI_GF13_NAMED_STRUCTURE_EXAMPLES.join('、')}等。硬規則：「有其名 ≠ 有其實」；任何具名結構斷語輸出前必須回 ${BAZI_GF13_VERIFICATION_AXES.join('、')} 七項逐一核對，缺一項即標「反證未清」並降級信度。`,
    `PATCH 02／ODL→FC→CAPACITY 三段：存在關係 ≠ 作用有效 ≠ 結果落地。Stage 1／ODL＝${BAZI_ODL_FC_CAPACITY_STAGES[0].question}；Stage 2／FC＝${BAZI_ODL_FC_CAPACITY_STAGES[1].question}；Stage 3／CAPACITY＝${BAZI_ODL_FC_CAPACITY_STAGES[2].question}。禁止把前一階段直接等於後一階段。`,
    `PATCH 03／時間層 Evidence Gap：重大事件在${BAZI_TIME_LAYERS_FOR_EVIDENCE_GAP.join('、')}分別記錄 ${BAZI_TIME_LAYER_EVIDENCE_STATES.join('／')}；流月只負責縮窗。禁止「流年 > 大運 > 原局」或「流年力量永遠最大」；固定表達為：${BAZI_TIME_LAYER_FIXED_STATEMENT}`,
    `PATCH 04／Data Evidence Boundary：命理輸出細度不得超過已知資料細度。例如${BAZI_DATA_EVIDENCE_BOUNDARY_EXAMPLES.map((e) => `只知道「${e.known}」不得${e.forbidden}`).join('；')}。UNKNOWN 就明確寫 UNKNOWN，不得用旁證或敘事把細度反向拉高。`,
    `PATCH 05／Event Chain Separation：${BAZI_EVENT_CHAIN_ROLES.join('、')}必須分別建立獨立 Evidence Chain；同一年發生多件事情 ≠ 同一個命理機制。每條鏈固定四步：${BAZI_EVENT_CHAIN_STEPS.join(' → ')}。`,
    `PATCH 06／年度機制獨立 + 回溯降級：連續兩年發生同類事件，也必須分別解釋當年的實際作用鏈，不得用去年的機制直接套用到今年。知道答案後才倒推年月日，只能標 ${BAZI_VALIDATION_CLASSES[2].code}／回溯支持，不得算成 ${BAZI_VALIDATION_CLASSES[0].code} 前瞻預測命中或正式 empirical validity。`,
  ],
  guards: [
    '禁止只做正面舉證、省略 GF-13 反證軸就輸出「確定結構」或直接宣稱某具名結構「已成立」。',
    '禁止把「有根／透／路（ODL）」直接寫成「作用有效（FC）」，或把「作用有效」直接寫成「結果已落地承載（CAPACITY）」。',
    '禁止用「流年最大」「流年一定蓋過原局」等固定階層語句取代原局／大運／流年逐層 PRESENT／ABSENT／UNKNOWN 標記。',
    '禁止在已知資料只到「住院」「事故」「官非」或日期未知的顆粒度時，自行補出病名、事故方式、罪名／判決或精確年月日。',
    '禁止把本人、配偶、父親、母親、兄弟姐妹、子女的事件鏈混用，或以一人結論代入另一人；禁止把同一年的多件事寫成同一個命理機制。',
    '禁止把連續兩年的同類事件用同一條作用鏈解釋帶過，必須分別重新走一次目標對象→原局根→大運場→流年觸發→現實反饋。',
    `禁止把 ${BAZI_VALIDATION_CLASSES[2].code} 回溯支持包裝成 ${BAZI_VALIDATION_CLASSES[0].code} 前瞻驗證或 ${BAZI_VALIDATION_CLASSES[1].code} 獨立盲回溯，或用事後解釋反過來提高原結構的信度標籤。`,
  ],
  outputContract: [
    '涉及具名結構或事件斷語時，內部（可收合）判斷備註至少記錄：GF-13 七軸結果、ODL/FC/CAPACITY 三階段結論、原局／大運／流年三層證據狀態、資料顆粒度是否已降級、涉及的獨立事件鏈主體與四步鏈紀錄、以及若為回溯解釋則標明 VAL-C。',
    '客戶主答案層不展示上述治理標記本身，只在其導致降級、保留未決或需要額外資料時反映到「限制」與「驗證點」文字。',
  ],
};
