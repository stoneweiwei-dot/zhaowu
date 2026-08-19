# 域名：zhaowu.soul-terminal.com

主站 `soul-terminal.com` 继续给 WordPress。昭梧引擎只用子域名。

## 当前状态

| 项 | 状态 |
|---|---|
| 正式域名 | `zhaowu.soul-terminal.com` |
| 根站 | `soul-terminal.com`，不要动 |
| DNS | **未挂** |
| 当前部署目标 | **未锁定；不得猜** |

`DOMAIN.md` 是域名接线的唯一来源。以后不能再写「Grok 或 Vercel 二选一」这种模糊目标。

## DNS 规则

只有当当前生产部署平台已经给出**唯一、可验证的 CNAME 主机名**时，才加这一条：

| 类型 | 主机 | 目标 | 不要动 |
|---|---|---|---|
| CNAME | `zhaowu` | `<ACTIVE_DEPLOYMENT_HOST>` | 根记录 `@`、`www` |

在 `<ACTIVE_DEPLOYMENT_HOST>` 没有被替换成真实主机名之前：**不要改 DNS。**

TTL 300 即可。不要改 A 记录，不要买 SSL；TLS 交给实际部署平台签发。

## 谁可以填部署目标

部署方（Grok／Vercel／其他实际承载方）必须先给出：

1. 当前生产发布 URL 能正常打开；
2. 平台后台显示的自定义域名 CNAME 目标；
3. 该目标只对应一个生产部署，不同时保留两个候选。

然后把这里的 `<ACTIVE_DEPLOYMENT_HOST>` 改成那个**准确主机名**，再动 DNS。

## 验收顺序

1. 先验证平台原始发布 URL 可打开；
2. 平台接受 `zhaowu.soul-terminal.com` 作为 custom domain；
3. 再加 CNAME；
4. 等 DNS 生效后确认 HTTPS 正常；
5. iPhone 实机打开：主页 → 登录 → 报告列表 → 打开一份报告；
6. `soul-terminal.com` 与 `www` 仍保持原 WordPress，不得被昭梧覆盖。
