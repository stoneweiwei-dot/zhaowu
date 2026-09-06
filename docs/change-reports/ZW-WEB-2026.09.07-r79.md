# 昭梧更新報告｜ZW-WEB-2026.09.07-r79

日期：2026-09-07 AEST

## 本次改動

- 首頁下方各命理體系不再只顯示摘要／假入口卡。點開分區後直接在原分區內展示該體系的實際分析內容與各段報告，不再要求使用者跳去另一個看不到結果的頁面。
- 「前世今生／一掌古法」頁移除重複堆疊的專門系統頁，只保留一套主流程；共享出生資料會直接送入 D60 旁證層。
- 一掌古法的順逆選擇改為有實際反應：共享生辰已完整時，進頁或切換順逆會自動觸發既有報告生成流程；D60 同步取得出生年月日、分鐘與出生地，不再因 sibling effect 先後順序而完全沒有結果。
- 手機站主背景音樂上傳移除瀏覽器端 FFmpeg 依賴。MP3、M4A/AAC、WAV、FLAC 在 15 MB 內直接上傳並啟用，不再卡在「切換備援轉碼來源 7%」。
- 左下角背景音樂控制改成右下角小圓形控制，避免遮住表單與測驗內容。
- 五行香氣測驗移除巨型白色圓角卡，手機改為較緊湊的雙欄選項，維持宋系宣紙頁面的一致閱讀節奏。

## 為什麼改

站主手機實測顯示目前 r78 有四個明顯的可用性回歸：下方體系看似能進報告但實際只顯示摘要；D60 在一掌古法流程中沒有任何反應；背景音樂上傳仍會卡在遠端轉碼核心；香氣測驗與浮動音樂按鈕遮擋／破壞手機版面。r79 將這些視為同一批可見 P0/P1 回歸一次收口，避免再用多次 Production build 分散修補。

## 影響範圍

- `src/components/visible-regression-fixes-r79.tsx`
- `src/components/yizhangjing-runtime-r79.tsx`
- `src/routes/__root.tsx`
- `src/routes/yizhangjing.tsx`
- `src/lib/background-music-upload.ts`
- `scripts/owner-r70.test.mjs`
- `scripts/r79-visible-regressions.test.mjs`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`

保護範圍：不修改四柱八字核心排盤、真太陽時、月令邊界、紫微／七政／D60 的既有計算公式、登入權限、付款流程、Supabase schema 或既有正式音樂檔。

## 驗證要求

- `npm run test:engine` PASS。
- `npm run check` PASS。
- `npm run build` PASS。
- iPhone Safari：首頁命理分區可點開並在原地看到完整段落；香氣選項為緊湊雙欄；音樂按鈕不遮擋內容。
- `/yizhangjing`：不再出現重複頁頭／重複大區塊；共享生辰存在時，選擇順逆會觸發報告，D60 能顯示 loading／ready／error 的明確狀態而不是無反應。
- Owner 音樂：MP3、M4A/AAC、WAV、FLAC 直接上傳；不得再載入 FFmpeg、不得停在 3%／7%。
- 只在 main 合併後觸發一次 Production build；Production `githubCommitSha` 必須等於 main HEAD 後，才寫入 `release_history`。

## 回滾

如 r79 出現白屏、首頁分區無法展開、D60 造成循環提交或音訊上傳回歸，可回滾 r79 的兩個 runtime 元件、音訊上傳模組與 release 標記；Supabase 資料與既有音訊／圖庫資產保持不動。
