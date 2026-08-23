# 昭梧｜CURRENT STATE

最后核对：2026-08-24（AEST）

> **这是项目唯一“当前状态”来源。** 任何 Agent、Grok、GPT 或人工接手前先读本文件；旧 Issue、旧部署说明、旧聊天记录与本文件冲突时，以本文件 + 当前 `main` + 当前 Vercel Production + 当前 Supabase 为准。

## 1. 唯一生产主线

| 项 | 当前唯一真相 |
|---|---|
| GitHub | `stoneweiwei-dot/zhaowu` |
| Branch | `main` |
| Hosting | **Vercel** |
| Vercel project | `stone-zhaowu-official` (`prj_81IIJjyeM3l47ZPsiIE7d6eOrp9I`) |
| Production URL | `https://stone-zhaowu-official.vercel.app/` |
| Database/Auth | **Supabase** project `plgpxusmemnmzckbwtiv` |
| 正式子域名 | `zhaowu.soul-terminal.com`；DNS 未完成前继续使用 Vercel production URL |

**不要在文档里永久写死“当前 HEAD / deployment ID”。** 每次接手实时检查：Vercel Production 的 `githubCommitSha` 必须对应当前 `main`；不一致才是部署问题。

**禁止再建立或恢复第二条 production 主线。** Netlify、AppDeploy、Grok 临时站、旧仓均只读参考，不得作为当前生产目标。

## 2. 已完成且默认锁住，不要重复重做

- GitHub `main` → Vercel Production 已自动同步。
- GitHub `main` 的每次修改必须先通过测试、Vercel build 与线上实测；不要在这里固定某个历史 commit。
- Supabase 正常；登录、报告、背景与统计统一读取 `src/lib/supabase-config.ts`，禁止各模块再维护第二套 URL／Key fallback。
- 三语 Locale 已包含 `zh-Hant / zh-Hans / en`。
- Supabase 登录、报告存档、背景、访问统计、release history 已接入。
- X 登录选项已移除。
- Loading 的 ghost overlay 已移除。没有新的像素回归时，不要再把 intro 压回低分辨率。
- 客户九页报告已完成“去内部推理 / 去自问自答 / 去 UUID、时间戳、方法状态”的清理。旅行／去哪里题必须直接点名 2–3 个目的地（第 1／4／8 页都要出现城市名），不得再反问用户补城市。
- **后台答案单一来源（P0-1）已收口**：`finalizeReading` 产出唯一最终 Reading；已生成报告打开时只读 `mother_draft` / `paid_report` 保存版，禁止 owner/account 再 live 重算。
- **个人命诰（P0-2）已从日主模板升级为证据型文案**：引用月令、日支、旺衰、调候粗线索、干支落点、流通候选、大运；完整刑冲合害库 / 正式病药仍未在 chart 引擎落地，不得假装已算。
- **真实命诰图客户端已接线（P0-3）**：`src/lib/report/decree-image.ts` 调 Supabase Edge Function `generate-decree-image`；结果页可生成并显示 9:16 签名图；后台可看状态、失败原因与重试。禁止 Canvas/SVG/CSS 假图。Edge Function / API key 是否在 Supabase 侧配置完成，以线上实际调用结果为准。
- 后台背景库有红色「设为壁纸」按钮；被设为壁纸的图立刻成为全站背景。
- 首页已设「单页展厅」作为独立工具入口；达摩一掌经单页只展示用途、输入与结果，不混入九页报告。
- 首屏只显示直接答案与精简四柱；完整内容只走一个“查看完整九页报告”入口。
- Supabase `migration_state` 已改为 `production / vercel+supabase`。
- Supabase `paid_report_style` 已与九页客户产品及「昭梧・四柱绘意报告风」对齐。

以上项目没有新的可复现 FAIL 时，禁止因为旧 Issue 再开工。

## 3. 报告产品唯一结构

客户可见完整收费报告只认 **九页**：

1. 你真正问的事
2. 命盘概览
3. 你整个人生怎么运转
4. 反复出现的课题
5. 个人命诰
6. 怎么把这张盘用到现实里
7. 生活环境／颜色·方位·时段
8. 现在最该做的一件事
9. 给你的最后一句

以 `docs/NINE-PAGE.md` 与 `src/lib/report/nine-page.ts` 为内容结构真相。

**23 页旧 pageArchitecture 已废止，不得再作为客户产品结构。** 当前九页客户报告是顺序阅读的文字报告；报告第一屏不提前展开其余八页。

## 4. 视觉规范（真实图像生成）

名称：**昭梧・四柱绘意报告风**。

- 客户九页文字报告与命诰图解耦：图失败不得挡住文字阅读。
- 真实生成走 Supabase Edge Function + Storage；客户端只渲染签名 URL。
- 禁止用渐变、SVG、Canvas、固定模板冒充 AI 图。
- 默认 9:16 iPhone 优先。
- 视觉必须由全局命局推导，禁止“看到壬画水、看到寅画虎”的单柱套图。

详细规则：`docs/PAID-REPORT-STYLE-v1.0.md` 与 `src/lib/report/paid-report-style.ts`。

## 5. Issue 收口状态

旧迁移/重复任务已经关闭：#2、#4、#5、#6、#7、#8、#12。

当前只保留：
- **#1**：长期交接入口，不堆具体开发任务。
- **#24**：六道轮回习气测验，尚未落地，是当前有效功能待办。

任何已关闭 Issue 不得因为旧聊天再次自动复活；只有当前线上仍可复现同一 FAIL 才新开 Issue。

## 6. 当前真正未完成 / 可继续做

- Issue #24：六道轮回习气测验。
- 正式子域名 `zhaowu.soul-terminal.com` DNS 收口。
- 实机 iPhone 对关键流程最终验收；只有真实 FAIL 才修。
- 命诰图：若 Supabase Edge Function / API key 未配置，线上会返回 `IMAGE_GENERATION_NOT_CONFIGURED`；这是平台配置问题，不是前端假图问题。
- chart 引擎尚未实现完整刑冲合害库、正式病药通关；文案层不得假装已完成。
- 其他新功能必须另开 Issue，并且先确认不与已完成项重复。

## 7. 生产优先级

出现多个问题时固定按这个顺序：

1. 白屏 / 无法进入 / 无法分析
2. 排盘或核心结论错误
3. 登录 / 报告读取 / 保存失败
4. 九页客户报告内容错误或泄露内部推理
5. 真实报告图生成（已接线客户端；配置失败单独处理）
6. 后台管理
7. 纯视觉微调

低优先级不得阻塞高优先级。

## 8. 锁定边界

没有单独版本升级与明确验收时，不重写：

- `src/lib/palm/engine.ts`
- `src/lib/core/method.ts`
- `src/lib/bazi/calendar.ts`
- `src/lib/bazi/chart.ts`
- `src/lib/bazi/interpret.ts` 分类顺序
- `src/lib/actions.ts` 前世 0-AI 短路

禁止搬回 AppDeploy 的 MutationObserver / form-title 双标题系统。

## 9. 接手规则

每次准备改网站之前，只做三件事：

1. 读本文件。
2. 查 `main` 当前 HEAD 与 Vercel Production 对应 commit。
3. 只处理“当前仍能复现”的问题。

**不得根据已关闭/过时 Issue 重新修改已经通过的功能。**
