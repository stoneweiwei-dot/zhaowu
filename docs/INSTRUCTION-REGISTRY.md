# 昭梧｜Instruction Registry

状态：`ACTIVE REGISTRY`

目的：把「当前有效」「已被取代」「曾因权限未接入」「仅历史参考」分开，防止未来 AI / Agent 从旧聊天、旧 Library 文件、旧 AppDeploy 补丁或旧 PR 重新激活已废止指令。

## 1. 当前最高入口

执行顺序：

1. `AGENTS.md` — 全项目治理、权限、安全 supersession、完成标准。
2. `docs/CURRENT-STATE.md` + 当前 `main` + 当前 Production — 产品与运行现状。
3. `docs/STONE-R6.2.1-CURRENT-MASTER.md` — 当前唯一命理母指令。
4. `docs/ANALYSIS-INGESTION-POLICY.md` — 新命理素材入库规则。
5. 各专题当前契约：
   - `docs/FOCUSED-REPORT.md`
   - `docs/REPORT-VISUAL-SYSTEM.md`
   - `docs/ZIWEI-INTERPRETATION-GRAMMAR-v1.0.md`
   - `docs/VEDIC-INTERPRETATION-PROTOCOL-v1.0.md` — 印度吠陀占星当前解释协议；计算层未接线前不得伪造具体分盘结果。
   - 以及当前 `main` 中对应的 calculation/profile/test contract。

冲突时遵循 `AGENTS.md` 的优先级：最新明确站主指令 → 当前 main / production truth → 当前治理与契约 → 旧文档／Issue → 旧聊天／旧部署。

## 2. 命理母指令版本

| 文件 / 版本 | 状态 | 处理 |
|---|---|---|
| `STONE-R6.2.1-CURRENT-MASTER.md` | `CURRENT_MASTER` | 唯一当前入口 |
| `STONE-R6.1-CURRENT-MASTER.md` | `SUPERSEDED_BASE` | 保留完整历史判法，供 R6.2.1 继承与审计；不得单独冒充当前版本 |
| R6 / R5 / R4 / R3 / R2 | `HISTORICAL` | 只作版本沿革，冲突处不执行 |
| `METAPHYSICS-DEFAULT-PROTOCOL-v1.0.md` | `REDIRECT / HISTORICAL BASELINE` | 仅作为旧入口，必须转到 R6.2.1 |

## 3. 以前“做了但当时没权限接入”的遗留包

### 3.1 `integration-notes.md` / `integration-snippet.html`

历史原因：当时 GitHub 写权限不可用，只生成了接入说明和片段，没有进入正式仓库。

当前处理：`DO NOT IMPORT WHOLESALE`。

其中仍有效的意图已经由当前系统接管：
- 第一段直接回答原问题 → 由 R6.2.1 / Focused Report 执行；
- 多语必须完整，不可只翻表单 → 由当前 i18n / CURRENT-STATE 契约执行；
- 禁止无关模板堆叠 → 由直接回答与 focused-report 契约执行；
- 宇宙灵魂原型的象征边界 → 已由 `COSMIC-SYMBOLIC.md` 管理；
- 前世今生 → 当前唯一入口 `/yizhangjing`，按现行产品命名与边界执行。

明确不再导入的旧行为：
- `actions.slice(..., 1)` 式全局强制“永远只给一条行动”不是当前通用运行规则；现行规则是先给**最优先行动**，并依问题与报告契约决定是否需要附加必要条件。
- “前台不得出现『达摩一掌经』”已被现行 `/yizhangjing` 产品与当前明确命名取代，不得从旧片段复活。
- 旧 `<script src="src/zhaowu-knowledge-base.js">` 静态接入方式不适用于当前 React/Vite 架构。

### 3.2 `zhaowu-auth-session-hotfix.review.md` / `zhaowu-auth-session-hotfix.appdeploy-diffs.json`

历史状态：`REVIEW ONLY — not deployed`，针对 AppDeploy v45 的 `src/account.js` / `account-session.js` 架构。

