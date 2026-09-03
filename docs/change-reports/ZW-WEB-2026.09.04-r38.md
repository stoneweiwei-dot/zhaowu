# 昭梧更新報告｜ZW-WEB-2026.09.04-r38

## 本次改動

- 《昭梧 · 觀世錄》由 7 篇精選增為 8 篇，新增「自知、自勝、知足：修行不是往高處爬，而是少被外境牽走」繁中／簡中／英文內容。
- 修正新文章英文正文中 3 組直接 ASCII 雙引號造成的 TypeScript 語法錯誤；改為正常排版引號，不改文章語義。
- `scripts/life-view-curation.test.mjs` 的精選數量已在前一修復提交對齊為 8，r38 保持 8 篇唯一 ID 與三語完整性。
- 公開 release fallback 更新為 `ZW-WEB-2026.09.04-r38` / 累計更新 `38`。

## 為什麼改

r37 把《觀世錄》收斂為 7 篇。其後新增第 8 篇「自知、自勝、知足」，但英文正文內直接使用 ASCII 雙引號置於 TypeScript 雙引號字串中，導致 `life-view-curated.ts` 無法轉譯，Production CI 與 Vercel build 均失敗。

本次只修正該語法並把第 8 篇納入正式 release ledger，不改動命理計算、報告生成、登入或資料庫邏輯。

## 影響範圍

會變更：
- 首頁《昭梧 · 觀世錄》精選文章由 7 篇增至 8 篇。
- 新增第 8 篇三語內容。
- footer release fallback 更新至 r38。
- 修復 `life-view-curated.ts` build blocker。

不變更：
- 八字／真太陽時／節氣／四柱／十神／大運 calculation truth
- 23:00–23:59:59 當日、00:00 後次日規則
- 紫微／七政／一掌經計算
- 報告連續紙面結構
- 登入、帳戶、權限
- payment
- Supabase schema / 客戶資料
- 圖像 provider / Gallery
- production routing

## 防錯與內容邊界

- 第 8 篇仍屬編輯性反思內容，不冒充古籍原文或確定性因果。
- 命理只作結構與選擇分析；文章不得修改 deterministic calculation truth。
- 圖像、宗教或超自然象徵不得被寫成客觀事實。

## 測試

Release candidate 必須通過：
- `npm run test:engine`
- Vite production build
- `tsc --noEmit`
- `life-view-curation` regression
- release ledger regression
- iPhone Safari loading fallback regression

## 回滾

如 r38 失敗，不得只回到 `9b90967…`，因該提交仍包含無法轉譯的新文章。安全回滾需同時撤回 r38、`9b90967…` 與新增第 8 篇的 `bd7f8e3…`，回到 r37 的 7 篇精選狀態；或暫時把 Production 指回已知 READY 的 `df0db142…`。本次無資料庫 migration。

## 驗證狀態

撰寫本檔時：**PENDING CI / PRODUCTION VERIFICATION**。
只有 exact r38 SHA 在唯一 Vercel 專案 `stone-zhaowu-official` 成為 Production `READY`，且正式站核心路徑通過檢查後，才可標記為 production verified。
