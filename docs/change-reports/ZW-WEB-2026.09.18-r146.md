# 昭梧更新報告｜ZW-WEB-2026.09.18-r146

## 本次改動

- 首頁流程固定為 `#customer-record → #bazi → #question-stage`。
- 保存出生資料後，直接使用現有 `buildChart()` 與 `BaziChart` 顯示年、月、日、時四柱。
- 命盤完整展示十神、藏干、納音、十二長生、空亡、命宮與可用的大運資料；時辰未知時時柱與依賴時辰的資料留白降級。
- 命盤下方加入日主、月令、旺衰底盤、格局方向／完成度與主要結構特點的白話摘要。
- 已保存生辰再次開啟首頁時直接恢復命盤；修改出生資料並保存後同步重排。
- 「七種個人分析」中的子平八字入口，在已有生辰時直接跳到 `#bazi`。
- 移除仍禁止首頁顯示 `BaziChart` 的過期 r129 測試，改為保護新的三段式流程。

## 為什麼改

現行 Production 在保存出生資料後直接進入提問，首頁八字區只有按鈕，沒有實際命盤。這與「先看清自己的出生盤，再帶著命盤提問」的產品流程相反。舊 r129 禁止首頁命盤的契約已被站主最新明確指令取代。

## 影響範圍

- 首頁出生資料、四柱命盤、基礎解釋與提問順序。
- 首頁子平八字入口的錨點。
- 首頁 iPhone Safari 排版、文字可讀性與橫向溢出回歸測試。
- PWA shell cache 與公開 release metadata。

## 受保護範圍

- 不修改 `buildChart()`、節氣、真太陽時、藏干、十神、納音、十二長生、起運或大運算法。
- 不修改 D60、付款、站主登入、Supabase schema／遷移、Floot 或其他專卷引擎。
- 不把流通候選寫成正式喜用神。
- 一般訪客仍維持 guest-first，不要求登入。

## 驗證狀態

- 本地 Engine suite 全數通過。
- 本地 Vite Production build 與 TypeScript 檢查通過。
- iPhone Safari E2E 已新增「實際輸入生辰 → 命盤與解釋出現 → 無橫向溢出 → 字級可讀」及「保存後重開／修改同步重排」驗收；以 GitHub Production CI 的 WebKit 工作為合併硬門檻。
- 合併後必須確認 Vercel Production `githubCommitSha` 等於 `main`，再於真實 Production 重填一組出生資料核對命盤與解釋。

## 回滾

回滾本版首頁組合層、相關 CSS、測試、PWA cache 與 r146 release metadata，即可回到 r145；不需要回滾或遷移任何命理、登入、付款或資料庫資料。
