# 昭梧｜REPORT VISUAL SYSTEM

Version: ZW-REPORT-VISUAL-1.0
Approved: 2026-09-04
Status: **P1 active product implementation direction**

> 本文件记录 Stone 2026-09-04 最新明确指令：昭梧报告采用「程式化 UI + 固定母图库 + 个人人段字段替换 + 少量专属 AI 图」的落地方案。
>
> 本指令只 supersede 与它冲突的**报告呈现层 / 视觉层**旧要求；不授权重写八字计算、auth、payment、Supabase schema、历史报告数据或生产路由。

## 0. 优先级

### P0 — 永远先处理

1. 白屏 / 无法进入 / 无法分析
2. 排盘或核心结论错误
3. 登录 / 报告读取 / 保存失败
4. 报告答非所问、前后答案不一致、泄露内部推理
5. 生产稳定性与 iPhone Safari 核心流程回归

### P1 — 当前最高产品改版

在 P0 无阻塞时，优先实施本报告视觉系统：

**结构化排盘结果 → 程式化报告 UI → 个人人段字段替换 → 母图匹配 → 必要时少量专属图生成。**

普通「纯视觉微调」仍低优先级；本 P1 不是普通美化，而是报告产品呈现架构升级。

## 1. 硬规则

1. **不得**让图片 AI 为每个用户即时生成整套 7–9 张完整 UI 页面。
2. UI、标题、正文、标签、按钮、图表均由前端 HTML/CSS/SVG/Canvas 渲染。
3. AI 只负责古画 / 意象图，不负责命理判断，也不得把正式中文字烤进图片。
4. 每位用户共用同一套前端模板，差异由后端字段和 visual key 决定。
5. 图片失败不得阻塞文字报告。
6. 日主、身强弱、喜忌、格局、大运、流年必须先由已验证计算层产生，再交给呈现层。
7. 当前尚未验证完整的「正式病药、完整刑冲合害、完整岁运作用链」不得因视觉模板存在就冒充已实现。
8. iPhone Safari 390–430 px 优先；首屏目标 ≤3 秒。
9. 不新增第二 Production，不借视觉改版改 auth / payment / Supabase schema。

## 2. 与现有 focused report 的关系

`summary / body` 仍是当前文字报告数据契约，第一段仍必须直接回答用户问题。

2026-09-04 起，旧文档中「完整报告只能是一张连续纸面、不得出现多张 section 卡」这一**呈现限制**被本指令取代。

允许的新呈现方式是：

- 一张完整主报告仍保留 `summary → body` 的内容逻辑；
- 在此之外增加「命之书 / 运之书」的**可视化阅读层**；
- 可视化阅读层可以使用滑动卡 / tabs，但不能恢复旧的 01、02、03… 编号 session，也不能把同一段文字拆碎重复生成。

## 3. 前端模块

### REPORT-00｜命之书总览

固定 UI，显示：

- 日主命象
- 月令时节
- 五行喜忌
- 格局病药（仅在后台结果足够可靠时显示正式判定，否则标为未验证 / 不显示）
- 大运流年入口

### REPORT-01｜日主命象

字段：

- `dayMaster`
- `dayMasterElement`
- `dayMasterYinYang`
- `dayMasterKeywords`
- `dayMasterSummary`
- `dayMasterVisualKey`
- `heavenImage`
- `earthImage`

UI：标题、主图、短文案、最多 4 个关键词、阴阳 / 五行 / 取象。

### REPORT-02｜月令时节

字段：

- `monthBranch`
- `season`
- `solarTermStart`
- `solarTermPeak`
- `seasonSummary`
- `seasonVisualKey`

月令文案不得只按四季粗分；月支与节气区间必须参与。

### REPORT-03｜五行喜忌

字段：

- `wood / fire / earth / metal / water`
- `strengthState`
- `usefulElements`
- `unfavorableElements`
- `climateState`
- `circulationSummary`

五行图必须用 SVG / CSS / Canvas 程式化绘制，不生成 AI 图表。

页面必须明确：比例只作气势可视化参考，不能直接等同喜忌判断。

### REPORT-04｜格局病药

仅在对应计算 / 判定已经通过独立验证后启用正式输出。

预留字段：

- `structureName`
- `structureConfidence`
- `structureSummary`
- `structuralProblems[]`
- `structuralRemedies[]`
- `structureKeywords[]`
- `structureVisualKey`

未验证时不得用模板文案猜结果。

### REPORT-05｜大运流年

实际年份 / 大运起止必须来自排盘结果。

预留字段：

