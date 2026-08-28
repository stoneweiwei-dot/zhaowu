# 昭梧紫微 Calculation Truth Layer v0.4

状态：`IMPLEMENTATION_SLICE_1`

`production_ready: false`

本文件承接 v0.3，不复活旧 v1.0 / 旧草稿。v0.4 第一批代码只实现**已经标准化农历输入之后**的 deterministic 核心排盘，不接 UI，不改八字核心，不进入身体/健康输出。

## 1. 硬边界

- 严格保留两套索引：
  - `PALACE_INDEX`: 寅=0 … 丑=11
  - `EARTHLY_BRANCH_INDEX`: 子=0 … 亥=11
- Gregorian → lunar、闰月、晚子时、年界、真太阳时属于 calendar normalization，**本层不偷偷假设**。
- 四化必须显式指定 source profile；壬干化科冲突不得静默合并。
- 地空 `DI_KONG` 与另一颗按年支起的天空 `TIAN_KONG` 不得以中文字串合并。
- 十四主星允许同宫，不设“一宫一主星”错误约束。
- 身体象义仍禁用；只有 Calculation validation 全部 PASS 后才准接第二层星曜性质。

## 2. 本批已实现

代码：`src/lib/ziwei/`

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

## 3. 当前验证

新增 `scripts/ziwei-truth-layer.test.mjs`：

- 两套索引固定顺序。
- 12月 × 12时辰 = 144 组命身宫全域测试。
- 十二宫 permutation 不重不漏。
- 5 组研究报告 golden vectors：命/身、命宫干、五行局、紫微/天府。
- A 案十四主星完整位置。
- 5 组羊陀、火铃、空劫、左右、昌曲、魁钺 golden vectors。
- 丙干四化负测试：太阳不得化科。
- 壬干 source-profile 冲突测试。
- 未标准化月份拒绝进入核心层。

本地在无项目依赖安装条件下使用 Node 22 type-stripping 运行新测试：9/9 PASS；并用独立临时 tsconfig 对新增 TypeScript 文件执行 `tsc --noEmit`：PASS。最终仍以 GitHub Production CI 为硬门槛。

## 4. 明确未完成

以下仍保持 `production_ready=false`：

- raw time index `0..12` 与 `is_late_zi` 身份保留。
- 晚子日切换 / 农历日期跨月跨年。
- 闰月 policy 的生产实现与边界测试。
- 农历新年 vs 立春 year-boundary profile。
- 真太阳时与出生地时区 normalization。
- 14×12 廟旺完整 profile + provenance。
- 星曜五行 / 阴阳 / 化气 claim-based metadata。
- 大限方向、完整 decadal/yearly scopes、流曜。
- 与第二独立实现的全量 differential test。
- 身体象义层；继续 DISABLED。

## 5. 下一批顺序

1. Calendar normalization contract：闰月 / 晚子 / 年界 / time-confidence。
2. 廟旺 profile + 14×12 matrix provenance。
3. 大限与流年 scope；本命星 immutable regression。
4. 全量 differential vectors。
5. 通过门槛后才允许把紫微作为八字之外的独立旁证层接入报告。

## 6. 来源等级

- A：古典原文 + 独立 deterministic 实作可重现。
- B：成熟现代实作 / 通行表，古籍未完整列出。
- C：派别解释 / 现代整理。
- quarantine：AI 合成、来源不明、或与基础诀法冲突。

本层不把“完整”误写成“已验证”。任何 disputed 值必须带 profile，不得成为无版本 global truth。
