# ZW-WEB-2026.09.01-r22

## Scope

新增独立免费「六道习气测验」，不调用 AI、不要求登录或出生资料，也不写入正式命盘、付费报告或达摩一掌经结果。

## Changes

- 新增 `/quiz/six-realms` 手机优先独立 route。
- 6 题逐题单选 A–F；未选择当前题时「下一题」不可用。
- A–F 分别对应天道、阿修罗道、人道、畜生道、饿鬼道、地狱道习气。
- 并列最高分保留全部并列结果，标记为「习气混合」，不强行 tie-break。
- 结果页只显示本次最高习气、A–F 分数、需留意处与观自身重点。
- 加入繁中、简中、英文三语文案及明确边界说明：趣味自省测验不等于前世判断，也不替代一掌经正式排盘。
- 首页「趣味测验」加入 SERIES 03 入口，直接进入 `/quiz/six-realms`。
- 新增 deterministic scoring regression tests：AAAAAA–FFFFFF 及 AABBCC 三道并列。

## Protected scope

未修改：

- `src/lib/palm/engine.ts`
- `src/lib/core/method.ts`
- `src/lib/bazi/calendar.ts`
- `src/lib/bazi/chart.ts`
- `src/lib/bazi/interpret.ts`
- `src/lib/actions.ts`
- auth / payment / Supabase schema / Edge Functions

## Acceptance status

代码与测试已提交到 feature branch。Production、iPhone Safari 与 release_history 仅在 CI、合并 main、Vercel Production READY 后记录，不提前声明通过。