- `majorLuckList[]`
- `currentMajorLuck`
- `currentYearStemBranch`
- `annualSummary`
- `annualVisualKey`

「少年 / 青年 / 立业 / 转折 / 成熟」如用于视觉，只是阅读节奏标签，不得冒充真实大运年份。

### ShareCard

另做前端 composition；不截整页，不依赖 AI 生成中文字。

内容：昭梧、标题、主图、一句核心描述、3–4 关键词、`STONE 原創`。

## 4. 图像资产三级制

### Level 1｜固定 UI 资产

宣纸、云纹、印章、细分隔线、淡山水底纹。永不即时生成。

### Level 2｜母图库

Storage / CDN 直接读取，失败可 fallback：

- 十天干日主母图：甲乙丙丁戊己庚辛壬癸
- 十二月令母图：寅卯辰巳午未申酉戌亥子丑
- 已验证常用结构 / 年运意象

首批目标：**10 日主 + 12 月令 = 22 张核心母图**。

### Level 3｜专属 AI 图

只用于：

- 最终专属命象图
- 高阶付费图
- 特殊分享图
- 必要的特殊流年主图

Level 3 失败 → 回退 Level 2；Level 2 失败 → 回退纯宣纸 / 淡墨背景；文字始终正常交付。

## 5. 日主母图 visual key

- 甲木 `jia-wood`：参天乔木、青山、生发
- 乙木 `yi-wood`：花木、藤萝、柔条
- 丙火 `bing-fire`：日轮、朝阳、光照山川
- 丁火 `ding-fire`：灯火、星火、幽室微明
- 戊土 `wu-earth`：高山、城垣、厚土
- 己土 `ji-earth`：田园、沃壤、平畴
- 庚金 `geng-metal`：秋山、矿石、锋锐之象；避免游戏武器海报
- 辛金 `xin-metal`：珠玉、白石、霜露
- 壬水 `ren-water`：江河、瀑布、大川
- 癸水 `gui-water`：雨露、溪泉、雾气

## 6. 月令母图 visual key

- `yin-spring`
- `mao-spring`
- `chen-spring`
- `si-summer`
- `wu-summer`
- `wei-summer`
- `shen-autumn`
- `you-autumn`
- `xu-autumn`
- `hai-winter`
- `zi-winter`
- `chou-winter`

可先用 `spring-general / summer-general / autumn-general / winter-general` 作为开发 fallback，但正式匹配优先十二月令。

## 7. 视觉规范

- 旧宣纸宋系图谱风
- 暖米白 / 陈纸黄 / 淡茶褐 / 灰米
- 低饱和、低对比、柔亮矿物色
- 宋系山水、花木、瑞象
- 细金茶边线
- 不使用现代高清 CG 玄学海报
- 不使用强发光、塑料高饱和、玻璃拟态
- 正式文字必须由浏览器渲染
- 默认移动端纵向适配；分享 / 专属图仍以 9:16 为主
- 水印：`STONE 原創`，由前端或后期叠加

## 8. 性能

- 首屏文字不等待图片
- 除首屏必要图外全部 lazy load
- 优先 WebP / AVIF
- 母图至少提供 thumbnail / medium / full 或等效 responsive variants
- 不在首页一次加载所有 full-size 图
- 任何 asset failure 不得造成白屏

## 9. 实施顺序

### Phase 1

1. REPORT-00 命之书总览
2. REPORT-01 日主命象
3. REPORT-02 月令时节
4. REPORT-03 五行喜忌
5. 10 日主 + 12 月令母图库路径 / fallback

不要求即时 AI 图。

### Phase 2

1. REPORT-04 格局病药（前提：判定层已验证）
2. REPORT-05 大运流年
3. 运之书

### Phase 3

1. ShareCard
2. 最终专属命象图
3. 高阶付费 AI 图像

## 10. QA

必须覆盖：

- iPhone Safari 390–430px
- `zh-Hant / zh-Hans / en`
- 未知时辰
- 图片 404 / 生成失败 / 慢网
- 刷新 / 重登
- 水平 swipe / tabs / 返回
- 分享与保存到手机
- 首屏 3 秒硬退出 / 降级原则不回归
- 不恢复「性格两面」旧入口
- 不恢复旧编号多 session
- 不改八字计算、auth、payment、Supabase schema

## 11. 当前执行边界

本文件是**产品与实现方向的 P1 契约**，不是声称 Phase 1–3 已经完成。

在代码实际接入、测试、Production 部署和手机证据完成前，状态只能按 AGENTS.md 使用：Analysed / Modified / Committed / Deployed / Live / Verified，不得虚报完成。
