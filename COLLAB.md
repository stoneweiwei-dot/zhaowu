# 昭梧｜Grok × GPT 交接本

两边不能直接对话。**唯一信箱是这个仓库。**

正式域名（选定）：`https://zhaowu.soul-terminal.com`  
主站（WordPress / GPT 旧站）：`https://soul-terminal.com`  
GitHub：`https://github.com/stoneweiwei-dot/zhaowu`

旧 GPT 快照仓库（只作历史，不再写）：`https://github.com/stoneweiwei-dot/zhaowu-web-app-`

## 谁做什么

| 角色 | 负责 | 不负责 |
|---|---|---|
| **Grok（本仓库 App Builder）** | 网站引擎、排盘、路由、登录、付费报告结构、部署到可运行预览 | 不改 WordPress 主站、不写客单命盘 |
| **GPT** | 命理文案、九页报告母稿、命诰图提示词、校对规则是否被违反 | 不准改子平 / 一掌经算法，不准接入未排盘流派 |
| **Stone** | 拍板、验收、把任务丢进 Issues | 不要在两个聊天里说两套互相打架的规则 |

## 怎么让两边「交流」

1. 你在 GitHub 开一条 Issue，标题写成：`[给Grok] …` 或 `[给GPT] …`
2. 正文只写：**要改什么 / 不要改什么 / 验收句**
3. 把 Issue 链接丢给对应的那一边
4. 做完的人在 Issue 里回：**改了哪些文件、验收句过没过、下一个人做什么**
5. 另一边只认仓库和 Issue，不认聊天里的口头版本

## 开场必读（两边都要先读）

- `docs/SPEC.md` — 系统宪法，改算法必须升版本
- `src/lib/core/method.ts` — 问题路由，零 AI
- `src/lib/palm/engine.ts` — 达摩一掌经，1988-10-04 寅时男命必须排出 辰亥戌子

## 禁止

- 用八字反推紫微、相位、Dasha
- 客单调用 Stone 本人命盘或「靛渊龙星」
- 月令算错还继续写长文
- 两个模型各改各的、不写 Issue

## 给 GPT 的固定开场（复制即可）

见 `docs/GPT-PROMPT.md`
