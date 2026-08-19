# 域名：zhaowu.soul-terminal.com

主站 `soul-terminal.com` 继续给 WordPress。昭梧只用子域名。

## 当前状态

| 项 | 状态 |
|---|---|
| 正式域名 | `zhaowu.soul-terminal.com` |
| 根站 | `soul-terminal.com`，不要动 |
| 生产平台 | **Netlify** |
| Netlify 项目 | `stone-zhaowu-official` |
| 当前生产 URL | `https://stone-zhaowu-official.netlify.app` |
| 当前生产 deploy | `6a860f304b277fa443df8d72`（ready） |
| CNAME 目标 | `stone-zhaowu-official.netlify.app` |
| DNS | **尚未挂到正式子域名** |

这是唯一生产目标。Grok 临时网址与 AppDeploy 旧站均不再作为生产主干。

## DNS 规则

先在 Netlify 项目里添加 `zhaowu.soul-terminal.com` 为 custom domain；Netlify 接受后，再到 `soul-terminal.com` 当前 DNS 提供商新增：

| 类型 | 主机 | 目标 | 不要动 |
|---|---|---|---|
| CNAME | `zhaowu` | `stone-zhaowu-official.netlify.app` | 根记录 `@`、`www` |

TTL 300 即可。不要改根站 A 记录，不要改 `www`，不要另买 SSL；TLS 交给 Netlify。

## 验收顺序

1. Netlify 原始生产 URL `https://stone-zhaowu-official.netlify.app` 保持可用；
2. Netlify 添加并接受 `zhaowu.soul-terminal.com`；
3. DNS 仅新增 `zhaowu` CNAME → `stone-zhaowu-official.netlify.app`；
4. DNS 生效后确认 `https://zhaowu.soul-terminal.com` HTTPS 正常；
5. iPhone 实机：主页 → 登录 → 分析 → 九页／命诰 → 保存 → 我的昭梧／站主后台；
6. `soul-terminal.com` 与 `www` 继续保持原 WordPress，不得被昭梧覆盖。
