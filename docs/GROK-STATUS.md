# Grok 现况交接（给 GPT 读）

Grok 分享页是动态的，抓不到。**以本仓库为准。**  
技术细节以 [CONTRACT.md](./CONTRACT.md) 为准，本文件只报现况。

| | |
|---|---|
| 仓库 | https://github.com/stoneweiwei-dot/zhaowu |
| 域名 | https://zhaowu.soul-terminal.com （选定，DNS 未挂） |
| 主站 | https://soul-terminal.com （WordPress，不要覆盖） |
| 旧引擎快照 | https://github.com/stoneweiwei-dot/zhaowu-web-app- |
| 旧运行时 | https://204914e3adbfd65055.v2.appdeploy.ai/ |

## 这是什么

Grok App Builder 重做的可运行站：TanStack Start + React + Vite + Tailwind + Better Auth + PGlite/Neon。

**不是** AppDeploy 单页 HTML，也不是 WordPress。两套代码。旧站 iPhone 白屏来自多个 MutationObserver 抢 `form-title`，禁止搬进新站。

## 已落地（保留）

| 模块 | 路径 | 实现程度 |
|---|---|---|
| 路由 ZW-METHOD-1.1 | `src/lib/core/method.ts` | 完整；专项目前几乎全是「资料未接入」 |
| 一掌经 ZW-PALM-1.0 | `src/lib/palm/engine.ts` | 完整；1988-10-04 寅时男命已对上 辰亥戌子 |
| 子平排盘 | `chart.ts` `calendar.ts` `solar-time.ts` | 节气月令、真太阳时、藏干、十神、纳音、长生、大运、胎元、命宫 |
| 旺衰／流通候选 | `chart.ts` `judgeStrength` `usefulElements` | **简表**，标成旺衰底盘＋流通粗候选；不是 12 步引擎 |
| 直答 | `src/lib/bazi/interpret.ts` | 0 AI；立场先行；选择必选边 |
| 完整报告 | `composeFullReport` + 可选 grok-4.5 | 前世强制 0 AI；规则版与 AI 扩写统一固定九段 |
| 结果页 | `src/components/result-view.tsx` | 直答、四柱、命诰、行动、粗候选待覆核、折叠方法区；无五行百分比条 |
| 登录存档 | Better Auth + `reports` 表 | 有；未记住出生资料、无续问 |
| 印章 | `src/components/marks.tsx` | 小 webp；`/login` 不撒 |

## Issue #2 违规（已修，calendar / palm / method 未动）

| 违规 | 现况 |
|---|---|
| 五行百分比当判定／主视觉 | `elementPercents` 强制全 0；结果页百分比条已拆 |
| `useful`／`drain` 标成喜用 | 文案降级为「流通粗候选（待覆核）」；`usefulProvisional=true` |
| 粗候选继续派生颜色／方位／时段／宠物 | `guideFrom()` 在 `usefulProvisional=true` 时不再产出生活取象；结果页与完整报告明确待覆核 |
| `timeUnknown` 用 12:00 伪造午时柱 | 时柱 `ready=false`／`ganZhi=未定`；命宫、大运、真太阳时留白；正午只用来取节气年月 |
| `writeFullReport` 叫模型缺资料也硬判 | 提示词改为：有多少可靠资料就判多少；禁止正午冒充时柱 |
| AI 完整报告只有 8 段、规则版 9 段 | Grok 扩写提示词改成固定九段，与 `composeFullReport` 对齐 |

验收测试：`scripts/engine-acceptance.test.mjs`（1988-10-04 寅时男命四宫；缺性别整盘不判；缺时辰不伪造午时；粗候选不得派生生活取象）。

## 未落地（不要写成已完成）

- STONE Core 12 步：从化、格局、刑冲合害库、正式病药
- 付费九页母稿、命诰图 9:16 出图
- 紫微／西占／吠陀／六爻／奇门独立排盘
- 南北半球风水（只标了南半球不反转五行）
- 登录后自动回填出生资料
- 同一张盘追问

## 管线

`AnalyzeInput → buildChart → buildPalm → classifyQuestion → routeMethods → interpret → AnalysisResult`  
`writeFullReport`：`kind==="past"` 直接 `composePalmReport`，禁止再打模型。

分类优先序（不可重排）：past → home → **choice** → health → love → career → money → timing → self。

## GPT 怎么审

1. 读 [CONTRACT.md](./CONTRACT.md) 和本文件。  
2. 对源码，不要对 Grok 分享页。  
3. 回 [Issue #2](https://github.com/stoneweiwei-dot/zhaowu/issues/2)，三列表：保留 / 简陋 / 违规。  
4. 锁文件见 CONTRACT §8。不要改 `calendar` 节气、`palm` 步进、`method` 路由。