当前处理：`OBSOLETE ARCHITECTURE — NEVER APPLY DIRECTLY`。

当前站点认证已由现行 React/Supabase auth 模块与测试管理。旧 `notifyAuth()` diff 不得复制进现在的代码；若出现相似认证 bug，必须在当前代码上重新复现、重新定位。

### 3.3 `zhaowu-production-hardening.patch`

历史状态：曾等待 GitHub 接入，内容锁定旧 `stoneweiwei-dot/zhaowu-web-app-`、静态 `zhaowu-latest.html`、Node 20 / AppDeploy-era 流程。

当前处理：`SUPERSEDED — DO NOT APPLY`。

它仍有价值的原则（GitHub source-of-truth、CI、禁止假完成）已经由当前 `AGENTS.md` 吸收并升级；旧仓库、旧入口、旧 Node / Hosting 设定全部不得复活。

### 3.4 旧 AppDeploy / Netlify / Grok temporary production briefings

当前处理：`REFERENCE ONLY`。唯一 production 继续由 `AGENTS.md` / `CURRENT-STATE.md` 指定的 Vercel `stone-zhaowu-official` 管理。

### 3.5 印度吠陀占星分散指令（v4.0 + 后续补丁）

历史状态：Library 中曾分散保存 `Vedic Deep Karma Matrix v4.0`、Rasi / Bhava / Moon / Transit / D2 补丁，以及 D3、D4、D5、D6、D7、D8、D11、D16、D20、D24、D27、D30、D40、D45、D60 等后续分盘补充；它们长期没有形成一个 current repo 协议，也没有独立 deterministic Jyotish calculation engine。

当前处理：`CONSOLIDATED INTERPRETATION / CALCULATION NOT WIRED`。

已统一整理为 `docs/VEDIC-INTERPRETATION-PROTOCOL-v1.0.md`。有效部分按最新治理重写：
- D1 为根，Bhava 定事件落点，Moon Chart 定主观体验，Dasha 定阶段，Transit 只作触发；
- 专项分盘只在 D1 已有主题且与本题有关时调用；
- D60 加入严格出生时间可靠度 Gate，不得用 D60 循环论证考时；
- Starseed／星际种子／银河种族／高维身份等旧 v4.0 内容从 active scope 移除；
- 前世、业力、灵魂等只能作传统／象征性解释，不得写成已证实历史事实；
- 在确定性 calculation layer、test vectors 与 profile 未接线前，不得生成具体 D1/D9/D60 盘面并宣称为网站已实现功能。

## 4. 当前发现的“旧指令仍在仓库里但会误导未来 Agent”

### `COLLAB.md`

旧文仍把固定九页收费报告当成当前契约。现行产品已改为 `summary / body` 内容契约，并允许程序化 tabs / swipe cards 作为阅读层。协作文档必须跟随 `FOCUSED-REPORT.md`，不得恢复旧 01–09 session。

### `SPEC.md` / `CONTRACT.md`

这些文件包含早期实现快照与历史未完成清单。它们不能覆盖 `CURRENT-STATE.md`、当前代码、当前测试或 R6.2.1。保留它们只为历史接口／算法基线时，必须在文件顶部明确 legacy / partially superseded 状态。

## 5. 新资料自动入库规则

站主之后直接贴新的命理、判法、视觉或网站执行指令时：

- 先比对本 Registry 与当前 main；
- 找到同一主题的最新版本；
- 旧版本只保留不冲突部分；
- 新规则若只是解释层，不得偷改 calculation truth；
- 可安全落地的直接进入对应当前文档／代码／测试；
- 不能安全落地的明确标 `QUARANTINE` / `DEPENDENCY BLOCKED`，不得伪装成已接入；
- 不再因为旧 Library 文件“曾经写过”就重复实现已被后续版本替代的方案。

## 6. 永久判定

“等待权限”的历史文件不是自动待办清单。

只有同时满足以下条件才进入当前执行路径：

1. 仍符合站主最新明确意图；
2. 没有被 current main / current contract 实现或取代；
3. 与当前架构兼容；
4. 不会破坏受保护逻辑；
5. 能通过当前 QA / CI / production 规则。

