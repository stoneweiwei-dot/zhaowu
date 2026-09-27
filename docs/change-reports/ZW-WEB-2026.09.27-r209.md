# 昭梧更新報告｜ZW-WEB-2026.09.27-r209

## 本次改動

- `src/lib/sky-events.ts` 新增本週（2026-09-28 至 10-03）火星相位叢集事件 `mars-aspect-cluster-2026-10`：太陽三分天王星、水星入天蠍、火星四分水星、火星三分海王星、火星衝冥王逆行；每項附天文事實時間軸、天文層（可驗證）與占星層（心理／行為象徵解讀）分層文字，以及本命宮位對照表，繁中／簡中／英文三語齊備。
- 新增 `getFeaturedSkyEvent()`：以 `published` 日期取代固定陣列首項，自動挑選最新一則作為首頁摘要與 `/sky-events` 頭條；新增 `getArchivedSkyEvents()` 取得其餘事件供專欄下方「早前天象」區塊使用。
- `src/components/sky-events-home-section.tsx`、`src/routes/sky-events.tsx` 改用上述兩個函式；時間軸與行星符號改由事件資料生成，不再對特定 id 寫死文字。
- `src/routes/sky-events.tsx` 新增「早前天象」區塊，土星衝與金星入天蠍兩則既有內容改列於此，讀者仍可完整閱讀，不因新事件成為頭條而消失。
- `src/sky-events.css` 追加 `.sky-events-archive` 相關樣式，沿用既有 `--sky-ink`／`--sky-jade`／`--sky-gold` token。
- `src/lib/site-stats.ts`：版本號推進為 r209，`updateNumber` 由 206 更新為 207，並更新公開摘要。
- `scripts/release-ledger.test.mjs`、`scripts/r162-production-closeout.test.mjs`、`lib/zhaowu-verification.js` 同步指向 r209。

## 為什麼改

站主要求「近日天象」板塊能每週依實際星象自動更新內容，且不需要每次手動介入陣列順序或畫面邏輯。原實作把首頁摘要與專欄頭條寫死指向 `SKY_EVENTS[0]`，且土星／金星兩則內容各自用 `event.id === "saturn-opposition-2026"` 硬編分支；直接在陣列開頭插入新項目雖然可行，但會讓既有的土星逆行長文與金星逆行完整解讀在畫面上永久消失，不符合「不破壞既有可用內容」的保護要求。改為「依 published 日期挑選最新項＋保留其餘項於歸檔區」後，之後每週只需新增一個新的 `SkyEvent` 物件，不需再碰選取邏輯或既有事件內容。

本輪合併前，main 已由另一批工作先行推進至 r208（R6.2.2 五層治理宣告／六項補丁／子平古籍來源／三語方法論披露）；本次以 r208 為基準 rebase，版本號順延為 r209，不覆寫 r207／r208 既有報告與 updateNumber 歷史。

## 影響範圍

- 首頁「近日天象」摘要卡片（`SkyEventsHomeSection`）。
- `/sky-events` 專欄頭條與新增的「早前天象」歸檔區塊。
- `src/lib/sky-events.ts` 的資料結構與匯出函式（新增，未刪改既有事件內容）。

## 受保護範圍

本版不修改：

- Bazi／紫微計算引擎、報告生成契約、auth／owner 權限、Supabase schema、付款、路由、月報、命書內容。
- R6.2.2 治理宣告、六項補丁、子平古籍來源與方法論披露（r208 內容）；未觸及 `docs/STONE-R6.2.2-*`、`src/lib/bazi/six-patches-instruction.ts`、`src/lib/bazi/runtime-contract.ts`、`src/components/paid-report-pages.tsx` 或對應 Supabase migration。
- 既有土星衝、金星入天蠍兩則事件的天文事實、科學說明、占星解讀、宮位對照與資料來源；僅改變其在畫面上的呈現位置（頭條 → 歸檔卡片），文字內容一字不動。
- `SaturnEssay` 專題長文組件與其內容；`isSaturn` 判斷邏輯保留，僅資料來源從固定索引改為 `getFeaturedSkyEvent()` 回傳值的 id 比對。

## 驗證狀態

- 合併前：`scripts/release-ledger.test.mjs`、`scripts/r162-production-closeout.test.mjs`、`lib/zhaowu-verification.js` 已同步更新至比對 `ZW-WEB-2026.09.27-r209`、`updateNumber: 207` 與本報告檔名；其餘既有 Deploy gate、Engine suite、iPhone Safari CI 套件不因本次改動的內容範圍而需要修改（未觸及命理計算、報告、auth、payment、Supabase schema）。
- **本地環境限制**：本次開發沙盒的 `npm ci` 對 `zustand@5.0.15` 這一個套件版本持續回傳 registry 端 403（直接 curl 該 tarball URL 亦重現相同 403，非本工具鏈或 proxy 問題；與同日另一批工作回報的限制相同），導致無法在本地執行 `npm run build`／`tsc --noEmit`／`test:deploy` 全套本地驗證。已改以人工核對大括號配對、import／匯出符號、既有 TS 型別（`SkyEvent`）欄位完整性、以及與 r208 基準 rebase 後的檔案差異作替代檢查。**Vercel production build（在 Vercel 自有基礎設施執行，不受本沙盒 registry 限制）為本次變更的實際 CI／build 判定依據**，合併後必須確認其 build 狀態為成功、部署 `READY`，並核對 production commit SHA 與本次 commit 一致，才可視為驗證完成；若 Vercel build 失敗，狀態為 `INCOMPLETE — BLOCKED BY` 並立即修正。
- 合併後：核對 Vercel Production `githubCommitSha` 是否等於本次 commit；以 WebFetch 檢查 production `/` 首頁「近日天象」摘要與 `/sky-events` 是否顯示新的火星相位叢集內容、「早前天象」是否顯示土星與金星兩則舊內容，且 r208 的治理宣告／六項補丁／方法論披露內容未受影響。

## 回滾

`git revert` 本次 commit 即可完整還原：`getFeaturedSkyEvent()`／`getArchivedSkyEvents()` 為新增匯出，回滾後兩個頁面自動退回原本固定索引邏輯，土星／金星內容位置不變；本次未做任何資料庫遷移或 Storage 寫入，回滾無資料遺失風險，亦不影響同批次已合併的 r208 內容。
