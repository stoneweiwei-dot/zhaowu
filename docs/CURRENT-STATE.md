# 昭梧｜CURRENT STATE

最后核对：2026-09-09 19:40 AEST

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

- GitHub `main` 是唯一源码真相。Vercel Git 自动部署已关闭（`vercel.json` `git.deploymentEnabled=false`），生产发布需手动部署到 `stone-zhaowu-official`。
- Supabase 登录、报告存档、图库/背景资产、访问统计统一使用当前项目配置。
- 三语 Locale：`zh-Hant / zh-Hans / en`；前台登入只提供 Email＋密码，不再显示 Google、Apple、X 或其他第三方 OAuth 按钮。
- Loading ghost overlay 已移除。
- `finalizeReading` 是最终 Reading 单一来源；已保存报告不重新 live 算出另一套答案。
- 个人命请文字为证据型文案；真实命请图走私有 report image delivery，失败不得阻塞文字答案。
- Gallery/背景资产管理能力保留；全站应用页恢复 r23 固定宋画背景；后台资产管理保留，不能覆盖前台页面。
- 首页只保留一个主分析表单；三个专题入口分别进入 `/qizheng`、`/yizhangjing`、`/ziwei`。旧 `/tianji-dual` 仅保留运行兼容，不再作为“性格两面”独立分组、首页入口、青玉小龙入口或客户产品名称；不得复活旧入口。
- `/yizhangjing` 是首页唯一「前世今生」入口：以达摩一掌经排前四世六道、逐世特征与留到今生的习性，并明确合并重复六道的加强影响。
- `/qizheng` 与 `/ziwei` 都只向客户交付出生资料表单 + 白话专题报告；技术盘、星位轮、宫位表、计算 profile 与内部状态不进入客户画面。
- 首页各分组必须用简短三语说明回答两件事：用户“会知道自己的什么”与“这个体系最擅长看什么”；英文必须自然简洁，不做逐字直译。
- 「趣味测验」是独立的轻量自评系列，不冒充命盘；包含「内在动物 × 命局瑞兽」与「五行功能测验」。五行功能测验只判断当前需要训练的生长、启动、落地、收敛或恢复功能，不等同八字喜用神。
- 「六道习气测验」已独立落地于 `/quiz/six-realms`，只作当下日常惯性自评，不冒充死后去处、前世判定或一掌经排盘。

没有新的可复现 FAIL 时，不得因为旧 Issue / 旧聊天复活已废止实现。

## 3. 报告产品唯一结构（2026-08-29 最新）

**固定九页、四核心区、多编号 session、多张报告卡全部废止。**

客户可见完整报告是一张连续报告纸面，顺序只有：

**总体概括 → 身体需要注意的地方**

- 总体概括合并直接答案、与本题有关的命理依据、时间节奏、现实行动与确实相关的条件，不再拆成独立卡片；站主维护的修心／命理建议如命中题目，只能最多两条并入同一个总体概括，不能新增第三层。
- 身体需要注意紧接总体概括之后，在同一张报告纸面里用小标题与细线区分，不是第二张报告卡。
- 新报告数据使用 `summary / body`；历史 `conclusion / basis / timing / action / relationship / ninePages` 仅作兼容读取，并入同一连续 renderer。
- 茶仙守护继续作为独立 `/tea-guardian` 工具，**不自动附加到完整报告底部**。
- 命请图独立于文字报告，由用户主动生成；图片失败、额度不足或旧图读取失败都不得让文字报告消失。

唯一产品契约：`docs/FOCUSED-REPORT.md` + `src/lib/report/focused-report.ts` + `src/components/paid-report-pages.tsx`。

## 4. 客户报告内容硬规则

- 不输出自问自答、内部推理、实现说明、模型说明、UUID、时间戳、方法状态。
- 第一段直接回答用户真正问的事。
- 不为职业题自动塞感情／财务；不为感情题自动塞工作／财务。
- 复合问题只回答实际问到的主题，并在同一总体概括里组织。
- 旅行／去哪里题必须直接给目的地与执行顺序，不反问补城市。
- 病药／通关、刑冲合害关系库与原局→大运→流年→流月作用链均已接入；正式取用／喜用仍须继续全格局验证，不得把五行数量、颜色或方位直接当用神。
- 身体栏属于传统象义提醒，不是医疗诊断。
- 图失败不能拖死文字报告。

