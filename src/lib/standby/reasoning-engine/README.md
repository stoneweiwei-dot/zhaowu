# 昭梧後台待命推理引擎 v1.0

狀態：STANDBY / INACTIVE
分支：`standby/reasoning-engine-v1`
基準 main：`16606d4a06bf9ac4616936521555d09e1e09dd1d`

這批模組只作後台待命，不接入任何 production runtime，也不改變目前網站輸出。

## 已準備模組

1. 從格／化格／專旺真假前置閘門
   - 月令支持
   - 透干支持
   - 根氣支持
   - 引化／通關
   - 破化／反制
   - 輸出：成立／部分成立／不成立／資料不足

2. 地支動態關係裁決器
   - 以既有 `branch-relations.ts` 為輸入
   - 月令、透干、關鍵宮位、病藥、歲運引動共同裁決
   - 病藥核心權重高於單一靜態排名
   - 不把合、沖、刑直接等同吉凶或合化

3. Evidence Graph
   - fact / rule / inference / counterevidence / trigger / real-world
   - supports / contradicts / requires / activates / maps-to
   - 每個現實結論可回溯來源與反證

4. 古籍規則 Registry
   - 原典規則不以關鍵字命中直接成格
   - 每條規則拆必要條件、排除條件、例外與來源
   - 輸出成立、部分成立、不成立、資料不足

5. Prediction Ledger
   - 預測建立後鎖定原文、條件、證據與置信度
   - 到期只可追加 outcome，不可事後改寫原始預測
   - 支援命中／部分命中／未發生／無法判斷及加權回測率

## 啟動條件

只有站主明確發出：

`啟動所有後台待命指令`

才進入整合階段。

啟動時不得直接把本分支整體 merge 到 main。必須先：

1. 重新讀取當時最新 main HEAD。
2. 比對本分支與最新 runtime 是否已出現重疊或衝突。
3. 逐模組接入：Transformation Gate → Rule Registry → Relation Arbitrator → Evidence Graph → Prediction Ledger。
4. 補 benchmark / regression tests。
5. 跑 `npm run test:engine`、`npm run build`、typecheck 與相關 UI contract。
6. 只有測試通過才進 main。
7. 再按 ZHAOWU ABSOLUTE EXECUTION PROTOCOL 驗證 Vercel production 與正式網址。

## 保護範圍

待命期間不得影響：

- 現有八字主引擎
- 紫微
- 七政四餘
- 西洋占星
- 一掌經與 D60
- 報告生成與歷史
- auth / owner / Supabase
- calendar / method routes
- production routing
- 多語系

本目錄目前沒有任何 production import；`enabled` 固定為 `false`。
