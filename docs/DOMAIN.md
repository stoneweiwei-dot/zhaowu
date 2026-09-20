# 域名：zhaowu.soul-terminal.com

主站 `soul-terminal.com` 继续给 WordPress。昭梧只用子域名。

## 当前状态

| 项 | 状态 |
|---|---|
| 正式域名 | `zhaowu.soul-terminal.com`（DNS 尚未挂上） |
| 根站 | `soul-terminal.com`，不要动 |
| 主生产平台 | **Vercel**（唯一 Production） |
| Vercel 项目 | `stone-zhaowu-official` |
| 当前 canonical URL | `https://stone-zhaowu-official.vercel.app/` |
| Archive only | Netlify `archive-stone-zhaowu-official`（无 runtime / 无 API / 无自动 build） |
| GitHub 仓库 | `stoneweiwei-dot/zhaowu` |
| Git 分支 | `main`（唯一 source of truth） |
| Supabase | 当前正式 Supabase project |
| AppDeploy / Grok 临时站 | **只读参考** |

这是当前唯一 canonical 生产目标。Netlify 仅保留历史 archive，不得再承担登入、报告、音乐或其他正式 `/api/*` 流量。

**不要在本文件写死 deployment ID 或 main SHA。** 每次检查时实时确认 GitHub `main` 与 Vercel Production；GitHub `main` 是源码真相，Vercel 是唯一 Production runtime。

项目总状态以 [CURRENT-STATE.md](./CURRENT-STATE.md) 为准。

## DNS 规则（待挂正式子域名时）

在 Vercel 项目中添加 `zhaowu.soul-terminal.com` 为 custom domain；接受后，再到 `soul-terminal.com` 当前 DNS 提供商新增：

| 类型 | 主机 | 目标 | 不要动 |
|---|---|---|---|
| CNAME | `zhaowu` | Vercel 后台为该项目显示的 CNAME 目标 | 根记录 `@`、`www` |

TTL 300 即可。不要改根站 A 记录，不要改 `www`，不要另买 SSL；TLS 交给 Vercel。

## 验收顺序

1. `https://stone-zhaowu-official.vercel.app/` 保持可用且 Production SHA = main SHA；
2. Vercel 添加并接受 `zhaowu.soul-terminal.com`；
3. DNS 仅新增 `zhaowu` CNAME → Vercel 指定目标；
4. DNS 生效后确认 `https://zhaowu.soul-terminal.com` HTTPS 正常；
5. iPhone 实机：主页 → 登录 → 分析 → 完整报告 → 保存 → 我的昭梧／站主后台；
6. `soul-terminal.com` 与 `www` 继续保持原 WordPress，不得被昭梧覆盖。

## 禁止事项

- 不把 Netlify archive 当成 canonical 主站或 runtime。
- 不另建第二个 Vercel 项目。
- 不覆盖 `soul-terminal.com` WordPress 根站。
- 不恢复 Netlify Functions 或 Continuous Deployment。
