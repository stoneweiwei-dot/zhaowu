# 域名：zhaowu.soul-terminal.com

主站 soul-terminal.com 继续给 WordPress / 旧 GPT 站。
昭梧新引擎用子域名，两边互不覆盖。

## 你要在域名后台加的一条 DNS

到 soul-terminal.com 的 DNS（Cloudflare / 域名注册商 / WordPress 后台）：

| 类型 | 主机记录 | 目标 |
|---|---|---|
| CNAME | `zhaowu` | 发布后给你的主机名（Grok 发布页或 Vercel 项目里会显示） |

不要改根域名 `@`，否则主站会挂。

## 然后

1. 打开 Grok 这次项目的「发布」页，看有没有「自定义域名」
2. 填 `zhaowu.soul-terminal.com`
3. 等 DNS 生效（通常几分钟到两小时）
4. 用手机开一次 https://zhaowu.soul-terminal.com 做验收

证书（HTTPS）由托管方自动签，不要自己买 SSL。
