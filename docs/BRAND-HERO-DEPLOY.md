# 给 Grok：发布首页品牌新版

## 要做

把 `main` 当前最新版直接发布到昭梧唯一生产主干。

本次前台改动已在 main：

- `854b46e` — slogan / i18n
- `405dc82` — 首页 Hero 结构
- `5d59173` — 品牌字标与字体层级
- `8df7ce9` — 品牌 Hero 规格记录

最终文案：

- 昭梧
- 昭于未见，栖于有梧。
- 知命，不是认命；是看清之后，知道往哪里走。
- See what lies unseen. Find where you belong.

## 不要做

- 不开 AppDeploy 平行版
- 不改 `palm/engine.ts`、`core/method.ts`、`bazi/calendar.ts`、`chart.ts`
- 不另起第二套产品
- 不动 `soul-terminal.com` 根站

## 发布验收

1. iPhone 首屏能正常打开，无白屏、无横向滚动。
2. 首页大字「昭梧」清晰，不被印章或导航遮挡。
3. 主 slogan 显示为「昭于未见，栖于有梧。」（繁体模式对应繁体）。
4. 字体有宋体骨架与设计字距，但不加载额外第三方字体资源。
5. 原有分析表单、今日总览、登录、报告功能不受影响。
6. 发布仍指向本仓 `stoneweiwei-dot/zhaowu`。

## 部署说明

当前 `docs/DOMAIN.md` 仍写明部署目标未锁定；Vercel 连接账号目前没有项目。请由现有 Grok 主干承载方发布，不要为了这次文案改动新建平行部署。
