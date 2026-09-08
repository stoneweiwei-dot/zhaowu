# 昭梧更新報告｜ZW-WEB-2026.09.09-r95

## 本次改動
- 修正首頁「輕測驗」前兩個卡片都進入同一 `/fun-tests` 總目錄的重複入口問題。
- 「內在動物 × 命局瑞獸」改為直接進入 `/fun-tests?test=animal`，載入後立即顯示內在動物第一題。
- 「五行功能測驗」改為直接進入 `/fun-tests?test=element`，載入後立即顯示五行功能第一題。
- `/fun-tests` 無參數時仍保留為趣味測驗總目錄；「六道習氣測驗」仍獨立使用 `/quiz/six-realms`。
- 新增回歸測試，鎖定第一、第二個首頁測驗入口不得再次指向同一個未指定測驗的 URL。

## 為什麼改
- Production 首頁程式碼原本把第一與第二張測驗卡都寫成 `to: "/fun-tests"`，因此從任何一張卡點入都會先看到同一組兩個測驗選單，與「一個入口只進一個測驗」不符。

## 影響範圍
- `src/routes/index.tsx`
- `src/routes/fun-tests.tsx`
- `scripts/fun-tests-entry-routing.test.mjs`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- 不修改六道題目／判定、五行功能計分、內在動物計分、八字計算、登入、付款、Supabase schema 或資料。

## 回滾
- 回滾 r95 單一提交即可恢復 r94 首頁測驗入口行為；不涉及資料庫 migration。

## 驗證
- Engine / source regression / TypeScript / Vite build 必須全部通過。
- Vercel Production 必須精確指向 r95 最終 SHA 且 `READY`。
- Production 首頁第一個測驗入口必須帶 `?test=animal`，第二個必須帶 `?test=element`。
- 兩個 URL 必須分別直接呈現各自第一題，不能先看到同一個雙卡總目錄。
