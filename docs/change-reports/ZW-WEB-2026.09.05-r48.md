# 昭梧更新報告｜ZW-WEB-2026.09.05-r48

## 本次改動

- 全站加入 Stone 指定的《淨佛聖願》作為背景音樂。
- 正式音源存放於昭梧 Supabase Storage 的 `zhaowu-audio/background/jingfo-shengyuan.m4a`，不依賴會過期的臨時 Suno CDN 網址。
- 背景音樂預設 18% 音量、循環播放，並提供左下角不遮擋主要操作的播放／暫停鍵。
- 瀏覽器允許時會直接嘗試播放；iPhone Safari 若依平台規則阻擋有聲自動播放，使用者第一次正常點擊／觸控／鍵盤互動時再啟動。
- 使用者手動關閉音樂後，以 localStorage 記住偏好，後續頁面不會強行重新開啟。

## 為什麼改

依站主最新指令，昭梧需要把指定音樂納入網站整體體驗。音檔本身不應依賴短期 CDN，也不能因 Safari 的有聲 autoplay 限制導致首頁或登入流程被阻塞，因此音樂採獨立、可失敗降級的全站播放器。

## 影響範圍

- 全站瀏覽器客戶端音訊播放。
- `/`、`/login`、`/account` 與其他由同一 React root 掛載的頁面。
- Supabase Storage 新增公開音訊 bucket `zhaowu-audio` 與指定背景音樂物件。
- 公開版本資訊更新為 r48／累計更新 48。

## 保護範圍

未修改：八字／命理計算、報告生成與九頁契約、登入／權限、付款、使用者資料、歷史報告、方法路由、Loading gate、雙蓮動畫、首頁 r47 美術 CSS 與既有吉祥圖邏輯。播放器失敗不影響任何核心流程。

## 驗證狀態

- 音源 Storage 物件：已確認建立，8,358,208 bytes，`audio/mp4`。
- 一次性匯入 Edge Function：匯入完成後已停用，並恢復 JWT 驗證。
- 首輪 CI 的 419 個 deterministic tests、TypeScript 與 production build 均通過；兩條既有 iPhone Safari regression 與目前 r47 契約不一致，已只修正測試：紙張透明度依正式 `--r47-paper` 的 `.78` 驗證；Supabase 寫入失敗時不再錯誤要求顯示「更新已保存報告」。正式首頁樣式與報告保存邏輯均未因此修改。
- GitHub CI／build：本版本合併前必須全部通過。
- Vercel Production：本版本合併後必須核對 exact commit SHA 與 `READY`。
- iPhone Safari：自動化可驗證 DOM／控制與頁面不阻塞；有聲 autoplay 仍受 Safari 平台政策約束，無實機證據時不得宣稱實機聽音已驗證。

## 回滾

移除 `src/main.tsx` 的 `BackgroundMusic` 掛載與 `src/components/background-music.tsx`，將 `src/lib/site-stats.ts`、release-ledger test 和 Supabase `release_history` 回復到上一個已驗證版本。Storage 音檔可保留作為靜態資產，不影響任何核心資料或流程。
