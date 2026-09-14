# 昭梧更新報告｜ZW-WEB-2026.09.15-r136.1

## 本次改動

- 在 r136 的動態 Supabase 音樂 fallback 之外，加入已驗證啟用音檔的 deterministic bootstrap fallback。
- 當 Git `owner-music` manifest 無 active track，且動態讀取 `background_music_assets` 失敗或取不到資料時，仍可使用已驗證的 `River In My Breathing 2` M4A public storage 路徑播放。
- Supabase REST 讀取改用 publishable `apikey`；不再額外附帶 Bearer Authorization。
- 保留 r135 的 iPhone 安全 MP3／M4A 分段上傳與手動點擊後才載入／播放的行為。

## 為什麼改

r136 已恢復 Supabase fallback，但如果動態 public metadata 讀取失敗，仍可能回到沒有 active track 的狀態。r136.1 加入一條確定性 bootstrap 路徑，確保已確認存在且啟用的背景音樂仍可被播放，同時不改上傳邏輯。

## 影響範圍

- `/api/owner-music` GET
- 站主背景音樂 fallback
- 既有 `zhaowu-audio` public storage 音檔

不修改八字、紫微、D60、西洋占星、登入、付費流程或 Supabase schema。

## Source

- Commit：`5768404eb49f6d4be447fd5fee8332c645e5567b`

## 回滾

回退 r136.1 commit 即回到 r136 動態 Supabase fallback；r135 的 iPhone 安全分段上傳不受影響。