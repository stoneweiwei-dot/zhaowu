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
- `buddhist + dizang`
- `dragon-sticker + happy`

茶仙报告与茶仙测验优先读取 `tea-guardian + <tea.id>` 的当前主图；没有主图或网络加载失败时退回 repo 内置 WebP，不阻塞报告。

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
