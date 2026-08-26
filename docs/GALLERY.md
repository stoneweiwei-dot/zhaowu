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

## 权限

- 公共网站：只读已启用图片。
- 站主：可上传、启用/停用、设为主图、删除。
- 单图限制：10 MB。
- MIME：JPEG / PNG / WebP / AVIF。

## 旧背景库清理

2026-08-27 按站主明确指示清空旧 `zhaowu-backgrounds`：251 个对象及对应 251 条 `background_assets` 元数据均已删除；私有 `zhaowu-report-images` 未动。
