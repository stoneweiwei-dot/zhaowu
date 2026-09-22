# 昭梧更新報告｜ZW-WEB-2026.09.23-r178

## 本次改動

- 出生資料區新增「時間校正由系統自動完成」提示；一般使用者只填出生證明上的當地時間並選擇出生城市。
- 保持現有城市搜尋作為入口；經度、時區、歷史夏令時與真太陽時繼續由既有確定性排盤處理，不新增手動工程欄位。
- canonical 視覺系統加入列印規則，移除首頁 viewport 高度、螢幕背景與固定浮層對列印的影響，避免 PDF 尾端多出空白頁。
- r178 公開版本資訊同步到網站 footer／更新頁 fallback。

## 為什麼改

站主提供的《黃道吉日 · 真太陽時精準排盤》頁面把經度、UTC 與夏令時直接交給一般使用者，且匯出 PDF 出現整頁空白黑頁。昭梧 current main 已具備城市搜尋與確定性真太陽時資料鏈，所以本次不另建第二套排盤頁，而是把同一意圖收進目前唯一公開出生資料流程，並修正首頁列印高度。

## 影響範圍

- `src/components/analysis-form.tsx`
- `src/zhaowu-design-system.css`
- `scripts/sto17-ui-contract.test.mjs`
- release metadata／ledger tests。

## 受保護範圍

- 不改八字 deterministic calculation truth。
- 不改城市搜尋資料模型、出生資料儲存契約、登入、付款、完整報告、Supabase schema 或使用者資料。
- 「今日指引／黃曆」仍與「出生資料／命盤」分開，不新增獨立公開工具 route。
- 不新增外部 runtime 依賴。

## 成本與配額

- 純前端文案、CSS 與契約測試調整，無新增 Storage、資料庫、第三方 API 或付費服務。
- 分支不作 Vercel Preview；只在 CI 通過後合併 main，觸發一次 Production release。

## 驗證狀態

- 合併前：Deploy gate、Engine suite、iPhone Safari 必須通過。
- 合併後：Production SHA 必須與 main SHA 一致。
- Production 驗證重點：首頁可載入、出生資料區顯示自動時間校正提示、城市搜尋仍可用、沒有手動經度／UTC／DST 欄位、列印版不再繼承 viewport 高度造成尾端空白頁。

## 回滾

如出生資料提示或列印 CSS 造成回歸，可回滾 `analysis-form.tsx` 的提示區與 `zhaowu-design-system.css` 的 r178 樣式；命理核心與資料結構未變，不需要資料回滾。
