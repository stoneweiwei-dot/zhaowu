# 昭梧更新報告｜ZW-WEB-2026.09.14-r132

## 本次改動

- 站主背景音樂在 iPhone 上不再先下載 20MB 級 FFmpeg WASM。5–10 MB 的 MP3／M4A／可解碼音訊改走本機 `decodeAudioData` + MP3 壓縮（96 kbps，必要時 64 kbps），壓到安全上傳大小後再 POST。
- 這修掉實機「音訊優化器初始化逾時，請重新再試」：舊路徑把略大於 4 MB 的相容音檔也送進 FFmpeg，Safari 在 25 秒內編譯核心失敗，上傳直接中斷。
- iPhone 若解不了該格式，明確提示改選 MP3／M4A 或改用電腦，不再卡死在初始化。
- 電腦端仍保留 FFmpeg 給 FLAC 等本機解不了的格式；載入逾時放寬到 90 秒，並在結束時 terminate，避免 blob URL 過早撤銷。
- 最低碼率仍是 64 kbps，不把音質壓到 32 kbps。來源檔上限仍是 200 MB。

## 為什麼改

站主在 iPhone 選了一首約 5–10 MB 的音樂，畫面停在「音訊優化器初始化逾時」。根因是略大於 serverless 4 MB 的 MP3 被強制走瀏覽器 FFmpeg，而 iPhone Safari 無法在短時間內完成 WASM 初始化。

## 影響範圍

- `/account` 站主背景音樂管理
- `src/lib/owner-music-transcode.ts` 與本機壓縮模組
- PWA cache `zhaowu-shell-r132`

不修改八字、紫微、D60、西洋占星或其他命理 Calculation Truth；不復活 Supabase Audio CDN；不改普通會員登入、今日指引、Header／Gallery 已上線行為。

## 回滾

回退本版本即可回到 r131 的 FFmpeg-first 路徑。Owner Cookie 與 `owner-music` 曲庫分支不需回滾。
