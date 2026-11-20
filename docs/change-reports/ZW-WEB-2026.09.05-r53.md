# 昭梧更新報告｜ZW-WEB-2026.09.05-r53

日期：2026-09-05 AEST

## 本次改動

- 在既有 `/account` 站主後台加入「背景音樂管理」入口，只對 `user.isOwner` 顯示，不建立第二個管理站。
- 站主可直接上傳常見音訊檔；原始檔不作為正式播放來源，而是在瀏覽器本地以固定 FFmpeg/WASM 轉碼流程正規化。
- 正式主格式固定為 AAC-LC `.m4a`：128 kbps、48 kHz、雙聲道、`+faststart`，優先供 iPhone Safari／Safari／主流瀏覽器播放。
- 同次轉碼額外建立 MP3 128 kbps、48 kHz、雙聲道備援；前台 `<audio>` 先嘗試 `audio/mp4` AAC-LC，再回退 `audio/mpeg`。
- 兩個轉碼檔直接寫入既有 `zhaowu-audio` Supabase Storage。日後站主換歌只更新 Supabase 曲目資料，不需要 push GitHub，也不需要觸發 Vercel build/deployment。
- 新曲目只有在 AAC、MP3 與 metadata 都成功後才透過 `activate_background_music` RPC 原子切換成唯一 active 曲目；部分失敗會清理已上傳檔案，不會先停掉目前正常音樂。
- 新增 `background_music_assets` 資料表與 owner-only CRUD RLS；匿名／一般登入使用者只能讀 `enabled=true` 的目前曲目。
- `zhaowu-audio` 新增 owner-only upload/update/delete Storage policies；bucket 繼續公開交付正式音源，允許 `audio/mp4`／M4A 與 `audio/mpeg`。
- r52 已驗證的《淨佛聖願》已登記為目前 active 曲目；若動態設定讀取暫時失敗，前台仍以 r52 已驗證 AAC URL 作硬回退。
- 保留既有 iPhone Safari `touchstart`／`pointerdown`／`touchend`／`keydown` 播放解鎖與手機端可見「播放音樂」控制。

## 為什麼改

r52 解決了單一《淨佛聖願》音源本身的 Safari 相容性，但站主之後若要換背景音樂仍需人工處理格式、搬檔並修改網站來源。這不利於日常內容管理，也會為純內容換歌產生不必要的 GitHub／Vercel deployment。

r53 把「音樂內容」從程式碼部署中分離：站主只需在原 OWNER CONSOLE 上傳檔案，瀏覽器把來源正規化為高相容性的 AAC-LC 主檔並保留 MP3 備援，Supabase 負責永久存放與目前曲目狀態。這同時降低 Safari 格式風險與日後 Vercel 額度消耗。

## 影響範圍

- `src/lib/background-music-assets.ts`
- `src/components/owner-background-music-manager.tsx`
- `src/components/background-music.tsx`
- `scripts/background-music.test.mjs`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- `docs/change-reports/ZW-WEB-2026.09.05-r53.md`
- Supabase `public.background_music_assets`
- Supabase RPC `public.activate_background_music(uuid)`
- Supabase Storage bucket `zhaowu-audio` 的 owner 寫入政策與 MIME allowlist

## 保護範圍

未修改：八字／紫微／七政／一掌經與其他命理計算、報告生成、付費報告流程、登入 provider、付款、報告歷史、Loading gate、首頁內容結構、其他路由、三語核心系統。既有 `/account` 權限判定仍使用原本 `useCurrentUserState()`／`user.isOwner`；本次只在既有站主權限內新增音樂管理能力。

## 資料與安全邊界

- `background_music_assets` 啟用 RLS；owner 可讀寫，public 只可讀目前 active 曲目。
- `zhaowu-audio` 新寫入政策只允許 `private.zhaowu_is_owner()` 的 authenticated 使用者。
- partial unique index 保證最多一首 `enabled=true`。
- 切歌 RPC 先驗證 owner 與目標曲目，並在同一資料庫 transaction 中停用舊曲、啟用新曲。
- 目前 active 曲目不可直接刪除，避免前台突然失去正式音源。
- 原始上傳檔不長期保存；只保存正規化後的播放檔。

## 回滾

若 r53 前端管理介面出現未知回歸，可回滾本次網站 commit；前台仍能使用 r52 已驗證《淨佛聖願》硬回退 URL。Supabase 新表與政策可暫時保留為未使用資料結構，不影響舊播放路徑。

若需要完整資料層回滾，應先確認沒有新增曲目依賴，再移除 `activate_background_music`、`background_music_assets` 與本次新增的 `zhaowu_audio_owner_*` policies；不得刪除既有 `zhaowu-audio/background/jingfo-shengyuan-aac.m4a`。

## 驗證狀態

- Supabase schema / RLS：PASS。`background_music_assets`、owner CRUD、public active-only read 與 atomic activation RPC 已建立；目前只有《淨佛聖願》為 active。
- 現有正式音源：PASS。仍指向 r52 已驗證 `background/jingfo-shengyuan-aac.m4a`，5,703,917 bytes、AAC-LC 48 kHz stereo。
- GitHub deterministic regression：PASS（功能分支 CI）。
- TypeScript：PASS（功能分支 CI）。
- Vite Production build：PASS（功能分支 CI）。
- Automated iPhone Safari regression：PASS（功能分支 CI）。
- Vercel Preview：PASS / READY（功能分支最新可部署 commit）。
- 真實站主新檔「選檔 → 本機轉碼 → 雙格式上傳 → 自動啟用」：NOT PHYSICALLY VERIFIED。自動化可驗證程式、資料契約與瀏覽器建置，但沒有代替站主登入實際選取一首新的本機音訊；上線後需以站主帳號做一次實際上傳確認。
- Production exact SHA 與 `/`、`/login`、`/account`：待本 r53 release-ledger commit CI 通過、合併並部署後驗證。
