# 昭梧图库与公开媒体交付

## 当前架构

昭梧图库采用「Supabase 管理源 + Vercel 同源公开交付」的混合架构，不再把所有客户公开浏览流量直接打到 Supabase Storage。

- Supabase project: `plgpxusmemnmzckbwtiv`
- Owner 图库 bucket: `zhaowu-gallery`
- Owner 背景 bucket: `zhaowu-backgrounds`
- 私有报告图 bucket: `zhaowu-report-images`
- 音频 bucket: `zhaowu-audio`
- Metadata table: `public.gallery_assets`
- Owner UI: `/gallery`
- 客户公开吉象图鉴：Vercel same-origin 静态资源

Supabase 继续承担站主上传、启用/停用、元数据、私人报告图与需要权限控制的资产；客户公开图鉴优先读取 repo `public/` 内已经优化的 WebP/缩图，不在浏览阶段读取 `gallery_assets` 或 `zhaowu-gallery` 原图。

## 公开吉象图鉴

客户公开图鉴由 `src/lib/public-atlas.ts` 的静态 registry 控制。目前正式公开素材来自：

- `/report-visuals/full/*.webp`
- `/report-visuals/thumb/*.webp`
- `/ornaments/generated/*.webp`

展示规则：

1. 首页 `#auspicious-atlas` 每次只显示 1 张代表图，不展开整库。
2. `/auspicious-atlas` 首次显示 24 张，其余每次再加载 24 张。
3. 列表/网格优先使用 `thumbnailUrl`；用户点开才进入 `url` 对应的完整图。
4. 图片继续使用 lazy loading 与 async decoding。
5. 图鉴请求失败不得阻塞首页、分析、登入、账户或文字报告。
6. 客户公开图鉴不得在运行时请求 Supabase `gallery_assets` 或 `/storage/v1/object/public/zhaowu-gallery/`。

Owner `/gallery` 仍是站主上传与管理入口。Owner 上传不等于自动进入客户公开图鉴；公开发布前应先生成轻量 WebP/AVIF 与缩图，再更新 same-origin registry/manifest。

## 静态资源缓存

Vercel 对公开视觉静态目录使用浏览器缓存与 stale-while-revalidate：

- `/report-visuals/*`
- `/ornaments/*`
- `/gallery/loading/*`
- `/tea-guardians/*`

HTML、manifest 与 service worker 继续使用 no-store/no-cache 策略，避免应用壳长期卡旧版本。

## 背景库现况与清理边界

`zhaowu-backgrounds` 不再参与客户前台 shell 的动态背景轮播，但 Storage 中仍存在历史资产。2026-09-11 实际盘点为 291 个对象、约 598.19 MB；其中 196 张 PNG 约 552.38 MB。

数据库 `public.background_assets` 仍有多条 `enabled = true` 的历史 daily-rotation 记录，因此不得仅凭「前台已停用动态背景」直接物理删除 bucket。清理顺序固定为：

1. 确认代码与生产页面没有运行时引用。
2. 核对 `background_assets` 元数据与仍需保留的品牌/后台资产。
3. 先将需保留资产迁移/压缩到明确的新位置。
4. 再停用历史 metadata。
5. 最后才通过 Storage API 删除确认无引用的对象。

禁止直接对 `storage.objects` 做 SQL 删除来代替 Storage API。

## 音频现况

2026-09-11 `zhaowu-audio` 仍有 4 个 WAV，合计约 30.28 MB：

- `background/uploads/2026-09-08/28f2257c-a653-4d26-b10a-e6625b0a49d0.wav`
- `background/uploads/2026-09-08/393d7fb9-2712-44fd-8506-54a4eb74fcf4.wav`
- `background/uploads/2026-09-07/c7bee6de-d5ef-4d83-b437-4c796d5be45a.wav`
- `background/uploads/2026-09-07/2fcdf80e-f345-4172-8f0c-5cf5094e06c6.wav`

这批 WAV 需要先确认实际引用，再转为 AAC/M4A 并切换引用；验证新格式播放正常后才能删除旧 WAV。

## 私有报告图

`zhaowu-report-images` 保持 Supabase 私有交付，不并入公开 Vercel 图鉴，也不进入公开静态 registry。报告图失败不得让文字报告消失。

## 图库寻址与分组

Owner 侧继续按 `category + asset_key` 管理。同一组合可保留历史图，但应只有一个当前主图。常见类别包括：

- `tea-guardian`
- `background`
- `visual-library`
- `dragon-sticker`
- `loading`

`reference-*` 纯参考图只留后台；`loading`、`background`、`tea-guardian` 等各自保留用途，不因公开图鉴改为 same-origin 而改变后台分类。

## 客户可见的选图解释

「为什么选这张图」只解释图像本身的象征，以及它如何呼应该次问题、分析核心与当下需要。客户界面不得展示内部匹配算法、提示词、评分、图库比较或实现说明。

## 权限与格式

- 公共网站：读取已发布的 same-origin 静态资源。
- 站主：通过 Owner UI 管理 Supabase 资产。
- 私人报告图：继续走受控 Supabase 交付。
- 新公共美工素材优先 WebP/AVIF；列表必须提供 thumbnail。
- 原始 PNG/JPEG 只作为源文件或确有必要的 fallback，不应成为高频公开浏览默认格式。
