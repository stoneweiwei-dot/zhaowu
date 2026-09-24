# 昭梧更新報告｜ZW-WEB-2026.09.24-r192

## 本次改動

- 首頁「今日一格」、核心生辰流程與桌面安裝提示各自加上獨立 fail-open boundary；單一區塊異常不再拖垮整個首頁。
- 已保存生辰的結構預覽改為 fail-open；r190 的完整命書 lazy mount 保留。
- 完整報告移除 `ZHAOWU · PERSONAL ANALYSIS`、`YOUR QUESTION`、`The answer first`、`Chart basics`、`Reasoning notes` 等 prompt／dashboard 式標題與教學型 helper copy，改為簡短成品語言。
- 「一盤一景」保留 r191「圖像只作下游翻譯」邊界，但客戶層改成「命象／依據／下一步」，不再向客戶解釋內部報告流程。
- 新增 `STONE-R6.2.2-CURRENT-MASTER.md` 作 CURRENT governance/evidence master：統一證據等級、執行完整性、時間層級與信度語言；deterministic runtime 仍為 R6.2.1 + P2 + P3，不假稱核心引擎重寫。
- 修正 release ledger 漂移：公共版本、verification marker、release contract 統一到 r192。
- Supabase Storage 維持第一輪清理後的 549 objects / 1,035,403,153 bytes；寫入凍結不解除，因 <900 MB 安全目標尚未達成。

## 為什麼改

目前網站的核心問題已不是再增加功能，而是收斂成品：首頁任何非核心區塊都不應造成整頁錯誤；報告應直接回答問題，而不是像 AI dashboard 解釋自己如何推理；命理治理文件必須明確區分「證據／執行規則」與「deterministic 排盤 runtime」。

Storage 雖已低於 1 GiB，但餘量過小，不足以安全恢復音樂／圖片上傳，因此本版只記錄真實狀態，不以「已低於上限」冒充容量收官。

## 影響範圍

- 首頁錯誤隔離與 saved-birth 恢復。
- 完整報告客戶可見文案、一盤一景呈現。
- 命理治理／證據版本入口。
- Release metadata 與 contract tests。
- Supabase Storage 狀態文件。

## 受保護範圍

本版不修改：

- 四柱曆法、真太陽時、子時換日。
- R6.2.1 + P2 + P3 deterministic runtime 與 r191「結構不是平衡表」判法。
- Auth、payment、Supabase schema。
- `summary / body` 保存契約。
- 宋式視覺權威、青玉小龍、播放器、Login animation。
- 已完成的 39-object Storage 實體清理。

## 驗證狀態

合併前必須通過：

- Deploy gate / release ledger。
- Engine suite。
- r192 homepage fail-open contract。
- r192 report-copy / R6.2.2 governance contract。
- TypeScript / Vite build。
- 現有 iPhone Safari CI。

合併後必須：

- Vercel Production SHA = current main SHA。
- canonical Production `/`、`/login`、`/updates`、`/quiz/cultivation-destiny` smoke。
- 檢查 Production runtime errors。
- Supabase project 維持 ACTIVE_HEALTHY，重新核對 Storage bytes。

真 iPhone Safari 手動觀感若未由實機完成，仍不得標為人工真機 VERIFIED。

## 回滾

前端文案、首頁 error boundary 與治理文件均可回滾至 r191，不涉及資料 migration。Supabase 已永久刪除的 39 個零引用物件不隨網站 rollback 還原；Storage write freeze 維持。
