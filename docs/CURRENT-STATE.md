# 昭梧｜CURRENT STATE

最后核对：2026-08-27（AEST）

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

不要永久写死 HEAD / deployment ID。每次接手实时检查 `main` 与 Vercel Production 的 `githubCommitSha` 是否一致。

**禁止再建立或恢复第二条 production 主线。** Netlify、AppDeploy、Grok 临时站、旧仓均只读参考。

## 2. 已完成且默认锁住

- GitHub `main` → Vercel Production 自动同步。
- Supabase 登录、报告存档、背景、访问统计统一使用当前项目配置。
- 三语 Locale：`zh-Hant / zh-Hans / en`。
- X 登录选项已移除。
- Loading ghost overlay 已移除。
- **后台答案单一来源 P0-1 已收口**：`finalizeReading` 产出唯一最终 Reading；已保存报告打开时不再 live 重算成另一套答案。
- **个人命诰 P0-2 已升级为证据型文案**；完整刑冲合害库 / 正式病药仍未在 chart 引擎落地，不得假装已算。
- **真实命诰图 P0-3 已接线**：`src/lib/report/decree-image.ts` → Supabase Edge Function `generate-decree-image` → Storage；客户端只渲染签名 URL。禁止 Canvas / SVG / CSS 假图。
- 后台背景库可设为壁纸；Supabase 站主背景优先于 weekly fallback。
- 首页只保留一条分析主路径；达摩一掌经为独立工具入口。

没有新的可复现 FAIL 时，禁止因为旧 Issue / 旧聊天重做这些功能。

## 3. 报告产品唯一结构（2026-08-24 起）

**固定九页已经废止。** 新报告不得为了凑页数塞无关内容。

客户完整报告默认只有四个核心区：

1. **直接结论** — 第一屏直接回答用户真正问的事。
2. **命理依据** — 只列与这一问直接相关、当前引擎已经成立的依据。
3. **时间与节奏** — 时间／出行题必须给可执行窗口；其他题只讲当前节奏。
4. **现实行动** — 把判断翻成可以执行的下一步。

条件区仅在确实相关时出现：

- **关系与对象**：只在感情／关系问题出现。
- 以后新增条件区必须先证明与原问题直接相关。

个人命诰图 / 视觉成像独立于文字报告，由用户主动生成，失败不得阻塞文字阅读。

唯一产品契约：`docs/FOCUSED-REPORT.md` + `src/lib/report/focused-report.ts`。

历史 `mother_draft.ninePages` 与 `src/lib/report/nine-page.ts` 只作旧记录／旧 import 兼容，**不得恢复固定九页产品**。

## 4. 客户报告内容硬规则

- 不输出自问自答、内部推理、实现说明、模型说明、UUID、时间戳、方法状态。
- 不为职业题自动塞感情／财务；不为感情题自动塞工作／财务。
- 复合问题只分别回答用户实际问到的主题。
- 旅行／去哪里题必须直接给目的地与执行顺序，不反问用户补城市。
- 未实现能力不得包装成已完成：格局体用、正式病药、完整刑冲合害、完整岁运作用链仍需独立实现。
- 图失败不能拖死文字报告。

## 5. 当前视觉系统

名称继续保留：**昭梧・四柱绘意报告风**。

新增统一视觉母题：**天龙八部 × 佛教吉祥法器**，来源于用户提供的 STONE 原创参考组。

使用方式：

- 报告顶部：一张压暗后的黑金／青玉主视觉作品牌锚点；
- 功能意象：法轮、莲、盘长结、法螺、双鱼、宝瓶；
- 主色：乌金黑、深茶褐、古金、青玉绿、象牙白；
- 不再用全站随机幽灵 SVG / 散落小 logo 作为主视觉；
- 完整报告每个实际出现的内容区块配置一只水彩青玉小龙；三组共 27 个表情以内容语义稳定选择，图片只作情绪提示，加载失败不得阻塞或遮挡正文；
- 完整报告另有独立「茶仙守护」文化体验模块，不并入四个问题聚焦核心区；以 16 张 STONE 原创茶神图提供本命茶、当下适合茶、纯口味最爱茶三种交叉结果；规则与边界见 `docs/TEA-GUARDIAN.md`；
- 全站非登入页提供青玉小龙 AI 导览：常见问题在浏览器内零成本匹配，模糊问题才调用 Supabase Edge Function；AI 只能从现有白名单路线中推荐入口，失败时退回本地导航；
- iPhone 390–430 px 优先，视觉不得遮挡文字、输入与按钮；
- 真实个人命诰图仍按命局全局推导，不能“看到某一柱就套某一个物件”。

详细生成图规则：`docs/PAID-REPORT-STYLE-v1.0.md`。

## 6. Issue / 旧任务规则

旧迁移与重复任务不得自动复活。只有当前 production 仍能复现同一 FAIL 才允许重新处理。

长期交接与尚未完成的新功能可继续保留；任何旧 PR 如果明确要求恢复固定九页、旧随机小 logo、Netlify / AppDeploy production，则应关闭而不是合并。

## 7. 当前真正未完成

- 六道轮回习气测验仍未落地。
- 茶仙守护已接入 16 张单茶成品；六安瓜片、信阳毛尖、君山银针目前没有可读取的单茶成品，因此未放入可抽取结果。
- 正式子域名 `zhaowu.soul-terminal.com` DNS 收口。
- iPhone 关键流程最终实机验收。
- chart 引擎：完整刑冲合害库、正式病药通关、完整岁运作用链仍未实现。
- 后台历史记录仍可能带旧 `ninePages` 字段名；只作兼容，前台与新后台文案不得继续称“九页”。

## 8. 生产优先级

1. 白屏 / 无法进入 / 无法分析
2. 排盘或核心结论错误
3. 登录 / 报告读取 / 保存失败
4. 完整报告与用户问题不相关、答案不一致或泄露内部推理
5. 真实报告图生成
6. 后台管理
7. 纯视觉微调

低优先级不得阻塞高优先级。

## 9. 锁定边界

没有独立版本升级与明确验收时，不重写：

- `src/lib/palm/engine.ts`
- `src/lib/core/method.ts`
- `src/lib/bazi/calendar.ts`
- `src/lib/bazi/chart.ts`
- `src/lib/bazi/interpret.ts` 分类顺序
- `src/lib/actions.ts` 前世 0-AI 短路

本轮报告结构重构只允许改报告组合层、报告 UI、相关测试与兼容读取，不得借机改排盘核心。

禁止搬回 AppDeploy 的 MutationObserver / form-title 双标题系统。

## 10. 接手规则

每次准备改网站之前：

1. 读 `AGENTS.md` 与本文件。
2. 查 `main` 当前 HEAD 与 Vercel Production 对应 commit。
3. 只处理当前仍能复现的问题。
4. 新指令与旧指令冲突时，按 P0 安全 supersession 规则清理旧 active path。

**不得根据已关闭 / 过时 Issue 重新修改已经通过的功能。**
