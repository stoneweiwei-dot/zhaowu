# 昭梧更新報告｜ZW-WEB-2026.09.19-r153

## 本次改動

- 將 `zhaowu-design-system.css` 移到所有全站樣式之後，成為日間、夜間、桌面與 iPhone 的最後視覺權威。
- 移除 Header 語言切換的行內視覺覆蓋，公開語言只保留 English／繁體，兩種模式共用同一套控件。
- 統一 Header、狀態列、內容寬度、卡片、標題、段落與七種專卷的可讀密度；主要觸控目標至少 44px，輸入欄維持 16px。
- 將「最新更新」改為可點擊的 `/updates` 正式頁面，沿用 Production release metadata 顯示版本、日期、累計更新與本次內容，不寫死舊 commit SHA。

## 為什麼改

r150 已經提出視覺收口方向，但原 PR 的 CSS 載入契約、語言行內樣式與 CI 並未完成；r152 只放大原有折疊摘要，也未交付獨立版本頁。本次把兩項做成可由自動測試與正式站畫面共同驗證的產品行為。

## 影響範圍

- 全站 Header、狀態列、語言與日夜模式控件。
- 首頁輸入、八字與提問流程、七種專卷、圖表、登入、`/account`、`/gallery` 的共用視覺基線。
- 新增 `/updates` 公開路由與相應 English／繁體內容。

## 受保護範圍

- 不改命理引擎、D60 minute gate、報告生成與保存邏輯。
- 不改 owner cookie、Supabase 權限、DB/Storage 或媒體遷移。
- 不刪除 Supabase 原始資產，也不啟用韓文／印地語入口。

## 驗證狀態

- 提交前 engine／contract suite 646/646、TypeScript 與 production build：PASS。
- GitHub Production CI、Vercel Production 與正式站路由：待合併後逐項核對。
- 實體 iPhone Safari：不以桌面畫面代替，未驗證前不得標示完成。

## 回滾

回滾本次 release commit 即可恢復 r152 的 Header 與行內更新摘要；本次沒有資料庫 schema 或資料刪除操作。
