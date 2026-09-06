# 昭梧更新報告｜ZW-WEB-2026.09.06-r59

日期：2026-09-06 AEST

## 本次改動

- 修復站主在 iPhone 後台上傳背景音樂時停在 3% 的流程。舊流程在 3% 開始載入 FFmpeg/WASM，之後還要連續輸出 AAC-LC 與 MP3，手機端負擔過重。
- 新流程改成手機優先：MP3 原檔直接上傳；標準 AAC/M4A 先檢查 MP4 `ftyp` 與 `mp4a` 標記，確認為網站可直接播放的 AAC/M4A 後也直接上傳，不再啟動手機轉碼；只有 WAV、FLAC、OGG、OPUS 或不確定 codec 的 M4A 等才做一次標準 MP3 轉碼（128 kbps、48 kHz、stereo）。
- FFmpeg 載入加入雙來源與 28 秒載入／啟動逾時；若轉碼核心無法啟動，明確失敗返回，不再讓頁面無限停留在 3%。
- Supabase Storage 上傳改用 XMLHttpRequest 真實 upload progress，並加入 120 秒傳輸逾時。
- 新曲目只有在檔案與 metadata 都成功後才呼叫既有 `activate_background_music`；若啟用失敗，新物件與 metadata 都回滾。
- 前台播放器改按目前曲目的真實 MIME type 建立 `<source>`，因此既有已驗證 AAC/M4A 與新 MP3 可並存；r52 的《淨佛聖願》AAC fallback 不變。
- `/account` 新增站主管理分組，把背景音樂、首頁背景、總圖庫、客戶報告整理為四個清楚入口；首頁背景與客戶報告預設收合，只展開正在管理的一組。管理分組只錨定實際含 `OWNER CONSOLE` 的正式站主卡，不再掛到過渡 loading section。
- `/gallery` 總圖庫改為預設收合的 drawer，不再一進頁面就把所有圖片整片鋪開；每次先呈現 18 張，再以「載入更多」分批顯示。

## 為什麼改

Stone 真機重現音樂上傳停在 3%。原程式的 3% 正好是遠端 FFmpeg/WASM 載入階段，且同一次手機操作還要做 AAC 與 MP3 雙轉碼，容易造成 iPhone Safari 長時間無回應。r59 對 iPhone 最常見的 MP3 與標準 AAC/M4A 直接走免轉碼路徑；只有真的需要轉換的格式才載入 FFmpeg，並加上明確 timeout。後台同時把背景、圖庫與報告大區塊全部攤開，也增加手機頁面的視覺與渲染負擔，因此一併改成收合式資訊架構。

## 影響範圍

- `src/lib/background-music-upload.ts`
- `src/components/owner-background-music-manager.tsx`
- `src/components/background-music.tsx`
- `src/components/owner-console-organizer.tsx`
- `src/components/owner-gallery-manager.tsx`
- `src/routes/__root.tsx`
- `scripts/background-music.test.mjs`
- `scripts/release-ledger.test.mjs`
- `e2e/owner-console.iphone-safari.spec.ts`
- `src/lib/site-stats.ts`
- `docs/change-reports/ZW-WEB-2026.09.06-r59.md`

保護範圍：不修改 owner 身分、RLS、Supabase schema、登入、付款、報告計算／文字契約、首頁命理流程或既有使用者資料。既有背景音樂 activation RPC 與 r52 AAC fallback 保留。

## 驗證要求

- `npm run test:engine` 必須 PASS。
- TypeScript `npm run check` 必須 PASS。
- Production Vite build 必須 PASS。
- iPhone Safari regression 必須 PASS，並包含 owner `/account` 收合分組與 `/gallery` 預設收合檢查。
- 合併前重新確認 `main` 沒有並行衝突。
- 合併後 Production `githubCommitSha` 必須等於 `main` HEAD。
- Production `/`、`/login`、`/account`、`/gallery` 必須可讀。
- Physical owner-device upload 只有 Stone 真機實際重試後才能標記通過；自動 Safari 不得冒充真機音訊轉碼驗證。

## 回滾

若新音樂 upload path、管理分組或 Gallery drawer 在 Production 出現回歸，只回退 r59 對應 UI／upload files，恢復 r58 的 owner console；不得回滾 r58 報告母圖、r52 已驗證 AAC 資產、Supabase 資料、排盤引擎或其他無關功能。