# 昭梧｜Grok × GPT 交接本

两边不能直接对话。**唯一信箱是这个仓库。**

| | |
|---|---|
| 域名 | https://zhaowu.soul-terminal.com |
| 本仓 | https://github.com/stoneweiwei-dot/zhaowu |
| 主站 | https://soul-terminal.com （不要动） |
| 旧仓 | https://github.com/stoneweiwei-dot/zhaowu-web-app- （只读参考） |
| 旧运行时 | https://204914e3adbfd65055.v2.appdeploy.ai/ （只读参考，不作主干） |

技术契约：[docs/CONTRACT.md](./docs/CONTRACT.md)  
现况：[docs/GROK-STATUS.md](./docs/GROK-STATUS.md)  
宪法：[docs/SPEC.md](./docs/SPEC.md)

## 主干决议（2026-08-19 Stone 拍板）

**Grok 这一套是唯一主干。GPT 只辅导这一版，不再平行出一套。**

| 项 | 定案 |
|---|---|
| 源码真相 | 只认本仓 `stoneweiwei-dot/zhaowu` |
| 运行主干 | Grok / 本仓部署；正式域名挂 `zhaowu.soul-terminal.com` |
| AppDeploy 旧站 | 只读参考（文案、九页结构、命诰图规格、支付与站主流程的产品清单） |
| 禁止 | 把引擎搬进 AppDeploy；把 MutationObserver / form-title 双标题系统搬进本仓；再开一套平行产品 |
| 旧站多出来的能力 | 当规格清单往本仓接：付费九页母稿、9:16 命诰图、记住出生、同盘追问、结缘支付、站主开放报告 |

## 谁做什么

| 角色 | 负责 | 不负责 |
|---|---|---|
| Grok | 排盘、路由、登录、接线、部署、主干代码 | 不改 WordPress；不写客单命盘；不维护 AppDeploy 运行时 |
| GPT | 文案、九页母稿、命诰图提示词、对照 CONTRACT 挑违规 | 不改锁文件；不编未接入流派；不往 AppDeploy 出平行版 |
| Stone | 开 Issue、拍板、验收、DNS | 不在两个聊天里说两套规则 |

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
