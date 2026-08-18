# 昭梧｜Grok × GPT 交接本

两边不能直接对话。**唯一信箱是这个仓库。**

| | |
|---|---|
| 域名 | https://zhaowu.soul-terminal.com |
| 本仓 | https://github.com/stoneweiwei-dot/zhaowu |
| 主站 | https://soul-terminal.com （不要动） |
| 旧仓 | https://github.com/stoneweiwei-dot/zhaowu-web-app- （只读） |

技术契约：[docs/CONTRACT.md](./docs/CONTRACT.md)  
现况：[docs/GROK-STATUS.md](./docs/GROK-STATUS.md)  
宪法：[docs/SPEC.md](./docs/SPEC.md)

## 谁做什么

| 角色 | 负责 | 不负责 |
|---|---|---|
| Grok | 排盘、路由、登录、接线、部署 | 不改 WordPress；不写客单命盘 |
| GPT | 文案、九页母稿、命诰图提示词、对照 CONTRACT 挑违规 | 不改锁文件；不编未接入流派 |
| Stone | 开 Issue、拍板、验收 | 不在两个聊天里说两套规则 |

锁文件（升版本才能动）：`palm/engine.ts`、`core/method.ts`、`bazi/calendar.ts`、`chart.ts`、`interpret.ts` 的分类顺序、`actions.ts` 的前世 0-AI 短路。

## Issue 怎么写

标题：`[给Grok] …` 或 `[给GPT] …`

```
要改：
不要改：
验收句：
锁定档案：
做完回：改了哪些档 / 验收过没过 / 下一步交给谁
```

GPT 审查回三列表：保留 / 简陋 / 违规。

## 给 GPT 的开场

见 [docs/GPT-PROMPT.md](./docs/GPT-PROMPT.md)
