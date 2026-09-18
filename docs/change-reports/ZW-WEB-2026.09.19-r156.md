# 昭梧更新報告｜ZW-WEB-2026.09.19-r156

## 本次改動

- 背景音樂上傳後可以直接改名；改名只更新 `owner-music` manifest 的顯示名稱，不重新轉碼、不重傳音訊。
- 背景音樂新增多選：可全選非播放中曲目、取消全選、一次刪除多首。
- 音樂批量刪除改成單次後端操作／單次 Git commit，避免選很多首時重複逐首推送。
- 素材圖庫新增多選與批量：啟用所選、停用所選、刪除所選。
- 登入動畫／封面素材新增多選與批量：啟用所選、停用所選、刪除所選；內置素材保持唯讀，不進批量選取。
- 首頁背景新增多選與批量：啟用所選、停用所選、刪除所選。
- 客戶報告新增多選與批量刪除。
- 所有批量刪除操作均需確認；音樂目前播放中的曲目不可被批量刪除。
- 各資產卡新增獨立選取 checkbox，避免把原本「啟用」checkbox 混作批量選取。
- 新增 `scripts/r156-owner-bulk-actions.test.mjs` 並接入 deploy gate。

## 為什麼改

站主要求後台不再只能逐筆操作：音樂上傳後要能修改顯示名稱，同時後台所有實際檔案／資產清單都應具備一致的多選能力，選中多個項目後可以一起執行指令，例如批量刪除。這次把現有五個主要後台資產清單統一到同一種操作模型，而不改動各自的資料來源與權限邊界。

## 影響範圍

- `/account`：背景音樂、首頁背景、客戶報告。
- `/gallery`：登入素材、內容素材圖庫。
- `/api/owner-music`：新增 rename，以及多 ID 批量刪除。
- `owner-music` Git 分支 manifest：允許修改曲目顯示名稱；批量刪除多首時使用同一 commit。
- Owner UI 的多選／批量操作與相應 regression tests。

## 受保護範圍

- 不修改音訊檔二進位內容、不重新轉碼、不改音訊播放來源。
- 不刪除目前播放中的音樂。
- 不修改站主登入 Cookie／密鑰驗證／同源驗證。
- 不修改 Supabase schema、RLS、Auth、Payment。
- 不修改八字、紫微、七政、一掌經、D60 或任何 deterministic calculation truth。
- 不改客戶報告內容契約，只新增站主批量刪除管理能力。
- 不改 Netlify／Vercel host routing 規則。

## 驗證狀態

- Source 已修改，等待 PR Production CI。
- 合併前必須 Deploy gate、Engine suite、iPhone Safari 全綠。
- 合併後必須確認 Netlify Production deploy commit 等於 merge SHA。
- Production 必須核對：
  - `/account` 正常載入；
  - `/gallery` 正常載入；
  - `/api/owner-music` GET 正常；
  - 正式 bundle 含音樂改名與五類 bulk toolbar；
  - iPhone Safari 不因多選 toolbar 遮擋主要操作。
- 完成 Production 驗證後，再寫入 Supabase `release_history` r156。

## 回滾

回滾 r156 對 owner music API／manifest helper、五個 owner list UI、regression test、release metadata 與本 change report 的改動即可回到 r155。沒有資料庫 migration；若已在 Production 使用過改名，回滾程式不會自動還原已改過的曲目顯示名稱，但不影響音訊二進位檔。
