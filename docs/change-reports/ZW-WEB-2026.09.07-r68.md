# 昭梧更新報告｜ZW-WEB-2026.09.07-r68

日期：2026-09-07 AEST

## 本次改動

- P0-1：報告母圖（十天干、十二月令、運之書、命之書總覽、分享卡預覽）改為可點開的獨立縮圖 + 全螢幕燈箱。燈箱維持原比例、支援捏合縮放／拖移、X／背景／下拉關閉、多圖左右滑動；單圖不顯示箭頭。大圖點擊後才載入；大圖失敗時保留縮圖與「圖片暫時無法載入」，文字報告不中斷。
- P0-2：首頁「同一份生辰，其他六種看法」六張卡片恢復可進入。沿用 `SharedBirthRecord`，不重填整份生辰。點擊後才生成該體系內容。時辰不足時仍可進入，只限制時間敏感層（D60 警告、不寫假紫微盤、上升／宮位與七政天象層暫不判定）。D60 不再關掉整張印度卡。
- P0-3：iPhone「加入主畫面」／favicon／manifest 改用站主米色方蓮。主動 HTML／manifest 指向 `apple-touch-icon-v3.png` 與 `android-chrome-192/512`（`any maskable`）。舊金線蓮花不再作為現行 HTML／manifest 圖標。

## 為什麼改

正式站報告美工先前是不可點的裁切 sprite；六體系入口被收成說明頁且卡片不可點；主畫面圖標仍是舊金線蓮。本次只修這三件事，讓母圖可看、入口可進、主畫面標正確。

## 影響範圍

- 報告母圖燈箱：`src/components/image-viewer.tsx`、`src/components/report-sprite-artwork.tsx`、`src/components/report-visual-book.tsx`、`src/components/report-luck-book.tsx`、`src/components/report-share-card.tsx`、`src/lib/report/report-visual-assets.ts`、`public/report-visuals/`
- 六體系入口：`src/routes/index.tsx`、`src/routes/indian-astrology.tsx`、`src/routes/astrology.tsx`、`src/routes/ziwei.tsx`、`src/routes/qizheng.tsx`、`src/routes/yizhangjing.tsx`、`src/components/specialist-system-page.tsx`、`src/lib/specialist-reading.ts`、`src/components/d60-karma-section.tsx`、`src/components/palm-standalone.tsx`
- 主畫面圖標：`scripts/write-home-icons.mjs`、`index.html`、`public/manifest.webmanifest`、`scripts/home-icons/`
- 公開版本資訊與 release ledger

保護範圍：不修改八字計算、月令邊界、喜忌判定、格局、大運、四柱、登入、付款、Supabase schema、Production 路由、`BrandSeal` 頂欄正標、達摩一掌經算法本體。不覆蓋 r67 本機七天清理。

## 回滾

回退本次 commit。報告母圖回到不可點的 sprite 裁切；六體系入口回到先前說明頁；主畫面圖標回到舊路徑。無資料庫 migration。

## 驗證要求

- deploy-gate / TypeScript / Vite build 必須 PASS。
- 正式站付費報告母圖可點開燈箱；圖片失敗時文字報告仍在。
- 首頁六張卡片可進入，共用同一份生辰，不自動跑六份貴價報告。
- 時辰不足時印度卡仍可進，D60 只警告不編造。
- `/apple-touch-icon-v3.png` HTTP 200，主動 HTML／manifest 不再指向舊金線蓮。
- Vercel Production `githubCommitSha` 必須等於合併後 main HEAD。
