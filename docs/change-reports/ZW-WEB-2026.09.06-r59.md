# 昭梧更新報告｜ZW-WEB-2026.09.06-r59

日期：2026-09-06–07 AEST

## 本次改動

### 1. 站主背景音樂上傳

- 修復站主在 iPhone 後台上傳背景音樂時停在 3% 的流程。舊流程在 3% 開始載入 FFmpeg/WASM，之後還要連續輸出 AAC-LC 與 MP3，手機端負擔過重。
- 新流程改成手機優先：MP3 原檔直接上傳；標準 AAC/M4A 先檢查實際 MP4/AAC 標記，確認可直接播放時同樣略過轉碼；WAV、FLAC、OGG、OPUS 等只有在真正需要時才做一次標準 MP3 轉碼（128 kbps、48 kHz、stereo）。
- FFmpeg 載入加入雙來源與 28 秒載入／啟動逾時；若轉碼核心無法啟動，明確失敗返回，不再讓頁面無限停留在 3%。
- Supabase Storage 上傳使用 XMLHttpRequest 真實 upload progress，並加入 120 秒傳輸逾時。
- 新曲目只有在檔案與 metadata 都成功後才呼叫既有 `activate_background_music`；若啟用失敗，新物件與 metadata 都回滾。
- 前台播放器按目前曲目的真實 MIME type 建立 `<source>`，既有已驗證 AAC 與新 MP3 可並存；r52《淨佛聖願》AAC fallback 不變。

### 2. 站主後台與總圖庫

- `/account` 新增站主管理分組，把背景音樂、首頁背景、總圖庫、客戶報告整理為四個清楚入口。
- 首頁背景與客戶報告預設收合，只展開正在管理的一組。
- 修正第一輪 iPhone Safari 測試發現的 portal 錨點問題：管理卡只掛到真正的 `OWNER CONSOLE` 區，不再誤掛到暫時隱藏的 loading section。
- `/gallery` 總圖庫預設收合；展開後先呈現 18 張，再以「載入更多」分批顯示，不再一進頁面就把全部圖片整片鋪開。

### 3. 正式 Logo

- 移除 r59 分支原本退回的紅色文字方印 placeholder。
- Header 改用 Stone 2026-09-07 親自提供的白底、亮金、翡翠綠昭梧蓮形 Logo，製作 256px WebP 網站衍生檔並直接內嵌，避免再次被舊黑／暗金資產或快取替換。
- Header 小 Logo 維持清楚可辨的 56–64px 顯示，不加黑色 filter、不套深色底。

### 4. 首頁「今日干支／日曆」重做

- 拿掉只顯示單一日柱的臨時算法，不再用自建 reference anchor 猜日干支。
- 直接復用昭梧既有 canonical BaZi calendar：`yearMonthPillars`、`dayGanzhi`、`hourPillar`。
- 首頁現在明確顯示當下四個欄位：**年柱／月柱／日柱／時柱**，並同時顯示本地日期、時間與目前節令。
- 畫面每 30 秒刷新時間狀態，因此跨時辰後時柱會跟著更新。
- 美術重新收口為亮宣紙、細金線、翡翠綠點綴；主標、年月日時干支與主要中文字改用宋體家族，移除原先像一般 App 卡片的粗黑無襯線觀感。
- 新樣式 `daily-almanac-r59.css` 最後載入，避免再被早期首頁 CSS 蓋回舊字體。

### 5. 「直接問事」答案修正

- 找到實際問題：結果頁先前沒有直接展示引擎已計算好的 `reading.directAnswer`，而是再次呼叫 `buildFreeDirectAnswer`，把很多具體問題改寫成固定的「工作／感情／財務」通用模板，因此會出現看似有文字、實際沒有回答使用者原問題的情況。
- 結果頁現在直接交付經回答契約與 hotfix 已處理過的 `reading.directAnswer`，再做 customer copy 清理；不再用第二層通用 topic template 覆蓋真正答案。
- 時間、旅行、選擇、工作、感情、財務、健康、家宅等原本已經算出的具體回答因此可以真正到達前台。
- 新增回歸測試，鎖定結果頁必須使用 `customerDirectAnswer(question, reading.directAnswer)`，禁止再次接回 `buildFreeDirectAnswer`。

## 為什麼改

Stone 的真機截圖直接證明三個 Production 體驗問題仍未達標：Header Logo 色調錯誤；首頁日曆字體與排版不符合昭梧美術且缺少年／月／日／時干支；直接問事的實際答案被後置通用模板覆蓋。這些不是單純美術微調，而是品牌識別、核心資訊與核心回答鏈路都沒有按已批准契約交付，因此 r59 在合併前一起收口，不額外製造第二次 Production 部署。

## 影響範圍

- `src/lib/background-music-upload.ts`
- `src/components/owner-background-music-manager.tsx`
- `src/components/background-music.tsx`
- `src/components/owner-console-organizer.tsx`
- `src/components/owner-gallery-manager.tsx`
- `src/components/brand-seal.tsx`
- `src/components/daily-almanac-widget.tsx`
- `src/components/result-view.tsx`
- `src/daily-almanac-r59.css`
- `src/main.tsx`
- `src/routes/__root.tsx`
- `scripts/background-music.test.mjs`
- `scripts/owner-directed-r59.test.mjs`
- `scripts/release-ledger.test.mjs`
- `e2e/owner-console.iphone-safari.spec.ts`
- `src/lib/site-stats.ts`
- `docs/change-reports/ZW-WEB-2026.09.06-r59.md`

保護範圍：不修改 owner 身分、RLS、Supabase schema、登入、付款、報告排盤算法、既有使用者資料、r58 報告母圖或 r52 已驗證 AAC fallback。

## 驗證要求

- `npm run test:engine` 必須 PASS。
- TypeScript `npm run check` 必須 PASS。
- Production Vite build 必須 PASS。
- iPhone Safari regression 必須 PASS，包含 owner `/account` 收合分組與 `/gallery` 預設收合檢查。
- 新增 owner-directed regression 必須鎖定：白亮金綠 Logo、canonical 年月日時干支、宋體日曆視覺層、question-specific direct answer。
- 合併前重新確認 `main` 沒有並行衝突。
- 合併後 Production `githubCommitSha` 必須等於 `main` HEAD。
- Production `/`、`/login`、`/account`、`/gallery` 必須可讀。
- Physical owner-device upload 與最終視覺只有 Stone 真機實際重試後才能標記通過；自動 Safari 不得冒充真機視覺／音訊驗證。

## 回滾

若 r59 在 Production 出現回歸，只回退本次對應 UI／upload／result delivery files；不得回滾 r58 報告母圖、r52 已驗證 AAC 資產、Supabase 資料、排盤引擎或其他無關功能。
