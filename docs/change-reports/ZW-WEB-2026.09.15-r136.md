# 昭梧更新報告｜ZW-WEB-2026.09.15-r136

## 本次改動

- 恢復站主背景音樂的 Supabase fallback：當 Git `owner-music` manifest 沒有 active track 時，`/api/owner-music` 會讀取 Supabase `background_music_assets` 最新一筆 `enabled=true` 音檔，並回傳 `zhaowu-audio` public storage URL 播放。
- 保留 r135 的 iPhone 安全上傳路徑：12MB 內 MP3／M4A 仍可直接走 Git 分段上傳；Supabase 只作沒有 Git active track 時的播放 fallback。
- Regression test 加鎖 `readSupabaseActiveTrack`、`zhaowu-audio` bucket 與 `source: "supabase-fallback"`。

## 為什麼改

r135 解決了 iPhone `decodeAudioData` 卡在 6% 的問題，但在 Git 緊急曲庫沒有 active track 時，原本已存在於 Supabase 的背景音樂沒有被重新接回播放鏈。r136 只恢復這個 fallback，不推翻 r135 的 Git 分段上傳策略。

## 影響範圍

- `/api/owner-music` GET
- 站主背景音樂播放 fallback
- `background_music_assets` 與 `zhaowu-audio` 既有 Supabase 資料

不修改八字、紫微、D60、西洋占星、一般前台內容、站主登入或 Supabase schema。

## Production 證據

- Source commit：`f28ecfaa69a0035eb5b9024bc6bd0443c03020fa`
- Vercel deployment：`dpl_3Cv9nCC4cLeSdX7LXjjzftwTFiDK`
- 狀態：`READY / production`
- Production SHA 與 main SHA 一致。

## 回滾

回退 `f28ecfaa69a0035eb5b9024bc6bd0443c03020fa` 即可回到 r135：Git active track 行為不變，只移除 Supabase 背景音樂 fallback。