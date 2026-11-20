# 昭梧更新報告｜ZW-WEB-2026.09.11-r102

## 本次改動
- iPhone Safari 宣紙殼層測試在離線／降級情境下直接攔截 `sw.js`，避免 Service Worker controller 更新造成測試內 `/ziwei` 等頁面的第二次導航競態；正式站 Service Worker 行為不變。
- 在目前最後載入的視覺層鎖定語言選擇器 active 樣式：日間為松綠 `#1f4e3a` 底、淺宣紙 `#fffaf0` 字；夜間保留金色半透明選中態與月白字。修正舊 `!important` 規則覆蓋 React inline active 樣式的問題。
- Release fallback 升級為 r102 / 累計更新 102，並同步 release ledger 測試。

## 為什麼改
- 最新 `main` 的 Production CI 已將先前語言名稱、保存報告等問題收口，但 33 條 iPhone Safari 回歸仍有 2 條失敗：一條是測試內 Service Worker 導航競態；另一條是 active 語言按鈕 computed style 被舊 CSS 覆蓋為深色字，與目前正式視覺契約不一致。
- 本次只處理可重現的兩個殘留問題，不回退六語顯示層，也不修改命理計算、登入、付款或資料層。

## 影響範圍
- `e2e/auspicious-emblems.iphone-safari.spec.ts`
- `src/night-oracle-readability-r101.css`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- 本變更報告

## 保護範圍
- 不修改八字／紫微／七政／一掌經等命理引擎。
- 不修改 auth、payment、Supabase schema、權限、資料或環境變數。
- 不修改正式 Service Worker 更新機制；只在該 Safari 測試的隔離環境攔截 `/sw.js`。

## 回滾
- 移除 `night-oracle-readability-r101.css` 末尾 r102 語言 active 覆蓋。
- 還原 `makeAppOfflineSafe` 對 `/sw.js` 的測試攔截。
- 將 release fallback / ledger 測試還原至上一個正式版本。

## 驗證
- 要求 Deploy gate、Engine suite、完整 iPhone Safari 33/33 全部通過。
- Vercel Production 必須 `READY` 且 `githubCommitSha` 與 `main` HEAD 完全一致。
- 正式站需唯讀驗證 `/`、`/login`、`/account`、分析入口及語言切換。
