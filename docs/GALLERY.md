# 昭梧统一图库

## 唯一资源库

- Supabase project: `plgpxusmemnmzckbwtiv`
- Storage bucket: `zhaowu-gallery`
- Metadata table: `public.gallery_assets`
- Owner UI: `/gallery`

图库用于长期内容资产，不把可替换图片写死进程序。GitHub `public/` 内现有图片只保留为必要的稳定 fallback。

## 寻址规则

网站按 `category + asset_key` 找图。同一组合可以保留多张历史图，但最多只有一张 `enabled + is_primary` 当前主图。

示例：

- `tea-guardian + dahongpao`
- `tea-guardian + longjing`
- `background + site-wallpaper`
- `visual-library + <asset_key>`
- `dragon-sticker + happy`

茶仙报告与茶仙测验优先读取 `tea-guardian + <tea.id>` 的当前主图；没有主图或网络加载失败时退回 repo 内置 WebP，不阻塞报告。

## 昭梧吉象图鉴

公开「昭梧吉象图鉴」继续复用同一个 `visual-library`，不新建第二图库，也不复制 Storage 对象。

当前公开候选规则：

- 所有 `enabled` 的 `visual-library` 主视觉图均可进入图鉴，包括既有圣像／道韵／瑞兽／吉祥／报告图，以及后续 `img-*` 上传图。
- `reference-*` 纯参考图继续只留后台，不进入客户图鉴。
- `background`、`dragon-sticker`、`tea-guardian` 保持各自原用途，不混入吉象图鉴。
- 前台只呈现一个混合图鉴，不向客户暴露佛／道等人工硬分类。

展示方式固定为两层：

1. 首页 `#auspicious-atlas` 只显示 6 张代表图和「进入完整图鉴」入口，禁止把整库在主页一次展开。
2. 独立 `/auspicious-atlas` 才是完整浏览页，首次显示 24 张，其余每次再加载 24 张；所有图片继续 lazy loading。

任一图片或图库请求失败都不得阻塞首页、分析、登入、账户或报告。图鉴是增强内容，不是核心分析依赖。

Owner UI `/gallery` 仍是唯一上传入口，并保留「吉象图鉴／全部图片」两个检视。系统内部可继续利用既有键位、语义审计与匹配资料做自动整理，但不要求站主手工维护宗教分类，也不改变 Supabase schema 或反向影响八字判断。

## 客户可见的选图解释

「为什么选这张图」只解释这张图本身的象征，以及它如何呼应该次用户的问题、分析核心和当下需要。文案要让用户理解「这张图为什么属于我这次的分析」。

客户界面不得展示系统选图流程、五行视觉匹配、作品库比较、算法、提示词、内部评分，或「图片不会反过来改动命理判断」之类的实现说明。若旧报告缺少足够且可验证的图像语义资料，宁可不显示理由，也不要用内部机制说明补位。

## 权限

- 公共网站：只读已启用图片。
- 站主：可上传、启用/停用、设为主图、删除。
- 单图限制：10 MB。
- MIME：JPEG / PNG / WebP / AVIF。

## 旧背景库清理

2026-08-27 按站主明确指示清空旧 `zhaowu-backgrounds`：251 个对象及对应 251 条 `background_assets` 元数据均已删除；私有 `zhaowu-report-images` 未动。
