# 付费九页母稿 ZW-NINE-1.0

来源：Issue #4 GPT 交付。接线版本：本文件 + `src/lib/report/nine-page.ts`。

原则：九页不是第二套排盘器。每页只消费现有 `AnalysisResult` 的可靠字段。内部验收、方法状态、缺失模块与技术边界保存在 `evidence`，不得写入客户可见的 `body`。

| 页 | 标题 | 主要字段 | 硬门控 |
|---|---|---|---|
| 1 | 你真正问的事 | `question` `reading.directAnswer` `kind` | 禁止「资料不足」开场；选择题必选边；前世第一句六道+主星 |
| 2 | 命盘概览 | `pillars` `dayMaster` `monthBranch` `provenance` | `timeUnknown` 时柱／命宫／大运留白；1988-10-04 必须酉月 |
| 3 | 你整个人生怎么运转 | `reading.rhythm` `strength` | 只称旺衰底盘，不写 12 步已完成 |
| 4 | 反复出现的课题 | `work/love/money/body/home` 按 kind 置顶 | 健康不做医疗诊断；投资不做收益保证 |
| 5 | 个人命诰 | `reading.decree` | 提炼不是新算法；禁止剔除项 |
| 6 | 怎么把这张盘用到现实里 | `reading.action` | 至少一个具体动作 |
| 7 | 生活环境／颜色·方位·时段 | `usefulProvisional` `guide` | **`usefulProvisional=true` 时不硬填生活取象，也不向客户展示系统未完成状态** |
| 8 | 现在最该做的一件事 | `reading.action` `currentDayun` | 只有一条最高优先 |
| 9 | 给你的最后一句 | `lastLine` `palm` | 方法状态、报告编号、时间戳只留内部，不进入客户成品 |

验收：全文不得出现「12 步已完成」「最终喜用已定」。


客户成品禁用：自问自答、开发验收语句、`资料未接入`、`正式取用尚未完成`、粗候选说明、方法路由、报告 UUID、ISO 时间戳与版本代号。
