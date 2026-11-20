# 昭梧紫微 Calculation Truth Layer v0.4.1

状态：`IMPLEMENTATION_SLICE_2`

`production_ready: false`

本文件承接 v0.3，不复活旧 v1.0 / 旧草稿。当前两批代码完成 deterministic 核心排盘与 calendar normalization contract；仍不接客户 UI，不改八字核心，不进入身体/健康输出。

## 1. 硬边界

- 严格保留两套索引：
  - `PALACE_INDEX`: 寅=0 … 丑=11
  - `EARTHLY_BRANCH_INDEX`: 子=0 … 亥=11
- 原始时辰身份保留 `0..12`：早子=0、晚子=12；二者地支都为子，但不得丢失 late-Zi 身份。
- 出生地时区与真太阳时修正仍属于上游；本层只接受已经校正的 civil wall time。
- 闰月、晚子、年界必须由 profile 显式指定，禁止偷偷使用默认假设。
- 四化必须显式指定 source profile；壬干化科冲突不得静默合并。
- 地空 `DI_KONG` 与另一颗按年支起的天空 `TIAN_KONG` 不得以中文字串合并。
- 十四主星允许同宫，不设“一宫一主星”错误约束。
- 出生时间未知不得偷偷当子时；所有时系确定性字段必须阻断。
- 身体象义仍禁用；只有 Calculation validation 全部 PASS 后才准接第二层星曜性质。

## 2. 已实现

代码：`src/lib/ziwei/`

### Slice 1 — deterministic core

1. 命宫、身宫：寅起正月，生月起子时，命逆、身顺。
2. 十二宫逆排；五虎遁求宫干。
3. 命宫干支求五行局。
4. 农历日 + 五行局求紫微 / 天府锚点。
5. 十四主星固定 offset。
6. 十干四化两套显式 profile：
   - `south_iztro_v1`: 壬科 = 左辅
   - `quanshu_transcription_v1`: 壬科 = 天府
7. 禄存、擎羊、陀罗。
8. 火星、铃星：年支三合组定子时起点，再按时支顺行。
9. 地空、地劫：亥宫起子时，空逆、劫顺。
10. 左辅、右弼、文昌、文曲。
11. 天魁、天钺：当前只开放 `south_iztro_v1` profile。

### Slice 2 — calendar normalization contract

1. `rawTimeIndex 0..12`：23:xx 固定保留为 12，不再被压成普通子时。
2. 晚子 profile：`current_day` / `forward_day`。
3. 晚子 `forward_day` 可真实跨公历日、农历月、农历年；主星所用农历日取 effective lunar day。
4. 闰月 profile：
   - `same_month`
   - `next_month`
   - `split_after_15`（现代 deterministic profile：十六日起按下月；raw late-Zi 12 例外）
5. 年界 profile：`lunar_new_year` / `lichun`。
6. `timeConfidence='unknown'` 时不生成 core input，并明确阻断身宫、昌曲、空劫、火铃等时系结果。
7. 复用现有 `src/lib/bazi/calendar.ts` 的历法 primitive 作为只读依赖；没有修改锁定八字日历文件。

## 3. 当前验证

`scripts/ziwei-truth-layer.test.mjs`：

- 两套索引固定顺序。
- 12月 × 12时辰 = 144 组命身宫全域测试。
- 十二宫 permutation 不重不漏。
- 5 组研究报告 golden vectors：命/身、命宫干、五行局、紫微/天府。
- A 案十四主星完整位置。
- 5 组羊陀、火铃、空劫、左右、昌曲、魁钺 golden vectors。
- 丙干四化负测试：太阳不得化科。
- 壬干 source-profile 冲突测试。

`scripts/ziwei-calendar-normalization.test.mjs`：

- 早子 0 / 晚子 12 身份隔离。
- 2026-02-16 23:30 在 `current_day` 与 `forward_day` 下跨农历新年差异。
- 2026-02-10 在农历新年界与立春年界下分别得到乙巳 / 丙午。
- 2025 闰六月十五 / 十六验证 `split_after_15`，并锁住 late-Zi 例外。
- 未知出生时间不得默认为子时或产出 deterministic core input。

第一批 PR #136 已经通过完整 GitHub Production CI（engine tests、TypeScript、Vite build、iPhone Safari regression）并合并到 main。第二批仍须以新 PR 的完整 CI 为合并硬门槛。

## 4. 明确未完成

以下继续保持 `production_ready=false`：

- 出生地 timezone / DST / 真太阳时 normalization 的统一上游 contract 与 golden cases。
- 14×12 廟旺完整 profile + provenance。
- 星曜五行 / 阴阳 / 化气 claim-based metadata。
- 大限方向、完整 decadal/yearly scopes、流曜。
- 60干支 × 12月 × 30日 × 13时序的大批量 differential test。
- 与第二独立实现逐宫 diff。
- 身体象义层；继续 DISABLED。

## 5. 下一批顺序

1. 廟旺 profile + 14×12 matrix provenance。
2. 大限与流年 scope；本命星 immutable regression。
3. 全量 differential vectors。
4. timezone / DST / true-solar adapter contract 与出生地边界案例。
5. 通过门槛后才允许把紫微作为八字之外的独立旁证层接入报告。

## 6. 来源等级

- A：古典原文 + 独立 deterministic 实作可重现。
- B：成熟现代实作 / 通行表，古籍未完整列出。
- C：派别解释 / 现代整理。
- quarantine：AI 合成、来源不明、或与基础诀法冲突。

本层不把“完整”误写成“已验证”。任何 disputed 值必须带 profile，不得成为无版本 global truth。
