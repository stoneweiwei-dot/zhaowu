# 昭梧更新報告｜ZW-WEB-2026.09.06-r62

日期：2026-09-06 AEST

## 本次改動

- 命之書「總覽」卡不再使用全站通用 `/wallpaper-song.jpg` 作淡背景。
- 新增專屬四時山水宣紙背景 `report-visuals/r62/overview-bg.webp`，由春、夏、秋、冬既有正式月令母圖重新構成。
- 新背景存放於 Supabase Storage，前端只在命之書總覽層以低透明度疊加，不影響文字可讀性。
- 保留日主、月令、五行、運之書既有正式母圖與 fallback。

## 為什麼改

站主要求美工系統按未完成項逐一收口，所有實際用作背景的圖都要補齊。r61 已完成運之書五行母圖；本次接著收口 REPORT-00 命之書總覽仍使用通用 wallpaper 的最後一個固定背景缺口。

## 影響範圍

- `src/report-overview-art-r62.css`
- `src/main.tsx`
- `src/lib/site-stats.ts`
- `scripts/report-overview-art.test.mjs`
- `scripts/release-ledger.test.mjs`
- Supabase Storage `zhaowu-gallery/report-visuals/r62/overview-bg.webp`

保護範圍：不修改八字計算、月令邊界、格局病藥、喜用判定、大運流年、報告正文、登入、付款、Supabase schema、用戶資料或路由。

## 回滾

移除 `report-overview-art-r62.css` import 即回到原本 `report-visual-book.css` 的 `/wallpaper-song.jpg` fallback；Supabase 圖可保留作資產歷史。

## 驗證要求

- tests / TypeScript / Vite build PASS。
- Vercel Production `githubCommitSha` 等於 main HEAD。
- Production `/` PASS。
- `overview-bg.webp` 公開 CDN 回應 200 `image/webp`。
- 真實 iPhone 報告頁的最終視覺仍由站主實機查看確認。