否则一律归档为历史证据，不重新激活。

## 2026-09-12 實碼對帳補充

- D60：`src/components/d60-karma-section.tsx` 已有 Astronomy Engine 與分鐘確認 Gate，r113 又修正了共享資料的確認旁路；上文「CALCULATION NOT WIRED」是歷史狀態，不能再用來聲稱網站沒有元件。現有計算不等於已完成獨立星曆／流派 test-vector 認證，後者仍需驗證，不得擅改公式。
- Logo：本批採站主金葫蘆＋深藍昭梧來源，Header 與 App 尺寸分開，取代 CURRENT-STATE 的 r98 松系主 Logo 限制；功能松系圖示仍保留。
- 登入：2026-09-15 r139 依站主最新指令恢復會員登入／註冊，並新增 `/auth/callback`。r128／r129「普通用戶登入全部退出 active path」僅就**站主不得走 Supabase Auth、會員不得靠 `profiles.is_owner` 升成站主**仍然有效；「不得放出註冊」已被取代。

## 2026-09-15 r139 homepage / D60 grouping / member auth / login animation / music error

- 首頁拿掉問事標語與 textarea；只留客人資料與保存生辰。不得再發明隱藏預設問題。
- D60 分析全部離開 `/yizhangjing`，只留在 `/indian-astrology` 的 `D60ReliabilityGate`。確認分鐘後必須生成 D60 分組；±2 分鐘不穩改標弱旁證，不再空白【不作判定】。不得改計算公式，不得 merge #304。
- 本機 `zhaowu.birth-record.v1` 登入／登出不得刪。每台手機自動讀取先前紀錄。
- `/login` 登入動畫必須全螢幕可見。IntroGate 仍維持 r126 skip-after-seen。
- 西洋十二宮完整解讀不得 `nowrap` 裁欄。
- 音樂上傳對 iPhone AAC／octet-stream 做 magic-byte 辨識，失敗必須帶 HTTP／detail。
- PWA cache `zhaowu-shell-r140`。
- r140：確認分鐘後必須生成 D60 分組；±2 分鐘不穩標弱旁證，不再空白【不作判定】。
- Loading 維持 r126。不 merge #304。PR #295 維持暫停。

- 付費圖片 PR #295 於 2026-09-12 明確暫停，保持暫停。
- 語言：現行公開語言選項為繁中／英文／韓文／印地文；簡中為相容層。舊三語任務不得直接恢復已移除的公開選項。
- 待辦及證據分類見 `docs/OPEN-INSTRUCTIONS-2026-09-12.md`。

## 2026-09-13 r123 收口 supersession

- Loading：站主原片 `/intro/owner-immortal-ascent-r123.mp4` 原時長 10.04 秒 + 右下角 Skip。舊 2.4／2.8／「低於三秒」Loading 契約 `SUPERSEDED`。CI 用 `navigator.webdriver` 跳過 intro；驗證 Loading 必須設 `zhaowu.intro.force=1`。
- 專卷命盤：有生辰時顯示對應 `data-natal-chart`。舊「技術盤一律不向客戶顯示」`SUPERSEDED`。內部 calculation profile 仍不進客戶畫面。
- D60：`/indian-astrology` 使用 `D60ReliabilityGate`（分鐘確認 + fingerprint + ±2 分鐘）。確認後生成分組；不穩標弱旁證。不得 merge 舊 PR #304。不得用 D60 反向考時。不得改 Astronomy Engine／Lahiri／Ascendant／D60 分段公式。
- Production CI：Engine suite 為必要檢查，不再 `continue-on-error`。
- Netlify：`netlify.toml` `ignore = "exit 0"`。Netlify 不是 production。
- PR #295 Paid Visual：維持暫停。
- Logo：STO-12 已完成，不重新製作。

## 2026-09-13 r126 intro visibility + spend-cap copy

