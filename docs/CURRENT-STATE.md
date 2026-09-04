# 昭梧｜CURRENT STATE

最后核对：2026-09-04 12:18 AEST

> **这是项目唯一“当前状态”来源。** 旧 Issue、旧部署说明、旧聊天记录与本文件冲突时，以本文件 + 当前 `main` + 当前 Vercel Production + 当前 Supabase 为准。

## 1. 唯一生产主线

| 项             | 当前唯一真相                                                           |
| -------------- | ---------------------------------------------------------------------- |
| GitHub         | `stoneweiwei-dot/zhaowu`                                               |
| Branch         | `main`                                                                 |
| Hosting        | **Vercel**                                                             |
| Vercel project | `stone-zhaowu-official` (`prj_81IIJjyeM3l47ZPsiIE7d6eOrp9I`)           |
| Production URL | `https://stone-zhaowu-official.vercel.app/`                            |
| Database/Auth  | **Supabase** project `plgpxusmemnmzckbwtiv`                            |
| 正式子域名     | `zhaowu.soul-terminal.com`；DNS 未完成前继续使用 Vercel production URL |

每次接手实时检查 `main` 与 Vercel Production 的 `githubCommitSha`，禁止另建第二条 production 主线。Netlify、AppDeploy、Lovable standby、旧临时站只读参考。

## 7. 当前真正未完成

- Loading 前台目标：站主提供的並蒂蓮池原片（FCA79DBB-D0FC-48B7-9D9B-8F566427DEE1.mp4，5.04s 720×1280）完整作为 `/intro/loading-owner-r40.mp4`。
- 代码已接好：`IntroGate` 指向该路径，`LOTUS_BLOOM_MS=5000`，`HARD_EXIT_MS=5300`，`scripts/write-intro-media.mjs` 期望 80 个 `loading-owner-r40.part.NN`，SHA256 `e07dd134da5c77f2dc0fd97d846a42bdbca1645584d7990f4c6b51770424072c`。
- **分片尚未上到 main。** 因此 production 请求 `/intro/loading-owner-r40.mp4` 仍回 SPA `index.html`（content-type text/html）。影片 onError 会放行站点，所以首页可用，但播放的不是这支 5 秒双生莲。
- 本地已有合格编码：`artifacts/intro-r40/loading-owner-r40.mp4` 786587B，CRF26、yuv420p、muted、720×1280、5.04s。
- 外部阻塞：此环境只能用 GitHub 文本 API 推文件，无法一次写入 787KB 二进制；80×13KB 分片需继续分批推完后，build 才会还原出正式 mp4。
