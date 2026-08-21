# 昭梧｜客户收费九页报告

来源：Issue #4 GPT 交付。接线版本：本文件 + `src/lib/report/nine-page.ts`。

> **本文件是客户可见收费报告的唯一页面结构真相。** 旧 23 页 pageArchitecture 已废止。当前客户渲染器只显示顺序文字报告；真实图像生成未接入前，禁止用渐变、SVG、Canvas 或固定模板冒充生成图片。

原则：九页不是第二套排盘器。每页只消费现有 `AnalysisResult` 的可靠字段。内部验收、方法状态、缺失模块与技术边界保存在 `evidence`，不得写入客户可见的 `body`。

| 页 | 标题 | 主要字段 | 硬门控 |
|---|---|---|---|
| 1 | 你真正问的事 | `question` `reading.directAnswer` `kind` | 禁止「资料不足」开场；选择题必选边；前世第一句六道+主星 |
| 2 | 命盘概览 | `pillars` `dayMaster` `monthBranch` `provenance` | `timeUnknown` 时柱／命宫／大运留白；1988-10-04 必须酉月 |
| 3 | 你整个人生怎么运转 | `reading.rhythm` `strength` | 只称旺衰底盘，不写 12 步已完成 |
| 4 | 反复出现的课题 | `work/love/money/body/home` 按 kind 置顶 | 健康不做医疗诊断；投资不做收益保证 |
| 5 | 个人命诰 | `reading.decree` | 提炼不是新算法；禁止剔除项 |
| 6 | 怎么把这张盘用到现实里 | `reading.action` | 至少一个具体动作 |
| 7 | 生活环境／颜色·方位·时段 | `usefulProvisional` `guide` | `usefulProvisional=true` 时不硬填生活取象，也不向客户展示系统未完成状态 |
| 8 | 现在最该做的一件事 | `reading.action` `currentDayun` | 只有一条最高优先 |
| 9 | 给你的最后一句 | `lastLine` `palm` | 方法状态、报告编号、时间戳只留内部，不进入客户成品 |

客户成品禁用：自问自答、开发验收语句、`资料未接入`、`正式取用尚未完成`、粗候选说明、方法路由、报告 UUID、ISO 时间戳、版本代号、AI 推理过程。

未来若接入真实图像生成，视觉统一使用 `docs/PAID-REPORT-STYLE-v1.0.md` 的 **昭梧・四柱绘意报告风**；图像能力必须与文字报告独立，失败时不得影响报告阅读。

验收：全文不得出现「12 步已完成」「最终喜用已定」；任何重要视觉元素必须能反查命局证据。