- Loading 原片必須一進站就可見並播放。`opacity: 0 until .is-playing` 與 `onStalled` 把片再藏起來均 `SUPERSEDED`。成功播放仍走原時長 10.04 秒，右下角 Skip，硬退出 12 秒；真正缺片才 1.6 秒 fail-open。
- 站主登入：Supabase 402 / spend cap / egress quota 必須顯示中文原因。解除額度只能由站主在 Supabase Billing 操作，網站程式不能代替。
- PR #295 Paid Visual：維持暫停。

## 2026-09-13 r127 night readability + dress-in-almanac + numerology blocks

- 夜間問事標題／導語必須月白可讀。客人資料卡維持宣紙深字，不得被夜間 token 洗成淺灰。
- 五行穿衣併入「今日指引」展開區；關閉的 `#daily-almanac` 高度仍須 < 260px。方塊內必須看見木青／火紅紫／土黃棕／金白金銀／水黑藍，不得再是空心深色方。
- 靈數分析加靈魂獨白與 11／22／33 區塊結構。不得把大師數文章標題放到首頁。不得複製第三方海報／浮水印。
- Loading 維持 r126，不重做 intro。
- PR #295 Paid Visual：維持暫停。

## 2026-09-14 十項收口對帳（不重做已上線項）

- 正式站 r128 `main` = Vercel Production `58ee4a9bd923a790b42a954b7764c753a7887454` / `dpl_FtfGFpaweLcpuX966R9ZspUrWfvo`。r129 合併後再核 SHA。
- D60 gate、西洋完整盤、專卷命盤、branch protection、Netlify skip、#295 暫停均已在 r123–r127。不得 merge #304。不得因舊清單再發一輪功能 build。
- 仍需站主：Supabase spend cap（報告／圖庫）、DNS `zhaowu.soul-terminal.com`、真實 iPhone、Dashboard security 勾選。Linear 未接入。
- PR #322 已合併為 r128；不得再當「未綠燈實驗」擋獨立登入。

## 2026-09-14 r128 independent owner login

- PR #322 已合併為 r128（`58ee4a9`）。獨立站主密鑰登入是現行契約。
- r128 的 `api/owner-*.ts` 在正式線 FUNCTION_INVOCATION_FAILED（Vite 無法跑 `../src` import）。不得把「Email＋密碼仍是正式登入」從舊 CURRENT-STATE 復活。

## 2026-09-14 r129 home / music / login / 觀世錄

- 背景音樂同源 `/audio/zhaowu-background.m4a`（mp3 備援）。Supabase 公開音訊桶 402 不得再當播放來源。
- 站主 API 改自包含 `api/owner-*.js`。SPA rewrite 不得吞 `/api/*`。
- 首頁拿掉客人資料下的即時四柱預覽。八字排盤只在開始分析後出現。四柱卡不得疊天干／地支／十神。
- 《術數的邊界》與研究札記在 `/knowledge`「昭梧 · 觀世錄」。不得把資料庫文章鋪回主分析流。
- 夜間「七種個人分析」、輕測驗、命盤細項必須實色底＋月白字。
- Loading 維持 r126。不 merge #304。PR #295 維持暫停。
- PWA cache `zhaowu-shell-r129`。



## 2026-09-14 r130 owner music upload + key rotation

- 背景音樂只播站主後台上傳的曲子。r129 內建佔位音不得再當正式曲。
- 後台「背景音樂管理」在獨立 Cookie 站主登入後顯示，不需要 Supabase session。
- 上傳寫入 `owner-music` 分支，Vercel 不得部署該分支。播放走 `/api/owner-music`。
- Supabase `zhaowu-audio` 舊檔（含《淨佛聖願》）仍在，但 402 spend cap 期間無法下載；站主在後台重新上傳。
- 站主密碼改接到真正生效的 `api/owner-*.js`（hash `6236d83b…`，最短 8 位）。只改 `src/server/owner-auth.ts` 不能登入。舊 32 位密鑰與 r129 hash `SUPERSEDED`。明文不進 repo。
- Loading 維持 r126。不 merge #304。PR #295 維持暫停。
- PWA cache `zhaowu-shell-r130`。
