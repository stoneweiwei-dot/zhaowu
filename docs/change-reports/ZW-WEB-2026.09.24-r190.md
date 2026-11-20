# 昭梧更新報告｜ZW-WEB-2026.09.24-r190

## 本次改動

- 首頁不再在「完整命盤細節」尚未展開時預先掛載 `UnifiedBirthReport`；正式四柱與基礎解釋先呈現，使用者展開後才計算／渲染完整命書細節。
- 補回歸契約，鎖定完整命書必須 lazy mount，避免可選深層內容把整個首頁帶入 Router Error。
- Supabase Storage 已依鎖定 manifest 重新 live audit，並用正式 Storage API 實體刪除 39 個零引用物件，共 160,741,199 bytes。
- 清理後 Storage 為 549 objects／1,035,403,153 bytes；一次性清理執行器已立即退役為 JWT 驗證的 410 stub。
- Storage write freeze 繼續保留，避免在 Free 額度下重新超額。

## 為什麼改

最終 Production 實際瀏覽器驗收發現首頁曾落入「Something went wrong」錯誤頁，而 /login、/updates 與修仙測驗正常。首頁會在已有保存生辰時預先渲染完整命書細節，讓本來屬於可選展開內容的計算／資料邊界有機會拖垮整個首頁。

r190 將首頁核心流程與可選完整細節真正隔離：核心錄入、四柱與基礎解釋必須先可用；深層命書只有展開後才掛載。

## 影響範圍

- 首頁已保存生辰的恢復流程。
- 「展開完整命盤細節」的掛載時機。
- Supabase Storage 實體用量與 cleanup 狀態。
- 不新增產品功能，不新增視覺體系。

## 受保護範圍

本版不修改：

- 八字曆法、四柱排盤、真太陽時、子時換日。
- 格局、旺衰、用神與報告推演 truth。
- r189「一盤一景」內容規格。
- Auth、payment、Supabase schema。
- 宋式設計權威、r188 小漫畫翻譯層。
- 青玉小龍、播放器與 Login animation。

## 驗證狀態

合併前：

- Deploy gate
- Engine suite
- iPhone Safari CI
- TypeScript／Vite build
- r190 lazy-mount contract

合併後：

- Vercel Production SHA 必須等於 current main。
- 實體 Production 首頁、/login、/updates、修仙測驗重新 smoke。
- Production runtime error scan。

實體 iPhone 的手動觀感若未由真機操作完成，仍不得偽稱已人工真機驗收。

## 回滾

若 lazy mount 造成完整命盤細節無法展開，可回滾 r190 前端 commit；Storage 已刪除的 39 個物件是 live audit 確認零引用後的永久清理，不以網站 rollback 還原。
