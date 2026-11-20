# 昭梧更新報告｜ZW-WEB-2026.09.05-r52

日期：2026-09-05 AEST

## 本次改動

- 將全站背景音樂《淨佛聖願》切換到昭梧 Supabase Storage 的新 AAC-LC 正常音檔：`zhaowu-audio/background/jingfo-shengyuan-aac.m4a`。
- 新音檔完整 464.773 秒、5,703,917 bytes、AAC-LC 48 kHz 雙聲道；伺服器端搬運與 Supabase CDN 二次下載的 SHA-256 均為 `a80b151e222337f5f3e3d672b4f2ec941fc8a29785815ed978ded622071b51eb`。
- Supabase CDN Range 驗證為 HTTP 206，回傳 `bytes 0-5703916/5703917`，並確認 `ftyp`、`moov`、`mdat` 結構存在。
- iPhone Safari 解鎖行為增加 `touchstart`，保留 `pointerdown`、`touchend`、`keydown`；允許 autoplay 的瀏覽器仍先自動嘗試播放，被 Safari 阻擋時會在首次正常手勢同步重試。
- 手機端不再把音樂文字控制隱藏，只剩小音符；改為固定顯示「播放音樂／音樂播放中」，讓使用者能明確手動解鎖。
- 背景音量由 0.18 微調至 0.24，維持低干擾背景用途。

## 為什麼改

r48 原音源雖然 HTTP 與 Range 表面正常，但後續完整媒體驗證證明它不是可直接播放的 MP4/M4A：Suno 私有歌曲只提供受保護的媒體流，整份 8,358,208-byte 檔案找不到 `ftyp`、`moov`、`mdat` 或 `moof`。Supabase 當時只是完整保存了不可直接播放的受保護 bytes，因此 Safari 沒有聲音。這次改用使用者原始音檔轉出的標準 AAC-LC，並在存入 Supabase 後再次以 CDN 實際交付內容校驗。

## 影響範圍

- `src/components/background-music.tsx`
- `scripts/background-music.test.mjs`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- `docs/change-reports/ZW-WEB-2026.09.05-r52.md`
- Supabase Storage 新增 `zhaowu-audio/background/jingfo-shengyuan-aac.m4a`

## 保護範圍

未修改：八字／紫微／七政／一掌經與其他命理計算、auth、payment、Supabase schema、報告生成與報告歷史、Loading gate、首頁其他設計、路由、三語系統。舊的 `background/jingfo-shengyuan.m4a` 暫時保留，只作回滾／稽核，不再由網站引用。

## 回滾

若新播放路徑產生未知回歸，只需回滾本 r52 網站 commit，即可恢復上一版背景音樂元件；新 AAC Storage 物件可保留，不需要資料庫 schema 回滾。不得重新採用已證實不可直接播放的 Suno 私有受保護媒體 bytes 作正式音源。

## 驗證狀態

- 音源本體：PASS。5,703,917 bytes；SHA-256 與本地已驗證 AAC-LC 完全一致；`ftyp`／`moov`／`mdat` PASS。
- Supabase CDN：PASS。HTTP 206 Range；`audio/mp4`；完整下載 SHA-256 PASS。
- GitHub deterministic regression / TypeScript / Vite build：待本分支 CI。
- Vercel Preview / Production exact SHA：待 CI 通過及合併後驗證。
- `/`、`/login`、`/account`：待 Production exact SHA 上線後驗證。
- 真實 iPhone Safari 有聲播放：自動化只能驗證手勢契約與 WebKit 行為；最終真機聽感仍標記 `NOT PHYSICALLY VERIFIED`，由站主實機確認。
