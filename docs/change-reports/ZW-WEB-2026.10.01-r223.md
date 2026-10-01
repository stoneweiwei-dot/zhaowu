# 昭梧更新報告｜ZW-WEB-2026.10.01-r223

## 本次改動

正式版號由 r222 升至 r223，彙整 2026-09-29 之後已合併並上線的使用者可見變更（先前維持 r222 標籤，導致站主看不到「最新更新」變化）：

- #541 英文版夜間切換鈕「Night」不再被截成「Nigh」。
- #546／#549／#555／#557 開場影片：每次開啟 App 都播放（sessionStorage 記「本次已看」）、可跳過、保留聲音、上限 15 秒；站主上傳影片於瀏覽器內以 ffmpeg.wasm 壓縮；素材管理只留「設為目前使用／改名／刪除」；413 超過單檔上限時以中文說明。
- #556 開場與登入頁聲音鈕改為內嵌 SVG 喇叭圖示，修正文字逐字換行溢出。
- #551 站主音樂上傳：分支 tip 過期（`cannot lock ref`）時以實際 tip 重試。
- #558 背景音樂切到背景時暫停、起始音量放輕。
- `src/lib/site-stats.ts`、`lib/zhaowu-verification.js`：版本同步為 `ZW-WEB-2026.10.01-r223`。

## 為什麼改

站主回報「網站去看還是一樣，最新更新還是 r222」。查證：r222 之後所有合併均屬維護性變更，依 AGENTS.md §14 一般 PR 不遞增版號，因此頁面顯示的版號與更新摘要沒有變。實際程式已在正式站（`/release.json` 與最新 main commit 一致），只是對外標籤未更新。本次以正式發版把標籤與實際內容對齊。

## 影響範圍

- 頁尾版號、「最新更新」摘要與 `/updates` 頁文字。
- 其餘為上列已合併 PR 的既有內容，本次不再新增行為變更。

## 受保護範圍

- 不改命盤計算、報告生成、auth／payment、Supabase 結構、路由。

## 驗證狀態

- 合併前：Deploy gate、Engine suite、iPhone Safari、Visual regression 全綠。
- 合併後：以 `/release.json` 核對 Production commit，並由 production-smoke 工作流驗證；Supabase `release_history` 補寫 r223 一列（含 source commit、PR、deployment ID、驗證證據）。

## 回滾

`git revert` 本次 commit 即可還原版號與文字（無資料變更）；`release_history` 的 r223 列可刪除該列還原，不影響其他資料。
