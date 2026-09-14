# 昭梧後台待命推理引擎 v1.0｜ARCHIVED SOURCE

狀態：`ARCHIVED / DO NOT MERGE`
分支：`standby/reasoning-engine-v1`
原基準 main：`16606d4a06bf9ac4616936521555d09e1e09dd1d`
歸檔日期：2026-09-14

此分支已嚴重落後目前 `main`，不再是可啟動的待命程式包，也不得整支 merge、rebase 或直接搬回 production。

保留它只為歷史來源與設計參考。仍可能有價值的概念包括：
- 從格／化格／專旺真假前置 Gate；
- 古籍規則 Registry 的必要條件／排除條件／例外；
- 地支動態關係裁決；
- Evidence Graph；
- Prediction Ledger。

這些概念若日後仍符合當時最新 `STONE-R6.2.1+`、`AGENTS.md`、Calculation Truth、Focused Report 與現行 runtime，只能在**最新 main** 逐模組重新設計、重新寫測試、重新驗證；不得以本分支舊實碼作直接 production patch。

目前執行來源統一為：
1. GitHub Issue #1：唯一交接板；
2. Linear STO-5：唯一核心 QA；
3. Linear STO-14：真實 provider／可選命誥圖（Backlog）；
4. Linear STO-11：版本與更新內容頁。

本分支不得觸發任何 provider、部署或正式站變更。