# 昭梧更新報告｜ZW-WEB-2026.09.27-r208

## 本次改動

- `docs/STONE-R6.2.2-CURRENT-MASTER-DECLARATION.md`（新增）：正式宣告 STONE R6.2.2 為唯一 CURRENT MASTER，並把既有治理／runtime 文件綁定到站主指定的五層模型（L1 CORE ZI-PING／L2 STRUCTURAL PATCH／L3 TEMPORAL-EVENT／L4 EVIDENCE-AUXILIARY／L5 OPERATIONAL INFRASTRUCTURE）。
- `docs/STONE-R6.2.2-SIX-PATCHES.md`（新增，`ACTIVE RUNTIME PATCH`）：收錄六項最小補丁完整條文（GF-13 擴展、ODL→FC→CAPACITY、時間層 Evidence Gap、Data Evidence Boundary、Event Chain Separation、年度機制獨立＋VAL-C 回溯降級）。
- `src/lib/bazi/six-patches-instruction.ts`（新增）：`ZW-R6.2.2-SIX-PATCHES-1.0` instruction rule，priority 0，於 `zhaowuInstructionDatabase` 中緊接人本指引之後注入。
- `src/lib/bazi/runtime-contract.ts`：新增治理／六項補丁機器可讀常數（`BAZI_GOVERNANCE_MASTER_*`、`BAZI_GOVERNANCE_LAYER_MODEL`、`BAZI_GF13_*`、`BAZI_ODL_FC_CAPACITY_STAGES`、`BAZI_TIME_LAYER_*`、`BAZI_DATA_EVIDENCE_BOUNDARY_EXAMPLES`、`BAZI_EVENT_CHAIN_*`、`BAZI_VALIDATION_CLASSES`）。
- `src/lib/bazi/instruction-database.ts`：註冊新 rule，更新路由註解與 `zhaowuInstructionDatabaseUpdatedAt`。
- `supabase/migrations/20260927210000_add_bazi_classic_sources.sql`（新增）：在 `classic_sources` 新增滴天髓、三命通會（四庫全書本）、子平真詮（國家圖書館影印原本）、窮通寶鑑四筆來源，全部標 `source_nature='classic'`，`verification_note` 區分古籍原文與注文／後世整理。未插入任何 `classic_passages` 列。
- `src/components/paid-report-pages.tsx`：新增 `MethodologyDisclosure` 元件與三語（`zh-Hant`／`zh-Hans`／`en`）文案，掛載於「判斷備註」收合層（`AnalysisNotes` 與無 `result` 的 fallback 分支），含可折疊「了解方法」子區塊。
- `src/zhaowu-design-system.css`：新增 `.zhaowu-report-methodology*` 樣式（含夜間模式覆寫），沿用既有 `.zhaowu-report-method-notes` 字級與配色慣例。
- `docs/INSTRUCTION-REGISTRY.md`：新增 r206 supersession 記錄本次四項任務範圍與邊界。
- `AGENTS.md` §15：追加一段引用新的宣告文件與六補丁文件，不改動既有條文。
- `src/lib/site-stats.ts`：`updateNumber` 由 205 提升為 206，`version` 由 r206 提升為 r208（r207 標籤已被同日合併的 `docs/change-reports/ZW-WEB-2026.09.27-r207.md`〈五行認知／十干性格梗／四庫速查〉佔用，該次為 docs-only 豁免未動 `updateNumber`，故本次沿用計數器 205→206、檔名跳號至 r208 以避免衝突）。

## 為什麼改

站主「最後一次收口」明確指令：(1) 把 R6.2.2 正式設為唯一 CURRENT MASTER 並綁定五層模型；(2) 加入 128 頁 PDF 壓力測試確認出的六個最小 Patch；(3) Supabase 經典來源庫補上四個子平核心來源；(4) 網站加入小型三語「推算方法」聲明。四項均為既有治理架構的加固與收口，不重新研究整個專案、不另建命理框架、不推翻既有子平核心。

## 影響範圍

- 命理 runtime instruction 注入順序（新增一條 priority 0 規則，早於全部既有規則執行，只加約束不刪規則）。
- 完整報告「判斷備註」收合層新增一個小區塊（三語文字 + 一個巢狀折疊）。
- Supabase `classic_sources` 表新增 4 筆資料列。
- 治理文件與 INSTRUCTION-REGISTRY／AGENTS.md 新增與追記段落。

## 受保護範圍

- 不改四柱、節氣、藏干、十神、起運、大運等 deterministic calculation truth；R6.2.1、P2、P3 既有判法全文完全未動。
- 不改 auth／owner 權限、payment、Supabase 用戶資料結構。
- 不改 `classic_passages` 既有段落與其 `verification_status` 計數（verified=38／not_applicable=15／pending=0／rejected=0，遷移前後已即時核對一致）。
- 不重新發明格局評分，不使用「缺什麼補什麼」，不允許旁證推翻子平主判。
- 不新增第二 Production、不復活 Netlify、不改路由架構。

## 驗證狀態

- Supabase：`apply_migration` 執行成功，`execute_sql` 核對新增 4 筆 `classic_sources` 與 `classic_passages` 狀態計數不變（已完成，見任務對話紀錄）。
- 本地 `npm ci` / `npx tsc --noEmit` / `npm run build` / `npm run test:deploy`：本地容器的 npm registry 對 `zustand@5.0.15` 等套件回傳 403（`curl` 直連 registry.npmjs.org 同樣 403，非 agent proxy 允許清單問題），本地未能安裝依賴，因此本地未能執行 `tsc --noEmit`、`vite build`、`test:deploy`。新增 TypeScript 檔案已逐行核對型別（`InstructionRule` 欄位、`as const` 陣列、既有 import 路徑）與既有慣例一致。
- GitHub Actions `Production CI`（`build.yml`）在乾淨 runner 上執行 `npm ci && npm run build` 與 `npm run test:engine`；本次修改改走 PR 觸發該工作流程作為實際 build/test gate，取代本地驗證。
- 合併前：Deploy gate、Engine suite、iPhone Safari 必須全綠（含本次同步更新的 `scripts/release-ledger.test.mjs`）。
- 合併後：需確認 Vercel Production githubCommitSha 等於最新 main，並在正式站確認完整報告判斷備註層可見新的方法論披露（繁中／簡中／英文三語切換）。

## 回滾

`git revert` 本次 commit 即可完整還原。純新增檔案＋既有檔案內加固／版本號變更，`classic_sources` 新增列可用 `delete from public.classic_sources where slug in ('ditianshu-ziping','sanmingtonghui','zipingzhenquan','qiongtongbaojian');` 單獨回滾，不影響 `classic_passages` 既有資料。
