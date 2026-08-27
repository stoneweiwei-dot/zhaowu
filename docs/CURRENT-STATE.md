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
- **真实命诰图 P0-3 已接线**：生成走 Supabase Edge Function `generate-decree-image`；已保存旧图的查看走独立 delivery-only signer `view-decree-image` → private Storage signed URL。客户端禁止 Canvas / SVG / CSS 假图；查看旧图不得触发图片生成额度。
- 后台背景图库及资产管理能力保留，但**当前全站应用页面不渲染图库壁纸、weekly fallback 或随机散落吉祥图**；背景资产只保留为以后可重新启用的素材能力。
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

个人命诰图 / 视觉成像独立于文字报告，由用户主动生成，失败不得阻塞文字阅读；已有成图应优先直接展示，不因供应商额度、风格版本或重新生成失败而消失。

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

唯一批准母版：**暖米宣纸・宋式图谱式成品 UI（2026-08-27 owner-approved 9:16 mockup）**。名称“昭梧・四柱绘意报告风”继续保留为产品视觉名称，但实际前台以这套母版为最终视觉来源。

使用方式：

- **全站应用页面采用封闭宣纸成品版**：首页、登录后的后台、图库、既有报告与独立工具都不得重新露出站主壁纸或 weekly fallback；页面区块之间即使有间距，也只能露出同一暖米宣纸底，禁止露出另一张背景图；
- **全站应用页面取消随机吉祥小图散布**，并移除工具卡、完整报告中的松散小 logo／贴纸式装饰，避免独立小图卡在文字或卡片边缘；必要品牌识别、功能性「问小龙」可保留；
- 所有文字承载面必须为高密度暖宣纸／米白实体卡，禁止为“看背景”而降低到玻璃透明度；正文优先级高于装饰；
- 主色：暖米白、旧宣纸黄、淡茶灰、墨褐；交互强调只用朱砂红与青玉绿；**紫黑、深紫命盘卡、乌金黑大底不再是当前前台主视觉**；
- Header 使用近实体暖宣纸；语言选中态使用青玉绿；主 CTA 使用朱砂红；正文使用墨色；
- 首页 hero、分析表单、结果卡、命诰图库、后台报告卡、完整报告、双轨工具统一使用同一纸色、低阴影、细金茶色边线，不能看起来像不同系统拼接；
- 当前应用视觉锁继续由 `src/home-sheet-ui-v5.css` 提供，并由 `SiteShell` 在所有非登录应用路由挂载同一 parchment shell；`src/approved-parchment-ui-v3.css` 与 `src/visual-readability-lock-v4.css` 作为基础层保留；
- 后台背景图库能力保留但当前仅作素材存档，不参与页面渲染；不得因为“全站无壁纸”而删除图库资产本身；
- 天龙八部／佛教吉祥法器等装饰不再放在页面层上漂浮；如其他独立体验仍使用，必须低饱和且不遮字；
- 命诰图区域本身必须是暖宣纸容器；真实个人命诰图的生成算法与命理逻辑不因 UI 改版而改变；
- 完整报告另有独立「茶仙守护」文化体验模块，不并入四个问题聚焦核心区；以 16 张 STONE 原创茶神图提供本命茶、当下适合茶、纯口味最爱茶三种交叉结果；规则与边界见 `docs/TEA-GUARDIAN.md`；
- 全站非登入页继续提供青玉小龙 AI 导览；
- iPhone 390–430 px 优先，严禁横向溢出、卡片断层、色差平台和可读性下降；
- 真实个人命诰图仍按命局全局推导，不能“看到某一柱就套某一个物件”。

详细生成图规则仍见 `docs/PAID-REPORT-STYLE-v1.0.md`；应用视觉覆盖的最终锁文件是 `src/home-sheet-ui-v5.css`。

## 6. Issue / 旧任务规则

旧迁移与重复任务不得自动复活。只有当前 production 仍能复现同一 FAIL 才允许重新处理。

长期交接与尚未完成的新功能可继续保留；任何旧 PR 如果明确要求恢复固定九页、旧幽灵 SVG / 旧品牌小 logo、随机装饰散布、站主壁纸 active path、Netlify / AppDeploy production，则不应合并其冲突部分。

## 7. 当前真正未完成

- 六道轮回习气测验仍未落地。
- 茶仙守护已接入 16 张单茶成品；六安瓜片、信阳毛尖、君山银针目前没有可读取的单茶成品，因此未放入可抽取结果。
- 正式子域名 `zhaowu.soul-terminal.com` DNS 收口。
- iPhone 关键流程最终实机验收。
- chart 引擎：完整刑冲合害库、正式病药通关、完整岁运作用链仍未实现。
- 后台历史记录仍可能带旧 `ninePages` 字段名；只作兼容，前台与新后台文案不得继续称“九页”。
- 新命诰图的供应商生成仍依赖图片 API credits；没有 credits 时只能交付已有成图，不能把供应商失败伪装成成功生成。

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