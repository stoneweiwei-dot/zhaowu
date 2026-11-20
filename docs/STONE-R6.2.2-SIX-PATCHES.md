# STONE 命理研究院｜R6.2.2 六項最小補丁

狀態：`ACTIVE RUNTIME PATCH`

適用範圍：昭梧網站八字分析、報告生成器、站主客戶分析、內部 QA、未來 AI / Agent。

優先關係：本補丁完整繼承 `docs/STONE-R6.2.2-CURRENT-MASTER.md`（L4 EVIDENCE/AUXILIARY 治理層）與 `docs/STONE-R6.2.1-CURRENT-MASTER.md` + P2 + P3（L1 CORE ZI-PING、L2 STRUCTURAL PATCH）；只加固具名結構、ODL/FC、時間層、資料邊界、事件鏈與回溯解釋的呈現邊界，不新增子平判法，不修改四柱、節氣、藏干、十神、起運、大運等 deterministic calculation truth。若與更新的站主明確指令衝突，以更新指令為準。

來源：站主 2026-09-27「最後一次收口」指令，源自 128 頁 PDF 壓力測試確認出來的 6 個最小 Patch。

Runtime 綁定：`src/lib/bazi/six-patches-instruction.ts`（`ZW-R6.2.2-SIX-PATCHES-1.0`，priority 0，隨 `ZW-HUMAN-GUIDANCE-CORE-1.0` 之後、其餘規則之前注入）；機器可讀常數見 `src/lib/bazi/runtime-contract.ts`。

## PATCH 01｜GF-13 擴展

GF-13 不只檢查「格局真假」，而是檢查所有命名結構真假。

包括但不限於：傷官配印、殺印相生、財官印相生、官殺取清、木火通明、金白水清、水火既濟、食傷生財、比劫奪財／合作、從格。

硬規則：**「有其名 ≠ 有其實。」**

任何具名結構斷語，輸出前必須回：月令、根氣、調候、承載、制化、流通、反證，七項逐一核對；缺一項即標「反證未清」並降級信度，不得只做正面舉證。

## PATCH 02｜ODL → FC → CAPACITY 三段

明確：**存在關係 ≠ 作用有效 ≠ 結果落地。**

- Stage 1／ODL：有沒有根／透／路（existence）。
- Stage 2／FC：作用是否真的有效（effectiveness）。
- Stage 3／CAPACITY：結果是否能被日主／整體結構承載並落到現實（capacity）。

禁止把前一階段直接等於後一階段（例如把「有路」直接寫成「有效流通」，或把「有效流通」直接寫成「承載充足」）。

## PATCH 03｜時間層 Evidence Gap

重大事件分別記錄：

- 原局：PRESENT / ABSENT / UNKNOWN
- 大運：PRESENT / ABSENT / UNKNOWN
- 流年：PRESENT / ABSENT / UNKNOWN
- 流月：只負責縮窗，不參與 PRESENT/ABSENT/UNKNOWN 分層。

禁止：
- 「流年 > 大運 > 原局」的固定力量階層；
- 「流年力量永遠最大」。

正式表達固定為：**原局定結構；大運定十年條件；流年定年度觸發；流月只縮小時間窗口。**

## PATCH 04｜Data Evidence Boundary

命理輸出細度不得超過已知資料細度。

例如：
- 只知道「住院」→ 不得自行補病名。
- 只知道「事故」→ 不得補事故方式。
- 只知道「官非」→ 不得補罪名／判決。
- 日期未知 → 不得補年月日。

UNKNOWN 就明確寫 UNKNOWN，不得用旁證或敘事把顆粒度反向拉高。

## PATCH 05｜Event Chain Separation

本人、配偶、父親、母親、兄弟姐妹、子女必須分別建立 Evidence Chain。

**同一年發生多件事情 ≠ 同一個命理機制。**

每條鏈必須獨立記錄固定四步：

目標對象 → 原局根 → 大運場 → 流年觸發 → 現實反饋。

不得混用不同主體的事件鏈，也不得以一人結論代入另一人。

## PATCH 06｜年度機制獨立 + 回溯降級

連續兩年發生同類事件，也必須分別解釋當年的實際作用鏈，不得用前一年的機制直接套用到當年。

知道答案後才倒推年月日：只能標 `VAL-C`／回溯支持。

不得算成：
- 前瞻預測命中（`VAL-A`）；
- 或正式 empirical validity（`VAL-B` 獨立盲回溯）。

## 驗收硬閘（與站主 12 條驗收要求一致）

1. 不改變排盤結果。
2. 不改變 auth / payment / Supabase 用戶數據結構。
3. 不重新發明新格局評分。
4. 不使用「缺什麼補什麼」。
5. 不允許旁證推翻子平主判。
6. 不允許流月越級造重大事件。
7. 不允許已知答案後的回溯解釋冒充預測成功。
8. 所有重大結論必須可追溯到具體結構依據。
9. iPhone 頁面不得橫向溢出。
10. 中文／簡中／英文都須檢查。
11. 完成後跑現有 tests / typecheck / build。
12. 不為了這次修改製造一堆新文件和新架構——本補丁只新增 `six-patches-instruction.ts` 一個 runtime 檔案與對應 `runtime-contract.ts` 常數，其餘均為既有檔案內加固。

## Regression / QA

每次輸出涉及具名結構、時間層、事件或回溯解釋前追加檢查：

- 是否省略 GF-13 反證軸就輸出「確定結構」；
- 是否把 ODL／FC／CAPACITY 三階段混為一談；
- 是否用固定階層語句取代原局／大運／流年逐層標記；
- 是否讓輸出細度超過已知資料細度；
- 是否混用不同六親主體的事件鏈；
- 是否把連續同類年度事件用同一條作用鏈帶過；
- 是否把 VAL-C 回溯支持包裝成 VAL-A／VAL-B。

任一項失敗，修正後才可輸出。
