# 昭梧更新報告｜ZW-WEB-2026.09.04-r37

## 本次改動

- 新增 `src/lib/life-view-curated.ts`，把目前《昭梧 · 觀世錄》中高度重複的修心／處世文章整理為 7 篇三語精選：
  1. 修行在日常：情緒升起之後，你還有第二個選擇
  2. 善良有界線：關心、孝親與責任要分開
  3. 放下與止損：別讓已經付出的代價綁架下一個選擇
  4. 知命不是宿命：命理可以照見結構，不能替你活
  5. 真正的風水：環境會影響人，人也在塑造環境
  6. 看清規律：努力很重要，但努力本身不保證結果
  7. 你想要的是擁有，還是占有
- `src/components/life-view-home-section.tsx` 改為只展示這一個 curated source，不再把六組歷史文章陣列全部疊加到前台。
- 舊文章檔案完全保留在 repo 作為編輯來源與歷史資料，不刪除、不改寫 Git 歷史；只是退出目前前台 active execution path。
- 新來源《探索未至之境(8)》的可用內容已併入相關主題，沒有把七個草稿再各自新增成七篇重複文章。
- 增加 `scripts/life-view-curation.test.mjs`，鎖定精選文章數量、三語完整性、唯一 ID、前台只讀 curated source 以及超自然隔離。
- 擴充 `scripts/practical-cultivation-advice.test.mjs`，用六種實際提問逐一驗證六個新建議主題可以命中，同時保護一般問題不被過度攔截。
- 公開 release fallback 更新為 `ZW-WEB-2026.09.04-r37` / 累計更新 `37`。

## 為什麼改

目前《觀世錄》由多個歷史文章檔案依序堆疊，已有大量「修心、放下、無常、家人界線、情緒、風水、行動」相近內容。站主已明確要求：同一類內容應提取精華後合併，不要讓使用者讀大量重複文章。

這次採用「精選前台 + 歷史來源保留」的方式，而不是直接刪掉舊文章。這樣前台篇數立即縮短，文章邏輯更集中，同時保留既有素材供日後追溯或再編輯，也不會因刪檔影響其他歷史引用。

本批原先以 r36 準備時，`main` 在工作途中先合併了另一筆「庚辛金／月相視覺象徵」r36。依 release ledger 不覆寫既有版本，本批順延為 r37，並以新的 `main` 作父提交。

## 影響範圍

會變更：

- 首頁 `昭梧 · 觀世錄` 的 active article source
- 前台可見文章數量與文章文字
- 最新文章日期與排序
- 實踐建議層的 regression coverage
- footer release fallback

不變更：

- 八字／真太陽時／節氣／四柱／十神／大運 calculation truth
- r36 已上線的庚辛金／月相視覺象徵規則
- 紫微 calculation truth 與 interpretation grammar
- 報告連續紙面結構
- 登入、帳戶、權限
- payment
- Supabase schema 與客戶資料
- 圖像 provider
- gallery / background system
- production routing
- 多語系架構
- 開放 PR #202 的 classic-passage / Supabase directive runtime 檔案

## 防錯與內容邊界

- 舊文章只退出 active 前台列表，不刪除原始來源檔。
- 新精選文章仍是 OWNER_MATERIAL／編輯性反思內容，不冒充古籍原文或科學定律。
- `松果體＝天眼`、接靈、地魂、乩身、業障致病等未證實內容不得進精選文章。
- 命理文章維持「知命不等於宿命」；任何文章不得反向修改 deterministic calculation truth。

## 測試

Release candidate 必須通過：

- `npm run test:engine`
- Vite production build
- TypeScript `tsc --noEmit`
- `life-view-curation` regression
- `practical-cultivation-advice` 六類命中與 generic fallback regression
- release ledger regression

## 回滾

回滾本 release commit 即可：移除 `life-view-curated.ts`，把 `life-view-home-section.tsx` 恢復為原六組文章陣列堆疊，並將 `SITE_RELEASE_FALLBACK` / release-ledger test 恢復到當時前一 release。舊文章來源從未刪除，因此不需要重建內容；本次沒有資料庫 migration，也不需要資料庫回滾。

## 驗證狀態

撰寫本檔時為 release candidate：**PENDING CI / PREVIEW / PRODUCTION VERIFICATION**。

只有 exact merged SHA 在唯一 Vercel 專案 `stone-zhaowu-official` 成為 Production `READY`、正式站 `/` 可讀且 production bundle 可確認含新版精選文章後，才標為 production verified；最終 commit、deployment、PR 與驗證結果需寫入 `public.release_history` 的 `ZW-WEB-2026.09.04-r37` / `update_number=37`。
