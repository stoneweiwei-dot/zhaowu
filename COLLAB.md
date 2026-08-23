# 昭梧｜协作与交接规则

两边不能直接对话。**唯一源码真相是本仓库；唯一当前状态真相是 [docs/CURRENT-STATE.md](./docs/CURRENT-STATE.md)。**

## 所有 APP / AI / Agent 的统一入口

无论由 ChatGPT、Codex、Grok、AppDeploy、GitHub-connected agent、部署 Agent 或未来任何平台接手昭梧，**第一优先级都必须先读取并遵守根目录 [AGENTS.md](./AGENTS.md)**。

其中 `AGENTS.md` 的 **Section 0 — SAFE NEW-INSTRUCTION SUPERSESSION** 是全平台最高优先级的项目治理规则：每次收到新指令，先自动检查是否与旧指令冲突；仅在确认不会破坏现有逻辑、数据、构建、部署、权限、报告、路由与整体顺畅度时，才把被新指令取代的旧指令从当前 active execution path 中删除或停用。不能证明安全就不得强删。

## 每次接手先读

0. [AGENTS.md](./AGENTS.md) — 全平台最高执行协议；先做新旧指令冲突与安全取代检查
1. [docs/CURRENT-STATE.md](./docs/CURRENT-STATE.md) — 当前生产架构、已完成项、未完成项、优先级
2. [docs/CONTRACT.md](./docs/CONTRACT.md) — 技术契约
3. [docs/SPEC.md](./docs/SPEC.md) — 产品边界
4. [docs/NINE-PAGE.md](./docs/NINE-PAGE.md) — 客户九页报告结构
5. [docs/PAID-REPORT-STYLE-v1.0.md](./docs/PAID-REPORT-STYLE-v1.0.md) — 「昭梧・四柱绘意报告风」

**旧 Issue、旧聊天、旧部署文件与 CURRENT-STATE 冲突时，不得照旧执行。先以当前 `main`、Vercel Production、Supabase 实况为准。**

## 唯一生产主线

| 项 | 定案 |
|---|---|
| 源码 | `stoneweiwei-dot/zhaowu` |
| 分支 | `main` |
| Hosting | Vercel `stone-zhaowu-official` |
| Database/Auth | 当前 Supabase |
| 正式子域名 | `zhaowu.soul-terminal.com` |
| AppDeploy / Netlify / Grok 临时站 | 只读参考，禁止作为 production |

## 防止重复返工

- 已通过功能没有新的可复现 FAIL，不得因为旧 Issue 再改。
- Loading、Logo、Hero、登录方式等已收口功能默认冻结。
- 客户收费报告只认九页，不再恢复旧 23 页客户结构。
- 纯视觉修改不得阻塞排盘、登录、报告读取等核心故障。
- 每次修改都要说明：**当前可复现问题 → 改动 → 验收结果 → production commit/deployment**。

## 职责

| 角色 | 主要负责 |
|---|---|
| Grok / 代码 Agent | 排盘、路由、接线、构建、部署、可复现 bug |
| GPT | 产品/文案/九页报告/四柱绘意规范、审查、必要的非锁定配置与文档收口 |
| Stone | 产品拍板与最终实机验收 |

这不是权限墙；如果 Stone 明确要求某一方直接处理网站，应以当前工具能力处理，但**不得绕过锁文件与 CURRENT-STATE**。

## 锁文件

没有单独版本升级与明确验收，不重写：

- `src/lib/palm/engine.ts`
- `src/lib/core/method.ts`
- `src/lib/bazi/calendar.ts`
- `src/lib/bazi/chart.ts`
- `src/lib/bazi/interpret.ts` 分类顺序
- `src/lib/actions.ts` 前世 0-AI 短路

禁止搬回 AppDeploy 的 MutationObserver / form-title 双标题系统。

## Issue 规则

新 Issue 必须包含：

```
当前可复现问题：
要改：
不要改：
验收句：
锁定档案：
做完回：改了哪些档 / 验收过没过 / production commit/deployment
```

如果问题已经由后续 production commit 解决，关闭旧 Issue，不保留成“未来 Agent 的待办”。
