# 昭梧｜CURRENT STATE

最后核对：2026-08-30 00:35 AEST

> **这是项目唯一“当前状态”来源。** 旧 Issue、旧部署说明、旧聊天记录与本文件冲突时，以本文件 + 当前 `main` + 当前 Vercel Production + 当前 Supabase 为准。

## 1. 唯一生产主线

| 项             | 当前唯一真相                                                           |
| -------------- | ---------------------------------------------------------------------- |
| GitHub         | `stoneweiwei-dot/zhaowu`                                               |
| Branch         | `main`                                                                 |
| Hosting        | **Vercel**                                                             |
| Vercel project | `stone-zhaowu-official` (`prj_81IIJjyeM3l47ZPsiIE7d6eOrp9I`)           |
| Production URL | `https://stone-zhaowu-official.vercel.app/`                            |
| Database/Auth  | **Supabase** project `plgpxusmemnmzckbwtiv`                            |
| 正式子域名     | `zhaowu.soul-terminal.com`；DNS 未完成前继续使用 Vercel production URL |

每次接手实时检查 `main` 与 Vercel Production 的 `githubCommitSha`，禁止另建第二条 production 主线。Netlify、AppDeploy、Lovable standby、旧临时站只读参考。

## 2. 已完成且默认锁住

- GitHub `main` → Vercel Production 自动同步。
- Supabase 登录、报告存档、图库/背景资产、访问统计统一使用当前项目配置。
- 三语 Locale：`zh-Hant / zh-Hans / en`；X 登录已移除。
- Loading ghost overlay 已移除。
- `finalizeReading` 是最终 Reading 单一来源；已保存报告不重新 live 算出另一套答案。
- 个人命诰文字为证据型文案；真实命诰图走私有 report image delivery，失败不得阻塞文字答案。
- Gallery/背景资产管理能力保留；当前页面不读取 Supabase owner/weekly wallpaper 作为应用背景。
- 首页只保留一个主分析表单；三個专题入口分别进入 `/qizheng`、`/yizhangjing`、`/ziwei`。「性格两面」继续保持为独立 `/tianji-dual`，不得再用 CSS 或文案伪装成「前世今生」。
- `/yizhangjing` 是首页唯一「前世今生」入口：以达摩一掌经排前四世六道、逐世特征与留到今生的习性，并明确合并重复六道的加强影响。
- `/qizheng` 与 `/ziwei` 都只向客户交付出生资料表单 + 白话专题报告；技术盘、星位轮、宫位表、计算 profile 与内部状态不进入客户画面。

没有新的可复现 FAIL 时，不得因为旧 Issue / 旧聊天复活已废止实现。

## 3. 报告产品唯一结构（2026-08-29 最新）

**固定九页、四核心区、多编号 session、多张报告卡全部废止。**

客户可见完整报告是一张连续报告纸面，顺序只有：

**总体概括 → 身体需要注意的地方**

- 总体概括合并直接答案、与本题有关的命理依据、时间节奏、现实行动与确实相关的条件，不再拆成独立卡片；站主维护的修心／命理建议如命中题目，只能最多两条并入同一个总体概括，不能新增第三层。
- 身体需要注意紧接总体概括之后，在同一张报告纸面里用小标题与细线区分，不是第二张报告卡。
- 新报告数据使用 `summary / body`；历史 `conclusion / basis / timing / action / relationship / ninePages` 仅作兼容读取，并入同一连续 renderer。
- 茶仙守护继续作为独立 `/tea-guardian` 工具，**不自动附加到完整报告底部**。
- 命诰图独立于文字报告，由用户主动生成；图片失败、额度不足或旧图读取失败都不得让文字报告消失。

唯一产品契约：`docs/FOCUSED-REPORT.md` + `src/lib/report/focused-report.ts` + `src/components/paid-report-pages.tsx`。

## 4. 客户报告内容硬规则

- 不输出自问自答、内部推理、实现说明、模型说明、UUID、时间戳、方法状态。
- 第一段直接回答用户真正问的事。
- 不为职业题自动塞感情／财务；不为感情题自动塞工作／财务。
- 复合问题只回答实际问到的主题，并在同一总体概括里组织。
- 旅行／去哪里题必须直接给目的地与执行顺序，不反问补城市。
- 未实现能力不得包装成已完成：格局体用、正式病药、完整刑冲合害、完整岁运作用链仍需独立验证。
- 身体栏属于传统象义提醒，不是医疗诊断。
- 图失败不能拖死文字报告。

## 5. 当前视觉系统（2026-08-29 最新）

视觉母版是暖米宣纸／宋式图谱体系。全站应用页按「一幅锁死在页面里的东方长卷」处理：

