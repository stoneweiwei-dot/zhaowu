# 昭梧

正式域名：https://zhaowu.soul-terminal.com  
主站：https://soul-terminal.com  
仓库：https://github.com/stoneweiwei-dot/zhaowu

这个仓库是所有 AI / APP / Agent 协作昭梧的唯一源码与交接入口。无论由 ChatGPT、Codex、Grok、AppDeploy、GitHub-connected agent、部署 Agent 或未来任何平台接手，都不得建立平行 production 主线。

## 接手前强制阅读顺序

0. [AGENTS.md](./AGENTS.md) — **全平台最高执行协议；Section 0 负责新旧指令冲突检查与安全取代**
1. [docs/CURRENT-STATE.md](./docs/CURRENT-STATE.md) — 当前生产事实、已完成项、未完成项与优先级
2. [COLLAB.md](./COLLAB.md) — 协作、交接、锁文件与 Issue 规则
3. [docs/CONTRACT.md](./docs/CONTRACT.md) — 技术契约
4. [docs/SPEC.md](./docs/SPEC.md) — 产品边界
5. [docs/NINE-PAGE.md](./docs/NINE-PAGE.md) — 客户九页报告结构
6. [docs/PAID-REPORT-STYLE-v1.0.md](./docs/PAID-REPORT-STYLE-v1.0.md) — 「昭梧・四柱绘意报告风」
7. [docs/lexicon/](./docs/lexicon/README.md) — 干支／十神／神煞课件（神煞不进主判）
8. [src/lib/bazi/instruction-database.ts](./src/lib/bazi/instruction-database.ts) — 命理／南半球／五行训练／正信边界指令数据库

旧聊天、旧 Issue、旧分支、旧部署、旧平台专属说明如果与 `AGENTS.md`、`docs/CURRENT-STATE.md`、当前 `main` 或 Vercel Production 冲突，一律不得直接照旧执行；先按 P0 新旧指令冲突协议处理。
