# Grok / GPT 现况交接

> **本文件不再维护第二份状态。** 当前唯一状态来源： [CURRENT-STATE.md](./CURRENT-STATE.md)。

任何接手者先读 `CURRENT-STATE.md`，再读：

- `../COLLAB.md`
- `CONTRACT.md`
- `SPEC.md`
- `NINE-PAGE.md`
- `PAID-REPORT-STYLE-v1.0.md`

## 当前最重要的防返工规则

1. 唯一源码：`stoneweiwei-dot/zhaowu` → `main`。
2. 唯一生产：Vercel `stone-zhaowu-official`。
3. 唯一数据库/Auth：当前 Supabase。
4. Netlify、AppDeploy、Grok 临时站只读参考。
5. 客户收费报告只认九页；旧 23 页 pageArchitecture 已废止。
6. 已经被后续 production commit 修好的旧 Issue，不得再次当成待办。
7. 只有当前仍可复现的 FAIL 才改代码。
8. Loading / Logo / Hero 没有新回归时冻结。
9. 不重写锁文件，不搬回 AppDeploy MutationObserver / 双标题系统。

详细生产 commit、deployment、已完成/未完成项、优先级全部见 `CURRENT-STATE.md`。
