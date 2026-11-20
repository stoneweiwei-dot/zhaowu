# 昭梧更新報告｜ZW-WEB-2026.09.01-r19

日期：2026-09-01（AEST）
狀態：待 Production 驗證

## 本次改動

1. 修正 loading v13 建置來源：由已損壞的 `loading-user-20260831.part.*` 改為可完整解碼的 `loading-v13.part.00/.01`。
2. 建置時鎖定正確分片數量與 SHA-256；媒體資料再度損壞時直接讓 CI 失敗，不再部署「HTTP 200 但無法播放」的假正常檔案。
3. 移除損壞 WebP 備援路徑，改用現有可正常顯示的 `loading-poster.jpg`。
4. 動畫在瀏覽器解碼失敗時立即卸載 video 元素，只顯示靜態圖，因此 iPhone 不再出現破圖問號。
5. 保留載入門三秒硬退出，不讓圖片或影片阻塞首頁、登入或帳戶頁。

## 為什麼改

iPhone 實機截圖顯示 loading 畫面中央出現破圖問號並停在 96%。正式資產網址雖回傳 HTTP 200 與 `video/mp4`，但 FFmpeg 解碼證實 H.264 NAL 資料損壞；原 WebP 備援同樣有像素資料損壞。根因是建置腳本選錯了分片前綴，而不是手機、網路或 Vercel MIME 設定。

## 影響範圍

- 全站共用 loading gate
- loading v13 媒體建置與完整性檢查
- iPhone／Safari 媒體失敗備援
- release footer fallback

## 不改範圍

- 首頁表單、首頁 section 與視覺排版
- 八字、紫微、七政、一掌經與所有 Calculation Truth
- 報告生成、圖片 provider、Gallery、登入、owner 權限、付款與 Supabase schema
- 三語內容與路由

## 回滾

回退 `scripts/write-intro-media.mjs`、`src/components/intro-gate.tsx`、對應測試、`CURRENT-STATE.md`、`src/lib/site-stats.ts` 與本報告。沒有資料庫 schema 變更。

## Production 驗證欄

- GitHub commit：待寫入
- CI / Build：待驗證
- Vercel deployment：待驗證
- Production commit：待驗證
- 資產驗證：待確認 MP4 可解碼、poster HTTP 200、iPhone loading 無破圖
- 路由驗證：待確認 `/`、`/login`、`/account` 最遲三秒放行
