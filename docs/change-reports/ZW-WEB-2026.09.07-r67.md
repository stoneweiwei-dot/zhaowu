# 昭梧更新報告｜ZW-WEB-2026.09.07-r67

日期：2026-09-07 AEST

## 本次改動

- 裝置本機的七政／紫微／一掌經／趣味測驗紀錄，超過七天沒有再打開就自動刪除，不必再問站主。
- 本機暫存的生成圖、影音快取鍵（`zhaowu.generated.*`、`zhaowu.media-cache.*` 等）同樣以七天未再開啟為準清掉。
- 每次進入網站時自動執行這次整理，讓本機資料不會一直堆到變卡。
- 點開「我的紀錄」裡任何一筆，會更新最後打開時間，七天內有回去看的不會被刪。

## 為什麼改

站主要求每天整合一次雜亂資料、把生成過卻不再打開的聊天／檔案清掉，包含圖、視頻、音樂。本機紀錄與暫存是唯一能安全自動刪、又不碰雲端付費報告與站主圖庫的範圍。

## 影響範圍

- `src/lib/specialist-history.ts`
- `src/lib/local-housekeeping.ts`
- `src/routes/history.tsx`
- `src/components/site-shell.tsx`
- `public/sw.js`
- 公開版本資訊與 release ledger

保護範圍：不修改八字計算、月令邊界、喜忌判定、大運、報告正文、登入、付款、Supabase schema、Production 路由、站主圖庫與背景音樂正式檔、雲端「我的昭梧」付費報告。

## 回滾

回退本次 commit 即可關閉七天自動清理。無資料庫 migration。

## 驗證要求

- deploy-gate / build 必須 PASS。
- 本機七天未打開的專題紀錄必須被清掉；七天內有打開的必須保留。
- Vercel Production `githubCommitSha` 必須等於合併後 main HEAD。
