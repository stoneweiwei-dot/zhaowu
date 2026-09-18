# ZW-WEB-2026.09.19-r147｜P3 偏枯／病藥 Gate

状态：PR 阶段，尚未声明 Production Verified。

## Why

站主要求把 2026-09-18 新校正的「偏枯／病藥」规则同步到昭梧网站后台所有命理文字生成与指令入口，避免网站继续出现「缺什么补什么」「弱就等于枯」「极旺自动从格」「某五行直接等于人格／疾病／职业」等粗糙口径。

## What changed

- 新增 `docs/STONE-R6.2.1-P3-PINKU-BINGYAO-GATE.md`，作为第二个强制 ACTIVE RUNTIME PATCH。
- 当前母指令从 `R6.2.1 + P2` 升为 `R6.2.1 + P2 + P3`。
- 偏枯层固定六态：
  1. 不构成偏枯
  2. 偏而能用
  3. 偏而成病
  4. 枯而有源
  5. 枯而无源
  6. 特殊格另判
- 特殊格真假 Gate 必须先于偏枯；极旺／极弱不得自动升格。
- 病藥改为功能化：病＝结构功能故障；药＝真正修复功能并通过 ODL／FC 的结构，不固定等同某一五行。
- 偏枯 Gate 后强制执行 ODL → FC，「有路 ≠ 有效流通」。
- 墓库藏干不能直接当可用药神，逢冲不自动出库。
- 五行象义不得直接推出人格、疾病、职业、婚姻或财富。
- 颜色、家具、材质、方位、宠物、植物等降为文化／生活象义，不进入核心补命算法。
- 通根与十二长生分开，不设固定倍数或固定位置权重。
- 更新 `runtime-contract.ts`、Instruction Database、Instruction Registry、Ingestion Policy、AGENTS、CURRENT-STATE 与 runtime contract regression test。
- `structure.ts` 额外公开 active runtime patch sources，便于 QA／Agent 稽核当前是否真正加载 P2 + P3。

## Source classification

站主提供《八字偏枯的氣機與病藥》后，按现行 R6.2.1 + P2 清洗：
- `OWNER_MATERIAL` + `MODERN_INTERPRETATION`
- 保留：反「五行平均论」、病藥结构思想、岁运只作引动
- 修订：药从「固定五行」改为「功能修复」；极端偏旺从自动从格改为独立真假 Gate
- 淘汰：五行人格百科、固定疾病／心理映射、固定倍数权重、长生等同通根、墓库一冲即开、一物一行改命

## Protected scope

本次不修改：
- 四柱、节气、换月、真太阳时、藏干、十神、起运、大运等 deterministic calculation truth
- `src/lib/bazi/calendar.ts`
- `src/lib/bazi/chart.ts`
- 紫微／七政／一掌经／D60 计算
- Auth、Owner Cookie、Supabase schema/RLS/Storage
- Payment
- Homepage UI / chart rendering
- Paid Visual PR #295

## Rollback

回退本 release commit/PR 即可恢复到 `R6.2.1 + P2`。P3 不做数据库迁移，不改变任何 deterministic calculation truth，因此不需要数据回滚。

## Verification required

合并前：
- Deploy gate PASS
- Engine suite PASS
- iPhone Safari PASS
- `scripts/r621-runtime-contract.test.mjs` 确认 24 步主线、P2 + P3 patch sources、P3 instruction rule 均存在

合并后：
- Vercel Production READY
- Production SHA = merge SHA
- 网站正常载入；出生资料 → 命盘 → 提问主流程无 regression
- 命理文字输出不得再以五行票数／缺字直接判偏枯
- release_history 写入 `ZW-WEB-2026.09.19-r147` / update_number 147

## Verification state

当前：MODIFIED / PR NOT YET OPENED / NOT DEPLOYED / NOT PRODUCTION VERIFIED。
