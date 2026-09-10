# 昭梧系统核心规范｜Current Constitution Index

状态：`CURRENT INDEX`  
旧 `ZW-METHOD-1.1 / ZW-PALM-1.0 / STONE Core` 摘录是历史基线，不再作为“唯一宪法”覆盖 current main、当前测试或 R6.2.1。旧内容完整保留在 Git history。

## 1. 当前最高规则

- 项目治理：`../AGENTS.md`
- 指令版本状态：`INSTRUCTION-REGISTRY.md`
- 当前产品／生产状态：`CURRENT-STATE.md` + current `main` + Production evidence
- 当前命理母指令：`STONE-R6.2.1-CURRENT-MASTER.md`
- 当前技术契约索引：`CONTRACT.md`
- 当前完整报告：`FOCUSED-REPORT.md`
- 当前报告视觉：`REPORT-VISUAL-SYSTEM.md`
- 新命理素材入库：`ANALYSIS-INGESTION-POLICY.md`
- Zi Wei 解释：当前 Zi Wei interpretation grammar / calculation profiles

## 2. 永久核心边界

1. 子平八字为主判；其他体系是独立验证、旁证或象征层，不得反向覆盖。
2. deterministic-first：计算真值先由代码／版本化 profile 完成，AI 不重算。
3. UNKNOWN 即 UNKNOWN；资料不足时不靠叙事补洞。
4. 月令按节气，不按公历月；南北半球居住季节不得反转出生四柱五行。
5. 禁止五行数量主判、缺什么补什么、合必化、冲必凶、单神煞重大事件直断、医疗诊断、投资保证。
6. 解释规则与 calculation truth 分层；改解释不能偷改盘。
7. 当前报告必须先回答用户真正问的问题，不自动扩写无关主题。
8. 旧固定九页／固定编号 session 已废止；内容契约以 `summary / body` 为核心，视觉阅读层可以程序化分卡但不得重复生成不同答案。
9. 图片与文字解耦；图片失败不能拖死文字结果。
10. 新规则执行 R6.2.1 的 Progressive Execution、Stage Checkpoint、No Silent Reinterpretation、Regression Test、Dual-Axis Evidence、Tie Procedure 与 Governance Stop Rule。

## 3. 历史算法资料如何使用

旧版本里的 Palm 验收向量、旧 method route、旧字段名、旧 `usefulProvisional`、旧实现完成度表等，只能在 current main 仍有对应代码／测试时作为参考。

不得因为旧 SPEC 写着“未接入”就把现在已经接入的专题降级；也不得因为旧 SPEC 写着“已接入”就跳过 current main / test verification。

## 4. 权限规则

不再按“只有 Grok 能改”“GPT 只能写文案”设角色权限墙。任何有真实写权限的 Agent 都可以在站主明确授权范围内处理，但必须遵守：

- 当前锁文件与 dependency check；
- 版本升级／测试要求；
- AGENTS supersession 规则；
- runtime 变更的 release ledger；
- Production 验证。

## 5. 当前判定

旧 SPEC 是历史证据，不是待办清单。任何曾因没有权限而只生成补丁／接入说明的内容，必须先经 `INSTRUCTION-REGISTRY.md` 判断是否仍有效，才能进入 current execution path。