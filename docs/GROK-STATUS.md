# Grok 现况交接（给 GPT 读，不要去抓 Grok 分享页）

Grok 分享页是动态加载的，你抓不到正文。**以本仓库为准。**  
本文件 = Grok 已经做成的方案。下面点名的源码也已放进这个仓库。

- 正式域名（选定，DNS 还没挂）：https://zhaowu.soul-terminal.com
- 本仓库：https://github.com/stoneweiwei-dot/zhaowu
- 旧 GPT / AppDeploy 快照：https://github.com/stoneweiwei-dot/zhaowu-web-app-
- 旧 AppDeploy 运行时：https://204914e3adbfd65055.v2.appdeploy.ai/
- 主站 WordPress：https://soul-terminal.com （不要覆盖）

## 这是什么

Grok 在 App Builder 里重做了一份可运行的昭梧网站，栈是：

TanStack Start + React + Vite + Tailwind + Better Auth + PGlite/Neon

**不是** 旧的 AppDeploy 单页 HTML，也不是 WordPress。两边现在是两套代码。合并时不要把旧站的 MutationObserver / 双标题系统搬过来。

## 已经做成、请保留

1. **ZW-METHOD-1.1 路由** `src/lib/core/method.ts`  
   子平永远主判「已執行」。紫微／西占／吠陀／六爻等没有独立排盘就标「資料未接入」，不准反推。前世题走一掌经 + 三世因果歌。

2. **ZW-PALM-1.0** `src/lib/palm/engine.ts`  
   农历四宫、男顺女逆、闰月十五日切。  
   验收：1988-10-04 寅时男命 → 年辰天奸修罗、月亥天寿仙、日戌天艺修罗、时子天贵佛。  
   第一句给六道 + 主星。缺性别整盘不作判定。缺时辰时宫留白。前世报告 **0 AI**。

3. **子平排盘** `src/lib/bazi/chart.ts` + `calendar.ts` + `solar-time.ts`  
   真太阳时、节气月令、藏干、十神、纳音、十二长生、大运、胎元、命宫。月令按节气，不是公历月。

4. **直答语气** `src/lib/bazi/interpret.ts`  
   第一句给判断。禁止开场写「不知道 / 资料不足 / 仅供参考」。选择题必须选边。习惯从日主 + 日支 + 十神推出。

5. **完整报告**  
   前世：规则文本，不再调模型。  
   其他：规则底稿；有 `XAI_API_KEY` 才用 grok-4.5 扩写。提示词在 `src/lib/actions.ts` 的 `writeFullReport`。

6. **结果页** `src/components/result-view.tsx`  
   直答 + 节奏 + 命诰 + 行动 + 有用/不必放大颜色方位 + 折叠方法区（最多四卡）。

7. **登录与「我的昭梧」** Better Auth，登录后可存报告。

8. **印章散落** `src/components/marks.tsx` + `public/marks/*.webp`  
   小 webp，登录页不撒，避免拖慢。

## 还没做 / 已知漏洞（请 GPT 逐项挑）

| 项 | 现状 | 谁来补 |
|---|---|---|
| 九页付费报告母稿 | 现在是直答 + 一段白话报告，不是商业九页 | GPT 出结构与文案，Grok 接线 |
| 命诰图 9:16 卷轴图 | 没有出图，只有文字命诰 | GPT 出提示词／版式，Grok 再接 |
| 子平 12 步（从化→调候→病药…） | 有旺衰／喜用，未做成逐步引擎 | 先别假装已完成 |
| 南北半球风水 PDF | 只写了「南半球不反转五行」一句 | 未接入独立风水 |
| 登录后记住出生资料 | 没有 | 可开 `[给Grok]` |
| 追问同一张盘 | 没有对话续问 | 可开 `[给Grok]` |
| 紫微／西占／吠陀独立排盘 | 故意未接入 | 在有独立盘之前不准编 |
| 自定义域名 | 选定但 DNS 未挂 | Stone 加 CNAME |
| 两套网站 | Grok 新站 vs AppDeploy 旧站 | **不要双写 DOM**；新站吃规则，旧站只作参考 |

旧站 README 里的 iPhone 白屏（多个 MutationObserver 抢 form-title）**禁止带回新站**。

## 关键函数

- 问题分类：`classifyQuestion`（前世关键词最先）
- 选边：`leanChoice`（按「转/离」vs「留/稳」语义，不是数组位置）
- 一掌经步进：`step(startZhi, count, forward)`，offset = count-1
- 分析入口：`analyzeLife` → chart + palm + route + interpret
- 前世扩写短路：`writeFullReport` 若 `kind === "past"` 直接回规则文本

## 请 GPT 做的三件事

1. 读本文件 + 下列源码，标出 Grok 做对的、简陋的、违规的。  
2. 对照旧 AppDeploy / 命诰图美工，列出要合并的版式，不要改算法。  
3. 回在同一条 Issue，用表格：保留 / 改文案 / 交给 Grok 接线。

不要重写 `calendar.ts` 节气、`palm/engine.ts` 步进、`method.ts` 路由，除非先升版本号。
