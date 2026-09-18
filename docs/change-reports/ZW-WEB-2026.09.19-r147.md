# 昭梧更新報告｜ZW-WEB-2026.09.19-r147

## 本次改動

- 新增 `docs/STONE-R6.2.1-P3-PINKU-BINGYAO-GATE.md`，狀態為 `ACTIVE RUNTIME PATCH`。
- 當前唯一命理執行口徑由 `R6.2.1 + P2` 升為 `R6.2.1 + P2 + P3`。
- 偏枯固定六態：不構成偏枯／偏而能用／偏而成病／枯而有源／枯而無源／特殊格另判。
- 特殊格先過真假 Gate；極旺／極弱不得自動升格從旺、從弱、專旺或化氣。
- 病藥功能化：病＝結構功能故障；藥＝能真正修復功能且通過 ODL／FC 的結構，不固定等同某一五行。
- 偏枯 Gate 後強制執行 ODL → FC，固定「有路 ≠ 有效流通」。
- 墓庫藏干不能直接視為可用藥神，逢沖不能自動視為出庫。
- 五行象義不得直接推出人格、疾病、職業、婚姻或財富。
- 顏色、家具、材質、方位、寵物、植物等降為文化／生活象義，不進核心補命算法。
- 通根與十二長生分開，不建立固定倍數或固定位置權重。
- Instruction Database 新增 `ZW-BAZI-PINKU-BINGYAO-P3`；machine-readable runtime 主線由 23 步增為 24 步。
- `structure.ts` 公開 active patch sources，QA／Agent 可直接核對 P2 + P3 是否載入。
- Instruction Registry、Analysis Ingestion Policy、AGENTS、CURRENT-STATE、runtime tests 與 release metadata 同步更新。

## 為什麼改

站主要求把 2026-09-18 對《八字偏枯的氣機與病藥》的校正正式同步到昭梧網站後台所有命理文字生成／規則入口。原材料中「偏枯不等於貧賤」「不能按五行字數判力量」「病藥須看結構」可保留，但五行人格百科、固定疾病／心理映射、極旺自動從格、長生等同通根、墓庫一沖即開與物件補命等內容與現行 R6.2.1 + P2 衝突，必須清洗後才可進 active runtime。

來源分類：`OWNER_MATERIAL` + `MODERN_INTERPRETATION`。保留反五行票數、病藥結構與歲運引動；修訂「藥＝五行」為「藥＝功能修復」；其餘衝突內容降級或淘汰。

## 影響範圍

- 八字分析的 canonical 指令來源。
- 後台命理文字生成／報告生成的 runtime contract 與 Instruction Database。
- 偏枯、病藥、特殊格極端強弱、ODL／FC、五行象義與生活五行建議的生成邊界。
- 命理規則入庫政策與未來 AI／Agent 的讀取入口。
- 公開 release metadata（r147）。

## 受保護範圍

- 不修改四柱、節氣、換月、真太陽時、藏干、十神、起運、大運等 deterministic calculation truth。
- 不修改 `src/lib/bazi/calendar.ts`、`src/lib/bazi/chart.ts`。
- 不修改 D60、紫微、七政、一掌經計算。
- 不修改 auth、Owner Cookie、payment、Supabase schema／RLS／Storage。
- 不修改首頁 UI／命盤展示流程。
- Paid Visual PR #295 維持暫停。

## 驗證狀態

- PR #371 已建立。
- Machine-readable runtime contract 已新增 P3 source、24 步主線與 P3 hard guards。
- `scripts/r621-runtime-contract.test.mjs` 已更新，驗證 P2 + P3 patch sources、P3 instruction rule、24 步主線與 structure audit。
- GitHub Production CI 重新執行中；合併前必須 Deploy gate／Engine suite／iPhone Safari 全綠。
- 尚未合併 main，尚未宣告 Vercel Production 或真實問答已驗證。
- 合併後必須確認 Vercel Production `githubCommitSha` 等於 merge SHA，並核對出生資料 → 命盤 → 提問主流程無 regression。
- Production 驗證後再寫入 Supabase `release_history`：`ZW-WEB-2026.09.19-r147` / update_number 147。

## 回滾

回滾本版 P3 文件、Current Master／Registry／Ingestion Policy／Instruction Database／runtime contract／structure audit／tests 與 r147 release metadata，即可恢復到 `R6.2.1 + P2`。本次沒有資料庫 migration，也沒有修改 deterministic calculation truth，因此不需要資料回滾。
