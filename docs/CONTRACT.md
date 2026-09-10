# 昭梧技术契约｜Current Contract Index

状态：`CURRENT INDEX`  
旧 `ZW-CONTRACT-1.0` 的详细实现快照已从 active execution path 退出；完整历史仍保留在 Git history，不得从旧 commit、Library 或 AppDeploy briefing 自动复活。

仓库：`stoneweiwei-dot/zhaowu`  
生产：Vercel `stone-zhaowu-official`  
当前状态：`docs/CURRENT-STATE.md` + current `main` + current tests + Production evidence

## 1. 契约优先级

发生冲突时按以下顺序：

1. `AGENTS.md` — 项目治理、权限、安全 supersession、完成定义；
2. `docs/INSTRUCTION-REGISTRY.md` — 当前／历史／等待权限遗留状态；
3. current `main` + deterministic tests — 实际运行真值；
4. `docs/CURRENT-STATE.md` — 当前产品与生产状态；
5. `docs/STONE-R6.2.1-CURRENT-MASTER.md` — 当前命理解释／治理母指令；
6. 当前专题契约，例如 `FOCUSED-REPORT.md`、`REPORT-VISUAL-SYSTEM.md`、Zi Wei grammar/source profiles；
7. 本文件中的通用技术边界；
8. 旧 CONTRACT / SPEC / Issue / chat / AppDeploy patch — 历史参考。

任何旧文档写着“宪法”“不可改”“只准某个 Agent 改”，都不能覆盖更高层当前规则。权限由站主明确指令、当前工具权限、依赖检查与 QA Gate 决定，不按 Agent 名字设权限墙。

## 2. Calculation Truth 与 Interpretation Truth 分离

确定性计算必须由代码／版本化 profile／测试产生。AI、文案层、命理解释层不得重新计算或偷改：

- 公历／节气／月令；
- 四柱、藏干、十神；
- 真太阳时／时区／夏令时处理；
- 起运与大运；
- 紫微、七政等各自 calculation layer 的确定性结果。

解释层只能读取同一份 engine snapshot / evidence trace。若 calculation truth 修正，必须明确标 `CALCULATION_CORRECTION`，不能当成普通文案更新。

## 3. 当前命理运行契约

唯一母指令：`docs/STONE-R6.2.1-CURRENT-MASTER.md`。

硬边界：

- 子平八字是主判；
- 旁证不得反向覆盖子平；
- UNKNOWN 就是 UNKNOWN；
- 不用五行数量、缺什么补什么、生肖或单一神煞推出重大结论；
- 资料不足时依赖时辰的模块必须降级／留白；
- 结论必须先回答原问题，再给与本题直接有关的证据、风险与行动；
- R6.2.1 的 Progressive Execution、Stage Checkpoint、No Silent Reinterpretation、Regression Test、Dual-Axis Evidence、Tie Procedure 与 Governance Stop Rule 全部生效。

## 4. 当前完整报告契约

当前内容契约只认：

- `summary`
- `body`

具体规则以 `docs/FOCUSED-REPORT.md` 为准。

旧固定九页、旧 `01–09` 编号 session、旧固定九段生成顺序均已退出 active execution path。程序化 tabs / swipe cards / 图谱阅读层可以存在，但它们只能呈现同一份已验证结构化结果，不能让模型重新生成多套互相冲突的报告。

历史记录里的 `conclusion / basis / timing / action / relationship / ninePages` 只允许兼容读取，不得作为新生成契约复活。

## 5. 专题与旁证

- `/yizhangjing`：前世今生／一掌经的当前产品入口；象征／传统解读边界必须保留。
- Zi Wei：计算真值与解释语法分离；解释层服从当前 Zi Wei grammar，不能修改 placement / 四化 calculation truth。
- 七政及其他专题：先使用各自当前 deterministic engine / profile；客户输出只读其结果，不在语言层重算。
- D60：只有出生时间可靠到所需精度时才启用；资料不足必须不作判定。

旧“专题全部未接入”的表格已失效；是否接入必须以 current main 与 tests 逐项确认。

## 6. 输入与隐私

输入 schema、auth ownership、共享出生资料、报告历史与 Supabase 权限以 current TypeScript types、auth provider、RLS 与测试为真值。

禁止从旧 AppDeploy `src/account.js`、旧 localStorage 约定或旧静态 HTML 复制认证实现到当前 React/Supabase 架构。

用户资料不得跨账户泄漏；已登出状态不得继续读取受账户保护的共享出生资料。

## 7. 受保护改动

以下范围不得因“整理指令”顺手改 runtime：

- `src/lib/palm/engine.ts`
- `src/lib/core/method.ts`
- `src/lib/bazi/calendar.ts`
- `src/lib/bazi/chart.ts`
- `src/lib/bazi/interpret.ts` 的确定性分类／主判顺序
- auth / payment / Supabase schema / report history
- production routing

不是“某个 Agent 才能改”，而是：只有站主明确要求该范围、依赖检查完成、对应版本／测试／回归 Gate 通过时才可改。

## 8. 旧契约永久退场项

以下旧内容不得再作为当前事实：

- “当前还是 AppDeploy / Netlify production”；
- `stoneweiwei-dot/zhaowu-web-app-` 是主仓；
- 静态 `zhaowu-latest.html` 是生产主入口；
- Node 20 是当前锁定版本；
- 固定九页／固定九段是当前完整报告；
- 所有专题都未接入；
- 只有 Grok 能改引擎、GPT 只能写文案；
- 旧 `notifyAuth()` / MutationObserver / form-title 双 owner 架构；
- 把旧“等待权限”的补丁直接复制到 current main。

## 9. 每次对码流程

1. 读 `AGENTS.md` 与 `INSTRUCTION-REGISTRY.md`；
2. 查 current `main` SHA 与 relevant files；
3. 查 current tests / open PRs / Production SHA；
4. 确认旧指令是否已经被 supersede；
5. 用最小改动实现；
6. 跑对应 CI / build / Safari / deterministic tests；
7. runtime 变更按 release ledger 发版并核对 Production；
8. docs-only 指令整理无需假装成 UI production feature，但必须真实进入 current `main` 才算仓库指令库完成。

## 10. 绝对规则

代码与测试定义“现在实际怎么跑”；R6.2.1 定义“命理解释与治理现在应该怎么判”；CURRENT-STATE 定义“当前产品与生产怎么收口”。

历史 CONTRACT 只用来解释过去，不再有权把当前系统拉回旧架构。