# 昭梧更新報告｜ZW-WEB-2026.09.19-r152

## 本次改動

- 保留既有「最新更新」展開面板，不新增平行版本頁。
- 將入口提升為至少 44px 可點擊高度，加入水平／垂直置中與 touch-manipulation。
- 將展開後更新內容提升至 14px 字級與較寬行距，改善 iPhone Safari 閱讀。
- 版本公開 fallback 依既有 release ledger 從 r151 正常遞增至 r152。

## 為什麼改

STO-11 的入口已存在，但在手機上仍沿用狀態列約 11px 的視覺密度，點擊目標不足、更新內容偏小。這次只補齊使用者可見、可點擊、可閱讀的手機驗收缺口，不重做版本計數或 release metadata 架構。

## 影響範圍

- 全站非登入、非站主工作區 Header 的「最新更新」入口與展開內容。
- 公開 release fallback 與 matching change-report contract。

## 受保護範圍

- 不改八字／命理引擎、報告流程、D60、付款、權限、登入、Gallery、背景音樂或 Supabase schema。
- 不新增第二套版本頁或平行 release source of truth。
- Supabase release_history 只在 r152 Production 驗證完成後追加，不覆寫舊紀錄。

## 驗證狀態

- 合併前：release-ledger contract、專案測試、TypeScript build、部署 gate。
- 合併後：Vercel Production SHA 必須與 main 精確一致；Production `/` 必須可打開「最新更新」面板。
- iPhone Safari：確認入口至少 44px、無水平溢出、更新內容可讀。

## 回滾

回退 r152 的 Header class、release fallback 與 matching change report 即可；不涉及資料庫 migration。
