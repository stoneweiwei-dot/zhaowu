# 昭梧更新報告｜ZW-WEB-2026.09.23-r181

## 本次改動

- 正式凍結所有新增 Supabase Storage 寫入。
- 背景上傳、站主圖庫上傳、登入素材上傳與新命誥圖生成全部 fail-closed。
- Owner UI 對上述新增動作改成唯讀／disabled，不再讓站主誤以為可繼續往超額 Storage 塞檔案。
- 已有命誥圖仍可讀取；文字報告與公開首頁／命盤／問答不受影響。
- 第一批清理 manifest 鎖定：14 個未引用 audio 約 77.94 MB + 2 個未引用 gallery 原件約 0.99 MB。
- 背景庫約 611.5 MB、279 筆目前全部 enabled=true，暫不直接刪除。

## 為什麼改

Supabase Storage 已超過 Free 1 GB，且限制狀態曾讓 Storage／Edge 回 402。遷移前第一件事必須是停止新增寫入，否則一邊清理一邊繼續增長，永遠無法收斂。

## 影響範圍

- Owner background/gallery/login-visual upload。
- Owner 新命誥圖生成。
- Storage write policy 與 CURRENT storage migration state。

## 受保護範圍

- 不改八字／紫微／西占等計算核心。
- 不改 owner Auth、Payment、Supabase schema／RLS。
- 不刪任何 Storage object。
- 不改既有公開 Vercel 靜態資產。
- 不把 Floot／Dropbox 變成訪客 runtime 必要依賴。
- 不影響已有命誥圖讀取與文字報告 fail-open。

## 驗證狀態

- PR 必須通過 Deploy gate、Engine suite、iPhone Safari CI。
- 合併後只由 main 建立一次 Vercel Production。
- Production 必須 READY 且 SHA = main。
- Supabase Storage 清理本身仍待 delete 權限恢復，不得宣稱已回到 1 GB 以下。

## 回滾

如需恢復 Storage 新增寫入，只能在 Storage 回到安全額度並完成引用／刪除驗證後，單獨解除 `SUPABASE_STORAGE_WRITES_PAUSED`；不得因 UI 需求直接繞過 policy。
