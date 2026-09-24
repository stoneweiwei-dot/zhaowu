# 昭梧更新報告｜ZW-WEB-2026.09.24-r194

## 本次改動

- 依站主最新付費決定，以 Supabase Pro 的 100 GB Storage 額度取代舊 Free 1 GB／900 MB 凍結規則。
- 恢復背景、圖庫、登入素材與報告圖片的 Storage 寫入。
- 登入 MP4／WebM 單檔上限提高至 500 MB；6 MB 以上改用官方 TUS 斷點續傳。
- `zhaowu-gallery` bucket 單檔上限同步提高至 500 MB。

## 為什麼改

現行組織已是站主批准的 Pro，實測 1,035,403,153 bytes，遠低於官方 100 GB 包含額度。舊 Free-plan 凍結及 10 MB bucket 限制錯誤阻擋了付費容量的正常使用。

## 影響範圍

- `/account` 背景與報告圖片管理。
- `/gallery` 圖庫與登入影片管理。
- Vercel owner-data bridge、Supabase owner-data Edge Function、gallery bucket 設定。

## 受保護範圍

- 不刪除或改寫既有 Storage 物件與資料列。
- 不改 owner cookie、身份權限、排盤、報告內容、付款、日曆或公開訪客流程。
- 登入成品仍限 15 秒；不在瀏覽器內轉碼。

## 驗證狀態

- Local deploy suite：222/222 PASS；full engine suite PASS；TypeScript 與 Vite production build PASS。
- Supabase migration：PASS，`zhaowu-gallery.file_size_limit = 524288000`；Edge Function `zhaowu-owner-data` v5 ACTIVE，部署內容已回讀核對。
- GitHub main／Vercel Production：待單次正式發佈及 exact-SHA 驗證。

## 回滾

把 Storage policy 切回 paused、恢復 Vercel API growth-action gate、把 gallery bucket 單檔上限降回 10 MB，並回退 r194 runtime commit；既有素材不需刪除。
