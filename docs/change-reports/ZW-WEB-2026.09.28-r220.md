# 昭梧更新報告｜ZW-WEB-2026.09.28-r220

## 本次改動

- `src/daily-almanac-r69.css`：在 `.zhaowu-home-layout .zhaowu-today-guide__wardrobe [data-daily-colors-choices] button` 區塊後，新增：
  - `... button strong, ... button small { color:#f4ecda !important; }` — 強制把按鈕內顏色名稱（`strong`）與「想…／五行」副標（`small`）改回卡片使用的米白墨色。
  - `... button small { opacity:.78; }` — 副標保留透明度區分主副層級，不動主標。
- `src/lib/site-stats.ts`：`SITE_RELEASE_FALLBACK` 由 r219／219 提升為 r220／220，更新 `latestSummary` 與 `details.zh-Hant`／`details.en`。
- `lib/zhaowu-verification.js`：`ZHAOWU_RELEASE` 同步為 `ZW-WEB-2026.09.28-r220`。

## 為什麼改

站主回報首頁「今日指引」卡片裡「今日穿衣」五個顏色選項（青雲／絳華／坤寧／鎏金／涵虛）按鈕，文字幾乎看不清楚。

排查發現：`daily-almanac-r69.css` 把這五個按鈕的底色改為近黑的深墨綠 `rgba(14,54,45,.74)`（第 159 行），但按鈕內的 `strong`（顏色名稱）與 `small`（想達成的狀態／五行）文字並未在這條規則裡一併指定顏色，於是沿用 `zhaowu-design-system.css` 針對「淺色 embed 版本」設定的近黑色 `#34352f`／`#746d63`（第 5288–5289 行，那份樣式是給淺米白底色的獨立頁面版本用的）。深色文字疊在近黑深綠底上，對比度嚴重不足，等同看不見。

修正方式是在同一張深綠卡片專屬的樣式規則（`.zhaowu-home-layout .zhaowu-today-guide__wardrobe` 範圍內）明確把這兩層文字強制改回卡片本身的米白墨色 `#f4ecda`，與按鈕外層文字色一致；副標維持較低不透明度做層級區分，不影響其他頁面（獨立 `/daily-colors` 頁面、embed 但非今日卡片場景）既有的淺底深字樣式。

## 影響範圍

- 僅影響首頁「今日指引」卡片內「今日穿衣」分頁的五個顏色選項按鈕文字顏色，其餘背景、邊框、排版、點擊行為、五行判斷邏輯不變。
- 不影響 `/daily-colors` 獨立頁面或其他 `[data-daily-colors]` 變體（`page`／`home` 非今日卡片場景），那些場景本來就是淺底配深字，本次新增規則的選擇器只鎖定 `.zhaowu-today-guide__wardrobe` 範圍。
- 夜間／日間模式：卡片本身固定為深墨綠底色（非隨主題切換），本次文字色同樣固定不隨主題變化，與原本按鈕外層文字色（`color:#f4ecda !important`，第 159 行既有規則）行為一致。

## 受保護範圍

- 不改命盤計算、報告生成、auth／payment、Supabase 資料結構、路由架構。
- 不改按鈕背景、邊框、選取狀態樣式，只新增文字顏色規則。
- 不新增檔案、不建新元件、不改變 DOM 結構（僅 CSS 屬性值調整）。

## 驗證狀態

- CSS 語法：新增規則為標準宣告，無新增大括號配對錯誤。
- 本地建置環境對外部 npm registry 存取受限（既有環境限制，與本次改動無關），實際 `npm run build` / `tsc --noEmit` / 測試改由 GitHub Actions `Production CI` 在合併前於乾淨 runner 上驗證。
- 合併前：Deploy gate、Engine suite、iPhone Safari 三項 CI job 須全綠。
- 合併後：需核對 Vercel Production `githubCommitSha` 對齊最新 main，並在正式站首頁「今日指引」卡片的「今日穿衣」分頁，肉眼核對五個顏色選項文字（含未選取與已選取狀態）在深綠底上清晰可讀。

## 回滾

`git revert` 本次 commit 即可完整還原（純樣式新增規則，無資料庫或結構性變更，無需額外回滾步驟）。
