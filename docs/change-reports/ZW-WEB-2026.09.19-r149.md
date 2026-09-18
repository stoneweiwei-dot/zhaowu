# 昭梧更新報告｜ZW-WEB-2026.09.19-r149

## 本次改動

- 背景音樂由單一浮動播放按鈕升級為五鍵多曲目播放器。
- 固定提供：上一首、播放／暫停、下一首、循環播放、隨機播放。
- 直接使用 `/api/owner-music` 已存在的完整站主歌單，不新增第二套音樂來源。
- 目前正式歌單若有多首曲目，上一首／下一首會在現有曲目間切換；隨機模式會重排目前播放順序。
- 循環模式預設開啟；關閉後播放到歌單尾端即停止，不再強制單曲無限 loop。
- 循環／隨機偏好各自寫入本機 `localStorage`，不互相覆蓋。
- 每個控制至少 44px 觸控尺寸，適配 iPhone。
- 保留 iPhone／iPad Safari 第一次播放必須由 user gesture 解鎖的既有處理。
- 站主「背景音樂管理」文案同步標明：已保留曲目共同構成網站歌單，前台支援完整播放控制。

## 為什麼改

舊版背景音樂只有一個播放／停止浮動按鈕，而且 HTML audio 被固定成單曲 loop；後台其實已保存多首曲目，但前台沒有利用完整歌單，因此無法切歌、循環歌單或隨機播放。這次只補齊播放器控制層，不重做上傳、儲存或音檔來源。

## 影響範圍

- 全站固定背景音樂播放器。
- iPhone Safari 背景音樂觸控操作。
- 站主背景音樂管理提示文字。
- Music playlist regression tests。
- 公開 release metadata。

## 受保護範圍

- 不修改 `/api/owner-music` 上傳與站主 Cookie 驗證。
- 不修改 owner-music Git 儲存 branch／manifest 結構。
- 不改 Supabase schema、Auth、Payment、報告、命理計算、D60、紫微、七政、一掌經。
- 不把音樂重新接回 Supabase `zhaowu-audio` bucket。
- 不修改站主既有曲目檔案。

## 驗證狀態

- 合併前要求 Deploy gate、Engine suite、iPhone Safari 全綠。
- 新增 `scripts/r149-music-player-controls.test.mjs`，檢查五鍵播放器、44px touch target、完整歌單、循環／隨機持久化與 Safari gesture unlock。
- 合併後必須確認 Vercel Production exact SHA、首頁 HTTP 200，以及 `/api/owner-music` 仍可返回多首曲目。
- 真實 Production 再確認目前曲目可播放，上一首／下一首、循環與隨機按鈕存在且可操作。

## 回滾

回滾 `background-music.tsx`、owner music manager 文案、r149 regression test 與 release metadata 即可回到 r148；不涉及資料遷移或音檔刪除。
