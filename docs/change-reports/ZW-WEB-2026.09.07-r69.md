# 昭梧更新報告｜ZW-WEB-2026.09.07-r69

日期：2026-09-07 AEST

## 本次改動

- 首頁「今日干支／日曆」不再使用獨立的簡化日柱算法，改為直接調用昭梧既有正式曆法模組：`yearMonthPillars`、`dayGanzhi`、`hourPillar`。
- 首頁現在同時顯示當下年柱、月柱、日柱、時柱，另列當前節令與本地時間。
- 今日干支卡重做為亮宣紙／細金線／翡翠綠的宋紙風格，主要干支與標題使用宋體系字型，移除原本偏粗黑 App 卡片感。
- 直接問事結果頁不再把已生成的 `reading.directAnswer` 重新丟進通用 `buildFreeDirectAnswer` 模板。結果卡直接交付引擎針對使用者原問題生成的答案，避免工作、感情、財務等泛化文案覆蓋實際問句。
- 保留目前已在 main／Production 的正式綠金昭梧 Logo，不回退舊線稿或舊桌面圖標。

## 為什麼改

Stone 真機截圖顯示兩個明確回歸：首頁日曆沒有年月日時四柱且字體／美工不符合昭梧；直接問事輸出的內容被通用模板覆蓋，導致答非所問。檢查程式後確認，日曆確實只算日柱，而結果頁也確實在最終顯示前再次套用通用免費答案。r69 只修這兩個根因，不重算八字、不改命理主引擎。

## 影響範圍

- `src/components/daily-almanac-widget.tsx`
- `src/daily-almanac-r69.css`
- `src/main.tsx`
- `src/components/result-view.tsx`
- `scripts/daily-almanac-home.test.mjs`
- `scripts/owner-directed-r69.test.mjs`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- `docs/change-reports/ZW-WEB-2026.09.07-r69.md`

保護範圍：不修改出生資料輸入、真太陽時、節氣排盤底層、八字原局計算、紫微／D60／一掌經、登入、權限、付款、Supabase schema、報告歷史或既有使用者資料。

## 驗證要求

- `npm run test:engine` PASS。
- `npm run check` PASS。
- Production build PASS。
- iPhone Safari regression PASS。
- Production `/`、`/login`、`/account` 可讀。
- Production `githubCommitSha` 必須等於合併後 `main` HEAD。
- 首頁程式必須含四柱 DOM，並使用 canonical calendar imports。
- 結果頁不得再引用 `buildFreeDirectAnswer` 作最終顯示答案。
- Logo 保持目前正式綠金 owner mark，不可回退。

## 回滾

若 r69 造成首頁日曆或結果頁回歸，只回退 r69 對 `daily-almanac-widget.tsx`、`daily-almanac-r69.css`、`main.tsx`、`result-view.tsx` 的修改；不得回退 r68 的報告大圖、共享生辰六種看法、正式 Logo／桌面圖標，也不得改動排盤核心、登入、付款或 Supabase 資料。
