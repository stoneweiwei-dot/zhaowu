# ZW-WEB-2026.09.05-r41

日期：2026-09-05 AEST

## What changed
- 重整全站應用層級：建立 v41 mobile-first parchment layout lock。
- `/login` 登入／註冊畫面重新排版：清楚的標題、模式切換、OAuth、Email/Password 表單與主 CTA 層級。
- 首頁分析表單、四門專題入口、趣味測驗與主要紙面統一欄寬、間距、邊線、背景與按鈕語言。
- 移除累積 CSS 造成的過度玻璃擬態與多重浮卡視覺，改為單一編輯式宣紙閱讀結構。
- 保持現有 auth、OAuth、報告、命理計算、payment、Supabase、routing 不變。

## Why
目前網站雖已完成多輪功能修復，但多層舊 CSS 疊加造成首頁與登入頁的視覺層級不清、卡片過多、欄寬過窄。v41 直接建立最後載入的版式鎖，先把產品資訊架構整理清楚，再避免舊視覺實驗重新覆蓋。

## Affected scope
- `src/main.tsx`
- `src/zhaowu-layout-v41.css`
- `src/lib/site-stats.ts`
- 登入頁與首頁的既有 class/style cascade

## Protected scope
- Supabase Auth / OAuth implementation
- Bazi / Ziwei / Qizheng / Yizhangjing calculation logic
- report generation and history
- payment
- routing
- multilingual logic
- database schema and data

## Rollback
Revert the two runtime commits that add/import `src/zhaowu-layout-v41.css`, then restore the previous release fallback if necessary. No data migration is involved.

## Verification state
- GitHub: COMMITTED
- CI/build: NOT RUN in this change turn
- Vercel: pending automatic GitHub → Vercel deployment resolution
- Production visual verification: NOT YET VERIFIED
- Mobile target: 390–430 px rules included

## Important
This release is not reported as production-verified until the matching Vercel deployment is READY and `/`, `/login`, and affected assets are checked in production.
