# P0｜回答正确性与报告图热修

触发：2026-08-24 用户实测指出“随便问一个问题，回答都错得离谱；报告图也没有宣称的设计”。

本次只接受可验证修复，不以 CI/READY 代替产品正确性。

P0 修复范围：
1. `身强还是弱`、`旺衰/强弱/能量` 不再被“还是”误判成二选一。
2. 五行占比不得继续返回全 0。
3. 当前大运/流年对身强弱的影响必须逐项解释，并明确区分原局旺衰与岁运变化。
4. 出生盘 `hemisphere` 取出生地，不允许被现居城市覆盖。
5. `五行属性主导` 直接返回真实结构分布，不再回人格模板。
6. `具体适合去的国家和城市` 等目的地追问必须继续走旅行路径。
7. 指定月份内“较顺”与“保守”列表必须互斥，同一月份不得两边同时出现。
8. 英文旅行注意事项必须用英文回答实际注意事项，不得丢回中文月份模板。
9. 报告图生成器升级为明确的「昭梧・四柱绘意报告风 × 天龙八部/佛教八吉祥」视觉合同。
10. 旧图不能因为 `image_path` 存在而永久复用；视觉版本升级后必须生成新版。
11. 命诰图优先读取当前 `engine_snapshot.reading.decree`，旧九页只作历史 fallback。

验收记录：
- PR #66 已合并；merge commit `d4543d9e3d707eb57a11911324663cf3643f122e`。
- Production CI #331：deterministic tests、TypeScript、production build、package 全部通过。
- Supabase Edge Function `generate-decree-image` v4 已 ACTIVE，视觉版本 `tianlong-baji-v1-20260824`。
- Vercel branch preview 已有包含客户最终修正层的 READY 构建；Production 必须等 main 部署 SHA 对齐后才算线上验收完成。
