# 昭梧更新報告｜ZW-WEB-2026.09.25-r204

## 本次改動

- 登入動畫由「每個瀏覽 session／登出後可重播」改為同一裝置每個本地日曆日最多播放一次。
- 登入動畫新增明確「跳過 / Skip」按鈕；播放結束或跳過後顯示靜態封面。
- 青玉小龍完整播放器的循環／隨機鍵補上清楚 active 視覺與模式文字。
- 隨機模式在歌單尚未載入時會立即準備歌單；播放器模式鍵不再觸發 Safari 的全域 user-gesture 自動播放解鎖。
- r203 PWA 自癒在強制導航前重新核對 WindowClient URL；若使用者已切換 route，就取消舊路徑導航，避免舊頁面與新頁面互搶。

## 為什麼改

站主回報登入動畫仍會因 session／重新登入反覆播放，與「每天登入只播一次」的實際需求不符；同時播放器最右兩個循環／隨機鍵按下後缺乏可辨識回饋，且未載入歌單時看起來像沒有作用。

## 影響範圍

- `/login` 登入動畫的本機播放頻率、Skip 互動與靜態封面 fallback。
- 青玉小龍內嵌背景音樂播放器的循環／隨機模式互動與可見狀態。
- 公開 release metadata／更新頁。

## 受保護範圍

- 不改站主 Cookie、登入 API、會員 Auth、Supabase schema／Storage。
- 不改 owner music API、音樂檔案或後台曲目資料。
- 不改命理計算、報告、付款或 PWA identity；Service Worker 僅收斂導航前 URL 防競態，不改 release handshake 的自癒目的。

## 驗證狀態

- 合併前：Deploy gate、Engine suite、iPhone Safari 必須全綠。
- 登入契約：同一本地日期第一次為 true，標記後同日為 false，隔日恢復 true；登出不得 reset。
- 音樂契約：循環／隨機保留 localStorage 偏好、active/pressed 狀態與可見 mode status；模式控制區阻止 Safari 全域播放解鎖誤觸。
- 合併後：Vercel Production githubCommitSha 必須等於最新 main，並驗證 `/login` 與首頁青玉小龍播放器。

## 回滾

回滾 r204 只恢復 r203 的登入動畫 session 行為與舊播放器模式呈現；沒有資料 migration 或破壞性資料變更。
