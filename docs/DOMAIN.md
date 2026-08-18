# 域名：zhaowu.soul-terminal.com

主站 `soul-terminal.com` 继续给 WordPress。昭梧引擎只用子域名。

## DNS（只加这一条）

| 类型 | 主机 | 目标 | 不要动 |
|---|---|---|---|
| CNAME | `zhaowu` | Grok 发布页或 Vercel 显示的主机名 | 根记录 `@`、`www` |

TTL 300 即可。不要改 A 记录，不要买 SSL。

挂上之后：发布页填 `zhaowu.soul-terminal.com` → 等生效 → 手机打开一次做验收。
