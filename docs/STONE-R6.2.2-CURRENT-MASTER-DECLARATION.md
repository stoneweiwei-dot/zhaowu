# STONE R6.2.2 CURRENT MASTER 宣告 — 五層治理模型

狀態：`GOVERNANCE DECLARATION`（不是新的判法文件，只把既有文件與 runtime 綁定到五層模型並宣告 R6.2.2 為 sole CURRENT MASTER）

日期：2026-09-27（最後一次收口 Task 1）

## 1. 宣告

**STONE R6.2.2 是昭梧網站命理分析唯一正式 CURRENT MASTER。**

舊版本（R6.2.1 以前、R6.1、R6、R5……）繼續保留作歷史稽核，但 runtime 只認 R6.2.2 為 governance 入口；任何 AI／Agent 若只讀到舊文件，必須繼續尋找 `docs/STONE-R6.2.2-CURRENT-MASTER.md`，不得把舊文件重新升格為 CURRENT。

R6.2.2 是治理／證據覆蓋層，不是重寫子平計算真值；code-level engine identifier 依 `docs/STONE-R6.2.2-CURRENT-MASTER.md` §8 保持 `R6.2.1`。完整關係為：

**R6.2.2 CURRENT GOVERNANCE MASTER + R6.2.1 deterministic runtime + P2 + P3 + 六項最小補丁**

## 2. 現行五層

### L1 CORE ZI-PING

月令、調候、根氣、格局、體用、病藥、制化、流通、承載。

來源：`docs/STONE-R6.2.1-CURRENT-MASTER.md`（固定主判順序、Governance/Runtime 分離、Progressive Execution）。

### L2 STRUCTURAL PATCH

GF-13、TG-FS、P2、PK-6、EC-7、ODL→FC、墓庫、辰庫六態、NEG-QA。

來源：`docs/STONE-R6.2.1-P2-STRUCTURAL-DYNAMICS.md`（刑沖合害破、TG-FS 十神功能不變、六沖、墓庫動態、FC）、`docs/STONE-R6.2.1-P3-PINKU-BINGYAO-GATE.md`（PK-6 偏枯六態、EC-7 氣勢集中／雙強相戰、病藥功能化）。

PATCH 01（GF-13 擴展）與 PATCH 02（ODL→FC→CAPACITY）在本層原地加固既有 GF-13 與 ODL→FC 機制，不新增第二套判法。

### L3 TEMPORAL / EVENT

原局 → 大運 → 流年 → 流月；LBX、事件分類、六親／事件對象定位。

來源：`src/lib/bazi/runtime-contract.ts` 的 `BAZI_ANALYSIS_MAINLINE`（大運、流年、流月、LBX 四軸、事件性質、六親定位步驟）、`src/lib/bazi/kinship-runtime.ts`（六親角色與宮位證據）。

PATCH 03（時間層 Evidence Gap）與 PATCH 05（Event Chain Separation）在本層加固。

### L4 EVIDENCE / AUXILIARY

SRC、VAL、AUX、胎元、命宮、身宮、神煞、十干外應、紫微等旁證。

來源：`docs/STONE-R6.2.2-CURRENT-MASTER.md` §4（A／B／C 證據分級、確定結構／較高概率／合理推論／旁證補充／不作判定五級信度語言）。

PATCH 04（Data Evidence Boundary）與 PATCH 06（年度機制獨立 + VAL-C 回溯降級）在本層加固。

### L5 OPERATIONAL INFRASTRUCTURE

Execution Manifest、G0–G4、REASONED、MSC、EVP、Conflict Matrix、SH-FECM、Regression。

來源：`AGENTS.md`（部署／成本護欄、release ledger、instruction supersession 流程）、`docs/INSTRUCTION-REGISTRY.md`（版本裁決與 supersession 紀錄）、`docs/CURRENT-STATE.md`（當前生產狀態快照）、`supabase/migrations/`（classic_passages 等資料治理）。

## 3. 六項最小補丁的層級歸屬

六項最小補丁（完整條文見 `docs/STONE-R6.2.2-SIX-PATCHES.md`）不是獨立第六層，而是在既有 L2／L3／L4 原地加固：

| Patch | 加固層級 | 加固對象 |
| --- | --- | --- |
| PATCH 01 GF-13 擴展 | L2 | GF-13（所有具名結構真假） |
| PATCH 02 ODL→FC→CAPACITY | L2 | ODL→FC（延伸出第三階段 CAPACITY） |
| PATCH 03 時間層 Evidence Gap | L3 | 原局／大運／流年 PRESENT／ABSENT／UNKNOWN 分層 |
| PATCH 04 Data Evidence Boundary | L4 | AUX／VAL 輸出顆粒度上限 |
| PATCH 05 Event Chain Separation | L3 | 六親／事件對象定位 |
| PATCH 06 年度機制獨立 + 回溯降級 | L4 | VAL 證據分級（VAL-C 回溯支持） |

## 4. Runtime 綁定證據

- `src/lib/bazi/runtime-contract.ts`：新增 `BAZI_GOVERNANCE_MASTER_VERSION`、`BAZI_GOVERNANCE_MASTER_SOURCE`、`BAZI_SIX_MINIMUM_PATCHES_SOURCE`、`BAZI_MASTER_DECLARATION_SOURCE`、`BAZI_GOVERNANCE_LAYER_MODEL`（本文件的機器可讀版本）與六項補丁的機器可讀常數。
- `src/lib/bazi/six-patches-instruction.ts`：`ZW-R6.2.2-SIX-PATCHES-1.0` instruction rule，priority 0，於 `zhaowuInstructionDatabase` 中緊接 `ZW-HUMAN-GUIDANCE-CORE-1.0` 之後注入，早於全部其餘規則執行。
- `src/lib/bazi/instruction-database.ts`：已註冊上述 rule 並更新路由註解與 `zhaowuInstructionDatabaseUpdatedAt`。

## 5. 不變項（本次收口刻意不動）

- 不改變排盤結果、四柱、節氣、藏干、十神、起運、大運等 deterministic calculation truth。
- 不改變 auth／payment／Supabase 用戶資料結構。
- 不重新發明新格局評分或新判法。
- L1／L2 既有判法文字（R6.2.1、P2、P3 全文）維持不變，六項補丁只新增約束，不刪除或覆寫既有規則。
