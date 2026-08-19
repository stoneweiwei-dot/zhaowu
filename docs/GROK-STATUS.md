# Grok 现况交接（给 GPT 读）

Grok 分享页是动态的，抓不到。**以本仓库为准。**  
技术细节以 [CONTRACT.md](./CONTRACT.md) 为准，本文件只报现况。

| | |
|---|---|
| 仓库 | https://github.com/stoneweiwei-dot/zhaowu |
| 域名 | https://zhaowu.soul-terminal.com （选定，DNS 未挂） |
| 主站 | https://soul-terminal.com （WordPress，不要覆盖） |
| 旧引擎快照 | https://github.com/stoneweiwei-dot/zhaowu-web-app- |
| 旧运行时 | https://204914e3adbfd65055.v2.appdeploy.ai/ （只读参考） |

## 主干决议（2026-08-19）

Grok 本仓是唯一产品主干。GPT 只辅导本仓。AppDeploy 不作平行产品。见 [COLLAB.md](../COLLAB.md)。

## 这是什么

Grok App Builder 重做的可运行站：TanStack Start + React + Vite + Tailwind + Better Auth + PGlite/Neon。

**不是** AppDeploy 单页 HTML，也不是 WordPress。两套代码。旧站 iPhone 白屏来自多个 MutationObserver 抢 `form-title`，禁止搬进新站。

## 已落地（保留）

| 模块 | 路径 | 实现程度 |
|---|---|---|
| 路由 ZW-METHOD-1.1 | `src/lib/core/method.ts` | 完整；专项目前几乎全是「资料未接入」 |
| 一掌经 ZW-PALM-1.0 | `src/lib/palm/engine.ts` | 完整；1988-10-04 寅时男命已对上 辰亥戌子 |
| 子平排盘 | `chart.ts` `calendar.ts` `solar-time.ts` | 节气月令、真太阳时、藏干、十神、纳音、长生、大运、胎元、命宫 |
| 旺衰／流通候选 | `chart.ts` | **简表**，旺衰底盘＋流通粗候选；不是 12 步引擎 |
| 直答 | `interpret.ts` | 0 AI；立场先行；选择必选边 |
| 完整报告 | `composeFullReport` + 可选 grok-4.5 | 前世强制 0 AI；固定九段 |
| 付费九页母稿 | `docs/NINE-PAGE.md` + `src/lib/report/nine-page.ts` | 规格 + 纯函数 + **前台按钮与完整展示已接** |
| 9:16 命诰图 | `docs/DECREE-IMAGE.md` + `src/lib/report/decree-image.ts` | 提示词 + 叠字规格 + **前台 9:16 叠字预览与按钮已接**；实际 xAI Imagine API 出图仍待 env |
| 结果页 | `result-view.tsx` | 直答、四柱、命诰、行动、粗候选待覆核、折叠方法区、**生成九页 / 生成命诰图 按钮** |
| 登录存档 | Better Auth + `reports` | 有；未记住出生资料、无续问 |

## Issue #2 违规（已修）

五行百分比主视觉已拆；喜用降级粗候选；`timeUnknown` 不伪造午时；usefulProvisional 门控生活取象。

## Issue #4（GPT 交稿，Grok 接线中）

| 项 | 状态 |
|---|---|
| 九页母稿文案 | GPT 已交；已写入 `docs/NINE-PAGE.md` |
| `composeNinePages` / `composeNinePageReport` | 已落地 |
| 命诰图 Base Prompt + 叠字规格 | 已落地 `decree-image.ts` |
| 结果页「生成九页／命诰图」按钮 | **已接（2026-08-19）** |
| 九页完整分页展示 | **已接** |
| 命诰图 9:16 叠字 + STONE 原創 水印预览 | **已接** |
| 实际图像 API（xAI /v1/images/generations） | 待 XAI_API_KEY + server action |
| 登录后记住出生、同盘追问 | 规格在 Issue #4；代码未接 |

## 未落地

- STONE Core 12 步
- 付费／结缘支付流
- 命诰图实际出图（API 调用）
- 登录回填出生、同盘追问
- 紫微／西占等独立排盘

## 管线

`AnalyzeInput → buildChart → buildPalm → classifyQuestion → routeMethods → interpret → AnalysisResult`  
`writeFullReport`：`kind==="past"` 直接 `composePalmReport`。  
付费九页：`composeNinePageReport(result)`（ZW-NINE-1.0）→ 前台可点。  
命诰图包：`decreeImagePackage(result)`（ZW-DECREE-IMG-1.0）→ 前台叠字预览可点。

## GPT 怎么审

1. 读 CONTRACT、本文件、COLLAB。  
2. 对源码，不要对分享页。  
3. 回 Issue，三列表：保留 / 简陋 / 违规。  
4. 不要改锁文件，不要往 AppDeploy 出平行版。
