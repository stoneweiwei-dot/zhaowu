# 昭梧｜CURRENT STATE

最后核对：2026-08-22（AEST）

> **这是项目唯一“当前状态”来源。** 任何 Agent、Grok、GPT 或人工接手前先读本文件；旧 Issue、旧部署说明、旧聊天记录与本文件冲突时，以本文件 + 当前 `main` + 当前 Vercel Production + 当前 Supabase 为准。

## 1. 唯一生产主线

| 项 | 当前唯一真相 |
|---|---|
| GitHub | `stoneweiwei-dot/zhaowu` |
| Branch | `main` |
| 当前 main HEAD | `5f81f2be03eeb2c314c418edc80be7316596c6d1` |
| Hosting | **Vercel** |
| Vercel project | `stone-zhaowu-official` (`prj_81IIJjyeM3l47ZPsiIE7d6eOrp9I`) |
| Production URL | `https://stone-zhaowu-official.vercel.app/` |
| 当前 Production deployment | `dpl_8JJeXGj8DSrYVrMZ1QAECzSS7QcQ` — READY |
| Database/Auth | **Supabase** project `plgpxusmemnmzckbwtiv` |
| 正式子域名 | `zhaowu.soul-terminal.com`；DNS 未完成前继续使用 Vercel production URL |

**禁止再建立或恢复第二条 production 主线。** Netlify、AppDeploy、Grok 临时站、旧仓均只读参考，不得作为当前生产目标。

## 2. 已完成且默认锁住，不要重复重做

- GitHub `main` → Vercel Production 已自动同步。
- Vercel Production 当前 READY，正式 URL 可返回 200。
- Supabase 正常；`report_requests` 已存在成功的 `report_ready` / `full_ready` 记录，当前没有 generation/image error。
- 三语 Locale 已包含 `zh-Hant / zh-Hans / en`。
- Supabase 登录、报告存档、背景、访问统计、release history 已接入。
- X 登录选项已移除。
- Loading 的 ghost overlay 已移除；除非出现可复现回归，**不要再改 Loading / Logo / Hero**。
- 客户九页报告已经做过“去内部推理 / 去自问自答 / 去 UUID、时间戳、方法状态”的清理。

以上项目没有新的可复现 FAIL 时，禁止因为旧 Issue 再开工。

## 3. 报告产品唯一结构

客户可见完整收费报告只认 **九页**：

1. 你真正问的事
2. 命盘概览
3. 你整个人生怎么运转
4. 反复出现的课题
5. 个人命诰
6. 怎么把这张盘用到现实里
7. 生活环境／颜色·方位·时段
8. 现在最该做的一件事
9. 给你的最后一句

以 `docs/NINE-PAGE.md` 与 `src/lib/report/nine-page.ts` 为内容结构真相。

**23 页旧 pageArchitecture 已废止，不得再作为客户产品结构。** 四柱绘意、瑞兽、法器、最终订制画属于九页报告中的视觉表达/附加成像能力，不再另起一套 23 页客户报告。

## 4. 唯一视觉规范

名称：**昭梧・四柱绘意报告风**。

核心：
- 东方现代绘意 × 宋系册页 × 极简象征主义。
- 暖米白／象牙白／淡宣纸，轻颗粒、旧印刷/版画感，大量留白。
- 插画与正文分区清楚；优先“左图右文 / 单页单结论”，不要做复杂仙侠海报。
- 默认 9:16 iPhone 优先；PDF/A4 重新排版。
- `STONE 原創` 由程序后期叠加。
- 视觉必须由全局命局推导，禁止“看到壬画水、看到寅画虎”的单柱套图。
- 时柱负责“未来出口 / 行动 / 法器”，但法器必须结合全局喜用、流通、合冲刑害后决定。

详细规则：`docs/PAID-REPORT-STYLE-v1.0.md` 与 `src/lib/report/paid-report-style.ts`。

## 5. 当前真正未完成 / 可继续做

只处理有明确验收标准的剩余项：

- Issue #24：六道轮回习气测验（尚未落地）。
- 正式子域名 `zhaowu.soul-terminal.com` DNS 收口。
- 实机 iPhone 对关键流程最终验收；只有真实 FAIL 才修。
- 其他新功能必须另开 Issue，并且先确认不与已完成项重复。

## 6. 生产优先级

出现多个问题时固定按这个顺序：

1. 白屏 / 无法进入 / 无法分析
2. 排盘或核心结论错误
3. 登录 / 报告读取 / 保存失败
4. 九页客户报告内容错误或泄露内部推理
5. 报告图 / 四柱绘意生成
6. 后台管理
7. 纯视觉微调

低优先级不得阻塞高优先级。

## 7. 锁定边界

没有单独版本升级与明确验收时，不重写：

- `src/lib/palm/engine.ts`
- `src/lib/core/method.ts`
- `src/lib/bazi/calendar.ts`
- `src/lib/bazi/chart.ts`
- `src/lib/bazi/interpret.ts` 分类顺序
- `src/lib/actions.ts` 前世 0-AI 短路

禁止搬回 AppDeploy 的 MutationObserver / form-title 双标题系统。

## 8. 接手规则

每次准备改网站之前，只做三件事：

1. 读本文件。
2. 查 `main` 当前 HEAD 与 Vercel Production 对应 commit。
3. 只处理“当前仍能复现”的问题。

**不得根据已关闭/过时 Issue 重新修改已经通过的功能。**
