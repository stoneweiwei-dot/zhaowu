# 昭梧更新報告｜ZW-WEB-2026.09.19-r150

## 本次改動

- 將網站八字／命理 runtime 的頂層主鏈統一為：資料校驗 → 從化真假／特殊格 → 月令 → 調候 → 根氣透藏 → 格局 → PK-6 偏枯病藥 Gate → 病藥 → ODL → FC → 承載 → 刑沖合害／四庫 → 大運 → 流年 → LBX 四軸 → 事件性質 → 六親定位 → 流月窗口 → 可信度／依據 → 白話輸出。
- 保留出生時間／時區／夏令時、節氣、曆法、跨日、出生地與真太陽時為「資料校驗」內部 deterministic 子檢查，避免另形成一套平行主線。
- 新增 `ZW-BAZI-GROUP-MAINLINE-EC7`，使所有八字／命理專項分組繼承同一條主鏈；專項只能放大自身步驟，不能跳過上游 Gate。
- 將 EC-7 正式接入 P3：氣勢集中不等於人格／方向／成就；雙強相戰不等於天然優勢；中和不等於五行平均；缺項不等於病、補項不等於藥；通關不得濫用；生活五行只作低權重象意。
- 將內部模組狀態固定為「已完成／壓縮沿用／N/A／受阻／降級」，並保持旁證體系不得反向改寫子平主判。
- 增加 runtime regression，防止後續版本把主鏈、EC-7 或 P3 邊界改回舊規則。

## 為什麼改

ChatGPT／Library 的現行命理研究已把 PK-6 與 EC-7 收斂成統一主流程；網站雖已有 R6.2.1 + P2 + P3，但頂層 runtime 仍使用較細的舊 24 步表示，且 EC-7「氣勢集中／雙強／中和／通關／生活五行」與全分組繼承規則尚未完整機器化。本版把兩邊的有效規則同步到網站現行 R6.2.1 架構，不降版、不改 deterministic calculation truth。

## 影響範圍

- `src/lib/bazi/runtime-contract.ts`
- `src/lib/bazi/instruction-database-base.ts`
- `src/lib/bazi/instruction-database.ts`
- R6.2.1 Current Master／P3／Instruction Registry／CURRENT STATE／AGENTS 治理文件
- 命理 runtime QA 與公開 release metadata

## 受保護範圍

- 不修改四柱、節氣、真太陽時、藏干、十神、起運、大運等 deterministic calculation truth。
- 不修改 `calendar.ts`、`chart.ts`、`interpret.ts` 分類順序。
- 不修改 D60、紫微、七政、一掌經的計算公式。
- 不修改 Focused Report 的 summary/body 產品契約、UI、auth、payment、Supabase schema 或既有資料。
- Paid Visual PR #295 與其他未合併 PR 不在本次範圍。

## 驗證狀態

- 合併前：Deploy gate／Engine suite／iPhone Safari 必須全綠。
- Engine suite 必須驗證 CURRENT 主鏈、P2、P3、EC-7 與全分組繼承 Gate 同時存在。
- 合併後：Vercel Production 必須 READY 且 production alias 指向本版 exact commit；正式首頁必須可讀取。
- Production 驗證完成後，再寫入 Supabase `public.release_history`。

## 回滾

回滾 r150 的 runtime contract、EC-7 group gate、治理文件、regression test 與 release metadata 即可；不涉及資料 migration，也不需回滾任何命盤 calculation truth。
