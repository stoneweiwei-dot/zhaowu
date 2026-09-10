# 昭梧更新報告｜ZW-WEB-2026.09.10-r102

## 本次改動
- 把「每日穿衣｜五行色彩」從首頁內嵌區塊提升為生活指南模組：首頁保留精簡今日卡，完整頁走 `/daily-colors`。
- 五種狀態集中在 `src/lib/daily-colors.ts`，完整支援繁中、簡中、英文。
- 「今日適合」只輕量參考黃曆日干五行；使用者可自行改選。
- iPhone Safari 宣紙測試為 `/yizhangjing` 預置有效生辰；保存測試改為點擊真實保存按鈕。
- `vercel.json` ignoreCommand 對非 main 略過 Preview。

## 為什麼改
- 站主要求這組五行穿衣指南成為可進獨立頁的生活模組。
- PR #278 的 Safari 失敗需要在最新 main 上收口。

## 影響範圍
- 新增 daily-colors 資料、組件、路由。
- Safari 測試、Vercel ignoreCommand、release ledger。
- 不修改八字引擎、auth、payment、Supabase schema。

## 回滾
- 還原本 commit 即可。無資料庫 migration。

## 驗證
- npm run build、Engine suite、iPhone Safari 須通過後才合併 main。
- Production READY 且 SHA 一致後才算上線。