## 5. 当前视觉系统（2026-09-09 r98）

视觉母版是暖米宣纸／宋式图谱体系，品牌主體鎖定為松、日／月、山、水、雲。

- Header 使用圓形「昭梧＋松＋日＋雲紋」主 Logo（`/brand-ui/logo-primary.svg`），旁側文字字標保留；登入／帳戶／首頁使用同一套細圓框功能 Icon。
- PWA／加入主畫面使用深松綠圓角 App Icon（`/apple-touch-icon-r97.png`）；瀏覽器 tab 使用簡化松日 favicon。
- Footer 使用橫版「昭梧＋雲紋」標誌。
- 葫蘆只作靈籤／吉祥功能標（`/brand-ui/mark-gourd.svg`），不重新搶主 Logo。青玉小龍不是品牌 Logo。
- 同一畫面最多兩種裝飾母題。首頁現用「松枝＋山日分隔」；禁止松、月、山、雲、水、印章同時出現。
- 主按鈕金底松綠字膠囊；次按鈕／登出為 Ghost 金框。
- 夜間模式：深松綠／玄黑底、金線、月白字，Header 切換至 `logo-primary-night.svg`；禁止亮白大面積。
- r27：全站應用頁與登入頁使用米色宣紙底、朱印。固定山水背景已被站主本次指令取代；圖鑑海報不參與背景。
- 表單、結果、命請、登入紙面與工具卡一律使用不透明暖米宣紙 `#faf8f1` / `#fffaf1`，禁止玻璃擬態與半透明卡。
- iPhone 390–430 px 優先；不使用 `background-attachment: fixed`。
- 動態 owner 背景不再參與前台 shell；圖庫、後台上傳與管理獨立保留。
- 完整報告為一張連續暖宣紙閱讀面。
- 青玉小龍 AI 導覽、Gallery 命請匹配與真實命請圖生成邏輯不因 UI 改版改變。

最終視覺覆蓋層：`src/home-sheet-ui-v5.css` + `src/brand-ui-r97.css` + `src/brand-ui-r98.css`；報告層：`src/focused-report.css`。

## 6. 专题报告与 Calculation Truth Layer

`src/lib/ziwei/` 已进入确定性计算数据可用于生产的阶段；`/ziwei` 在后台保留版本化 calculation profile 和证据层，但客户只看到性格、事业、财务、关系、压力和当前人生阶段的白话报告。primary-source unanimity 仍为 false，紫微计算事实与八字核心保持分层，不得反向覆盖八字锁定逻辑。

`src/lib/qizheng/engine.ts` 继续负责七政真天象计算；`src/lib/qizheng/plain-summary.ts` 只做客户报告组合，不改动星体计算。客户报告发挥七政对性情、情绪节奏、行动压力、关系取向和机会落地的观察优势，不显示黄经轮盘与技术口径。

## 7. 当前真正未完成

- 正式子域名 `zhaowu.soul-terminal.com` DNS 收口。
- iPhone 关键流程最终实机验收。
- 八字 chart：刑冲合害关系库、结构病药／通关层与原局→大运→流年→流月作用链已经接入并有确定性测试；但「正式取用／喜用」尚未完成全格局验证，因此生活建议仍不得据此硬推颜色、方位、时段或宠物。
- 正式「制作我的命请图」按钮已改为请求 `force=true` 的供应商个性化图；真实 provider 成功仍依赖图片 API credits，失败时必须回退 Gallery-direct，且不得阻塞文字报告。
- Loading 使用站主原片：`IntroGate` 指向 `/intro/owner-lotus-bloom-r53.mp4` 與同名 JPEG 海報；目標退出為 2.4 秒、硬退出為 2.8 秒，初始化異常不得阻塞首頁、登入或賬戶入口。主畫面圖標為深松綠 App Icon `/apple-touch-icon-r97.png`。

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
