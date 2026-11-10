# 昭梧更新報告｜ZW-WEB-2026.11.11-r228

## 本次改動

- `src/routes/sky-events.tsx`：保留上方 `<SkyUniverse>` 太陽系互動示意圖，移除下方重複的 `<SkyCurrentMotion>` 區塊，並刪除不再使用的 `src/components/sky-current-motion.tsx` 與 `src/sky-current-motion.css`。
- `src/lib/site-stats.ts`、`src/components/site-shell.tsx`：新增 `LEGACY_VISITS_BASE` 歷史基數常數與 `formatCumulativeVisits` 多語格式化函式；頁尾 `.zhaowu-site-views` 固定顯示「歷史基數＋新資料庫累計」的總人次，即使新庫計數為 0 或網路讀取失敗也不再隱藏。
- `src/lib/public-changelog.ts`、`src/lib/site-stats.ts`、`lib/zhaowu-verification.js`：補齊 11 月初以來已上線之正式改動紀錄，並將 `SITE_RELEASE_FALLBACK` 與 `ZHAOWU_RELEASE` 更新為 `ZW-WEB-2026.11.11-r228`（序號 228）。

## 為什麼改

- `/sky-events` 同時存在上方太陽系互動示意圖與下方黃道運行轉盤，視覺與功能重疊；保留上方 `SkyUniverse` 即可清晰呈現示意與圖例。
- 頁尾瀏覽人次原先以 `stats.totalVisits > 0` 包裹，資料庫切換後因新庫尚無計數而整行消失；改為以歷史累計基數加上新庫計數常駐顯示，避免頁尾統計消失或顯示誤導性的 0。
- `/updates` 與 `SITE_RELEASE_FALLBACK` 停留在 10 月下旬至 11 月初，需補齊近期已合併的主分支正式功能紀錄與本次改動說明。

## 影響範圍

- `/sky-events` 頁面移除下方 `.sky-current-motion` 區塊，保留上方 `.sky-universe-section` 及既有解讀、時間軸、天文數據與悉尼觀測紀錄。
- 全站公開頁尾 `.zhaowu-site-views` 常駐顯示累計到訪人次（繁中、簡中、英文等自然格式）。
- `/updates` 頁面顯示最新編號版本 `ZW-WEB-2026.11.11-r228` 與近期公開更新清單。

## 受保護範圍

- 不改八字、紫微或任何命盤計算引擎（排盤）。
- 不改登入／認證程式碼、付款流程、Vercel 設定或資料庫結構（未執行任何 SQL）。

## 驗證狀態

- 單元測試：`scripts/site-views-footer.test.mjs`、`scripts/latest-update-page.test.mjs`、`scripts/release-ledger.release.mjs`、`scripts/r162-production-closeout.test.mjs`、`scripts/public-changelog.test.mjs`。
- E2E 測試：`e2e/home-direct.spec.ts`、`e2e/hemisphere.spec.ts`、`e2e/sky-observation-brief.spec.ts`。
- 建置檢查：`npm run build`（含 `tsc --noEmit`）。

## 回滾

回退本分支對應 commit 即可還原 `/sky-events`、頁尾計數顯示與 `/updates` 更新紀錄；本次無資料庫 migration，無需資料庫回滾。
