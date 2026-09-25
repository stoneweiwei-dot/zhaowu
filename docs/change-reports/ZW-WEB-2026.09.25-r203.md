# 昭梧更新報告｜ZW-WEB-2026.09.25-r203

## 本次改動

- 修復已加入 iPhone 主畫面的昭梧停留在舊 bundle、必須刪除後重新加入才看得到新版的問題。
- Service Worker 啟用新 release 時，不再只處理首頁 `/`；所有同源視窗會保留目前路徑並帶入新 release 導航。
- 移除「某 release 已嘗試刷新就永久停止」的錯誤判斷；失敗後改由 bundle path 做一次受控 fallback reload。
- 公開版本 fallback 更新為 r203，避免 Supabase release_history 落後時仍顯示 r200。
- Manifest `id`、`start_url`、`scope` 維持 `/`，不建立新的 PWA 身分。

## 為什麼改

站主在 2026-09-25 的已安裝 iPhone 主畫面版本仍顯示 r200；同時 GitHub main 與 Vercel Production 已是 r202。現行 r202 的 Service Worker 自我修復只強制刷新根路徑，而 iOS 會恢復上次停留的深層頁面，例如 `/updates`。此外舊 client 會把一次未成功的 release navigation 記成已嘗試，之後同 release 不再走主要刷新路徑。

## 影響範圍

- PWA Service Worker activation。
- 已安裝主畫面 App 的 release 檢查與受控 reload。
- 「最新版本更新內容」的公開 fallback 版本資訊。

## 受保護範圍

- 不改命理計算、報告內容、付款、Auth、Owner Cookie、Supabase schema 或 Storage 物件。
- 不改 manifest identity；既有主畫面 App 必須原地升級。
- 不要求使用者刪除／重新加入主畫面。

## 驗證狀態

- 合併前：PWA contract、Deploy gate、Engine suite、iPhone Safari CI 必須全綠。
- 合併後：Vercel Production githubCommitSha 必須等於最新 main。
- Production release metadata 與 Service Worker 必須對應同一 release SHA。
- 真實已安裝 iPhone PWA 仍以「不刪除、不重新加入即可升級」作最終實機 Gate。

## 回滾

回滾 r203 只恢復舊 PWA 更新策略與 release fallback；沒有資料 migration 或破壞性資料變更。