- Header 已承担品牌识别，正文不再重复一张巨大的「昭梧」品牌 Hero 卡；只保留紧凑引导后直接进入分析表单。
- 全站应用页与登入页使用仓库固定资产 `/wallpaper-song.jpg` 作为宋山水宣纸背景；它是静态打包资产，不是 Supabase owner/weekly wallpaper。
- 表单、结果、命诰、登入纸面与工具卡一律使用不透明暖米宣纸 `#fbf5e9` / `#fffaf1`，禁止玻璃拟态与半透明卡。山水只从卡片四周的页面背景露出。
- 主 CTA 朱砂红、语言选中青玉绿、正文墨色、边线淡金茶色。
- iPhone 390–430 px 优先；不使用 `background-attachment: fixed`，避免移动 Safari 滚动问题。
- 动态 owner/weekly wallpaper 继续不参与前台 shell；图库资产本身不删除，继续用于内容与命诰匹配。
- 完整报告为一张连续暖宣纸阅读面，不再使用紫黑大底、ornament rail、龙贴纸或多张 section 卡。
- 青玉小龙 AI 导览、Gallery 命诰匹配与真实命诰图生成逻辑不因 UI 改版改变。

最终视觉覆盖层：`src/home-sheet-ui-v5.css`；报告层：`src/focused-report.css`。

## 6. 专题报告与 Calculation Truth Layer

`src/lib/ziwei/` 已进入确定性计算数据可用于生产的阶段；`/ziwei` 在后台保留版本化 calculation profile 和证据层，但客户只看到性格、事业、财务、关系、压力和当前人生阶段的白话报告。primary-source unanimity 仍为 false，紫微计算事实与八字核心保持分层，不得反向覆盖八字锁定逻辑。

`src/lib/qizheng/engine.ts` 继续负责七政真天象计算；`src/lib/qizheng/plain-summary.ts` 只做客户报告组合，不改动星体计算。客户报告发挥七政对性情、情绪节奏、行动压力、关系取向和机会落地的观察优势，不显示黄经轮盘与技术口径。

## 7. 当前真正未完成

- 六道轮回习气测验仍未落地。
- 正式子域名 `zhaowu.soul-terminal.com` DNS 收口。
- iPhone 关键流程最终实机验收。
- 八字 chart：完整刑冲合害库、正式病药通关、完整岁运作用链仍未实现。
- `force=true` 的供应商个性化命诰图仍依赖图片 API credits；默认 Gallery-direct 交付不得被其阻塞。

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

报告结构与首页视觉允许改组合层、UI、相关测试与兼容读取；不得借机改排盘核心、auth、payment 或 Supabase schema。

## 10. 接手规则

每次改网站之前：读 `AGENTS.md` 与本文件；查实时 main + Vercel Production；只处理当前可复现问题。新指令与旧指令冲突时，按 AGENTS 的安全 supersession 规则使旧 active path 失效，但不得破坏运行依赖。

## 2026-08-29 — 全站锁死宋画长卷 + 不透明宣纸卡

- 用户指令：主页和所有页面保持截图风格，不要透明，牢牢锁死在页面里。
- `src/home-sheet-ui-v5.css` 把 `/wallpaper-song.jpg` 应用到 `.zhaowu-home-sheet-shell` 与 `.zhaowu-login-shell`。
- 卡片 / header / 登入纸面改为不透明 `#fbf5e9`，输入底 `#fffaf1`，`backdrop-filter: none`。
- 不改排盘核心、auth、payment、Supabase schema。

## 2026-08-29 — 三个专题入口客户化重做

- 首页「前世今生」从错误的 `/tianji-dual` 改为真正的 `/yizhangjing`；`/tianji-dual` 恢复诚实的「性格两面」身份。
- 达摩一掌经报告交付前四世各自六道、逐世特征、携带习性、最近一世主轴与重复六道加重总结。
- 紫微与七政都改为 56px 以上出生资料输入和单张白话报告；客户画面不显示专业命盘、七政星位轮、计算 profile 或内部说明。
- 三个专题分别使用自己的强项，不共享同一套通用人格模板；不改锁定的八字、一掌经与七政计算核心。

## 2026-08-30 — 专题报告本机纪录与青玉小龙导航

- `/qizheng`、`/ziwei`、`/yizhangjing` 每次成功生成后，把客户实际看到的白话报告自动保存在当前装置；不改排盘核心、不新增 Supabase schema。
- 新增 `/history`「我的纪录」：可重看、重新分析、逐笔删除或清除当前装置上的专题报告；登入后的八字提问与云端报告继续由 `/account` 读取。
- 青玉小龙三语导航改为明确列出八字、七政、前世今生、紫微、性格两面和我的纪录，不再把达摩一掌经误导到性格两面。
- 客户修心报告移除小型 Gallery reference 图标与内部「交叉引用图库」说明；真实命诰图与其专属选择理由不受影响。
