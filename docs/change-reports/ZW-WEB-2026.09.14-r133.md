# 昭梧更新報告｜ZW-WEB-2026.09.14-r133

## 本次改動

- 「昭梧 · 觀世錄」新增長文《十神看你最容易嫌棄誰？從「不順眼」看見命局裡的關係模式》。
- 將十神關係漫畫直接放進文章正文，文章與圖片由同一個觀世錄文章資料源管理；首頁最新文章與 `/knowledge` 全部文章會沿用既有排序自動呈現。
- 文章把網路式「某星一旺就一定討厭某人」降級為快速取象，正式判斷仍回到完整四柱、關係十神、病藥、制化、歲運與現實事件交叉校驗。
- 圖片沿用既有壓縮 AVIF 資產資料，不新增 Supabase Storage 依賴；圖片只是文章增強，不阻塞文字閱讀。
- PWA shell cache 版本同步升到 `zhaowu-shell-r133`。

## 為什麼改

站主要求把已完成的十神關係文章與圖片正式加入「觀世錄」，而不是只做一個孤立文章頁或留在未發布 commit。現有觀世錄已有統一文章 registry 與插圖欄位，因此本次直接接入該資料源，避免文章庫、首頁與圖片各自維護。

## 影響範圍

- `src/lib/life-view-long-form/ten-gods-relationship-friction.ts`
- `src/lib/life-view-long-form.ts`
- `src/lib/article-media/ten-gods-relationship-comic.*`
- 首頁「昭梧 · 觀世錄」最新文章摘要
- `/knowledge` 觀世錄文章庫
- `src/lib/site-stats.ts`
- `public/sw.js`
- release ledger regression

不修改八字 calculation truth、紫微、D60、西洋占星、登入、付款、Supabase schema、Supabase data 或環境變數。

## 回滾

移除新文章在 `LIFE_VIEW_LONG_FORM_ARTICLES` 的登記與對應文章／圖片模組，並將 release fallback 與 PWA cache 回退至 r132，即可恢復上一版觀世錄內容。
