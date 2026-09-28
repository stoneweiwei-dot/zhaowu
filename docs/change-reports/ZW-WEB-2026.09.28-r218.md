# 昭梧更新報告｜ZW-WEB-2026.09.28-r218

## 本次改動

- 站主 2026-09-28 指令：iPhone 螢幕錄影（MOV）無法上傳登入動畫，要求所有主流影片格式都能上傳。
- 新增 `src/lib/video-formats.ts` 作為唯一格式清單：MP4、M4V、MOV、WebM、3GP／3G2、MKV、OGV、AVI、WMV、FLV、MPEG、TS。手機回報空白或別名 MIME 時以副檔名判定。
- 登入動畫管理：`accept` 改用共用清單；上傳不再因影片超過 15 秒被拒，改提示「登入頁只播放前 15 秒」；瀏覽器無法解碼的格式提示改用 MP4／MOV。
- `src/lib/gallery-assets.ts`、`src/lib/bridge/gallery-assets.ts`：以解析後的 MIME 上傳；`owner-data-client.ts` 小檔路徑以票證 MIME 重新包裝檔案，避免 finalize MIME 不符。
- Edge Function `zhaowu-owner-data`：`LOADING_VIDEO_TYPES` 與副檔名對應同步擴充。
- Storage bucket `zhaowu-gallery` 的 `allowed_mime_types` 同步擴充（migration `20260928100000`）。

## 為什麼改

原本三層（前端、Edge Function、Storage bucket）都只允許 `video/mp4`、`video/webm`，iPhone 螢幕錄影是 `video/quicktime`（.MOV），在第一層就被擋下。

## 影響範圍

- 站主後台「登入動畫管理」上傳。
- `/login` 播放：MP4／MOV／M4V／WebM／3GP／OGV 由瀏覽器原生播放；HEVC 編碼的 MOV 在 Safari 可播，部分桌面 Chrome 無硬體 HEVC 時會退回封面。AVI／WMV／FLV／MKV（Safari）／TS 瀏覽器不能原生播放，會退回封面；本次不做伺服器轉碼（零成本原則）。

## 受保護範圍

- 圖片上傳規則、背景 bucket、報告圖片不變。
- 500 MB 上限不變；登入頁 15 秒播放上限不變。
- 不改 auth、payment、命理計算、報告邏輯。

## 驗證狀態

- 新增 `scripts/r218-login-video-formats.test.mjs`；更新 r191／r197／loading-gallery 測試的 accept 與錯誤訊息斷言。
- 合併後須確認 Vercel Production exact SHA、Edge Function 新版本、bucket allowed_mime_types 已生效。
- 正式驗證：站主以 iPhone 上傳一段螢幕錄影 MOV。

## 回滾

回滾本 PR 即恢復 MP4／WebM 限制；bucket 以舊 migration 的六項 MIME 重新套用；Edge Function 回部署前一版。已上傳的非 MP4／WebM 檔案可在後台刪除。
