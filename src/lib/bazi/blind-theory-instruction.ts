import type { InstructionRule } from './instruction-database-base-legacy';
import { THEORY_UNIT_CASE_SOURCE } from './theory-unit-cases';

export const blindTheoryOperationalInstructionRule: InstructionRule = {
  id: 'ZW-BAZI-BLIND-THEORY-OPERATIONAL-0.1',
  title: '盲派補充｜宮位・做功・賓主・應期條件化協議',
  status: 'production',
  layer: 'bazi',
  priority: 8,
  purpose: `把 ${THEORY_UNIT_CASE_SOURCE.title} 中可與 CURRENT 主鏈兼容的操作觀念轉為條件性規則；只補充宮位、虛實、賓主／體用、合沖與應期的判讀，不建立第二套主判。`,
  rules: [
    '宮位先定事情落在哪個領域，十神再描述該領域中的功能；不得只看十神名目直接定事件。',
    '有字不等於有效：十神、藏干或象只有在根氣、力量、位置、制化與 ODL／FC 支持下，才可進入正式做功鏈。',
    '賓主／體用只用於判斷外部資源如何與命主建立關係；外物需能進入主體作用範圍且命主可承載，才可視為真正可用。',
    '合必須區分引入、絆住、閉塞等不同功能結果；合不等於吉、得或化。沖庫也不得預設為開庫，須判庫中所藏、歸主與沖後功能。',
    '重大事件遵守原局定結構 → 大運給場 → 流年觸發 → 流月縮窗；缺少上層事件基礎時，單一流年作用只可降級處理。',
    '做功只表示產生了可追溯的有效作用；十神名稱本身沒有固定吉凶，仍須回到格局、病藥、流通、承載與歲運。',
  ],
  guards: [
    '禁止把盲派口訣或單一象法提升為 CURRENT 主判，或用它推翻月令、格局、病藥、ODL、FC、承載與歲運主鏈。',
    '禁止見財即富、見官即貴、見合即得、見沖庫即發、見驛動即搬家、見刑沖即疾病。',
    '禁止把本材料標成古籍原文或已驗證規則；來源固定標記 OWNER_MATERIAL，等待 EVP／反例驗證。',
  ],
  outputContract: [
    '若啟用本層，內部順序固定為：宮位／場域 → 十神功能 → 根路與做功 → 合沖等作用結果 → 歲運應期 → 可信度。',
    '證據不足時輸出合理推論、歲運觸發或不作判定；不得為了成象完整硬補事件。',
  ],
};
