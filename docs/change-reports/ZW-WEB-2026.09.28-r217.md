# 昭梧更新報告｜ZW-WEB-2026.09.28-r217

## 本次改動

- `src/guest-first-r116.css`：首頁七個命理系統分組卡片（`.zhaowu-home-portal[data-specialist-link]`）右上角的識別圖徽，原本用不透明米白色圓盤（`background-color: rgba(255,250,240,.88)`）＋獨立陰影（`box-shadow: 0 3px 12px rgba(50,40,27,.06)`）浮在卡片上；改為圓盤透明化（`background-color: transparent`，`box-shadow: none`），並在 7 條 `[data-specialist-link="…"]::after` 規則各自的 `background-image` 前面疊一層放射狀漸層暈光（`radial-gradient(circle, rgba(255,253,246,.55) 0%, rgba(255,253,246,.20) 56%, rgba(255,253,246,0) 80%)`），暈光中心為卡片同色系暖白調、邊緣完全透明，取代原本的硬邊界貼片。徽章尺寸由 58px 微調為 66px 以撐開暈光的可見範圍，圖徽本身 SVG 線條（松綠 `#1f4e3a`／金 `#c4a05a`／硃紅 `#a64a38`）不變。
- `src/lib/site-stats.ts`：`SITE_RELEASE_FALLBACK` 由 r216／216 提升為 r217／217，更新 `latestSummary` 與 `details.zh-Hant`／`details.en`。
- `lib/zhaowu-verification.js`：`ZHAOWU_RELEASE` 同步為 `ZW-WEB-2026.09.28-r217`。

## 為什麼改

站主直接回報：首頁分組卡片的識別圖徽有「狗皮膏藥的黏貼感」，要求改成最大程度自然融合卡片底色的樣子，前提是仍要清楚好辨識。原本的不透明圓盤＋陰影組合，讓圖徽在視覺上與卡片背景不連續、邊界過硬；改為漸層暈光後圖徽與卡片底色融為一體，同時保留線條本身的對比度以維持辨識度。

## 影響範圍

- 僅影響首頁「命理系統」七張分組卡片右上角的裝飾圖徽視覺，不影響卡片文字、連結、點擊區域、路由或任何命理計算／資料流程。
- 夜間模式：既有 `[data-zw-theme="night"] .zhaowu-home-sheet-shell .zhaowu-home-portal::after { opacity: .42 !important; }` 規則對整個 `::after` 偽元素統一調暗，暈光與圖徽在夜間會一併變暗，行為與改動前一致，未額外修改夜間規則。

## 受保護範圍

- 不改命盤計算、報告生成、auth／payment、Supabase 資料結構、路由架構。
- 不改卡片本身背景、邊框、文字、CTA 按鈕樣式，只動 `::after` 裝飾圖徽層。
- 不新增檔案、不建新元件、不改變 DOM 結構（僅 CSS 屬性值調整）。

## 驗證狀態

- CSS 語法：改動後檔案大括號配對數一致（62/62），diff 範圍僅限目標區塊。
- 本地 `npm ci`／`vite build`／`tsc --noEmit`：本地容器 npm registry 對外部套件持續回傳 403（環境既有限制，與本次改動無關），本地未能安裝依賴執行完整建置；改走 GitHub Actions `Production CI`（`build.yml`）在乾淨 runner 上執行 `npm ci && npm run build` 與 `npm run test:engine` 作為實際 build/test gate。
- 合併前：Deploy gate、Engine suite、iPhone Safari 三項 CI job 須全綠。
- 合併後：需核對 Vercel Production `githubCommitSha` 對齊最新 main，並在正式站首頁核對圖徽視覺已改為柔性暈染而非硬邊圓盤。

## 回滾

`git revert` 本次 commit 即可完整還原（純樣式數值調整，無資料庫或結構性變更，無需額外回滾步驟）。
