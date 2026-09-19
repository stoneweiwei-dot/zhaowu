# 昭梧｜Instruction Registry

状态：`ACTIVE REGISTRY`

目的：把「当前有效」「已被取代」「曾因权限未接入」「仅历史参考」分开，防止未来 AI / Agent 从旧聊天、旧 Library 文件、旧 AppDeploy 补丁或旧 PR 重新激活已废止指令。

## 1. 当前最高入口

执行顺序：

1. `AGENTS.md` — 全项目治理、权限、安全 supersession、完成标准。
2. `docs/CURRENT-STATE.md` + 当前 `main` + 当前 Production — 产品与运行现状。
3. `docs/STONE-R6.2.1-CURRENT-MASTER.md` + `docs/STONE-R6.2.1-P2-STRUCTURAL-DYNAMICS.md` + `docs/STONE-R6.2.1-P3-PINKU-BINGYAO-GATE.md` — 当前唯一命理母指令及两份强制 Runtime 补丁。
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
| `STONE-R6.2.1-CURRENT-MASTER.md` | `CURRENT_MASTER` | 唯一当前入口；必须同时加载 P2 |
| `STONE-R6.2.1-P2-STRUCTURAL-DYNAMICS.md` | `ACTIVE_RUNTIME_PATCH` | 刑冲合害破、墓库、十神功能、ODL/FC 流通、类象与跨术数边界的强制补丁 |
| `STONE-R6.2.1-P3-PINKU-BINGYAO-GATE.md` | `ACTIVE_RUNTIME_PATCH` | 偏枯六态、特殊格先行、病藥功能化、ODL→FC、EC-7 氣勢集中／雙強／中和／通關边界，以及所有分組统一主链的强制补丁 |
| `STONE-R6.1-CURRENT-MASTER.md` | `SUPERSEDED_BASE` | 保留完整历史判法，供 R6.2.1 继承与审计；不得单独冒充当前版本 |
| R6 / R5 / R4 / R3 / R2 | `HISTORICAL` | 只作版本沿革，冲突处不执行 |
| `METAPHYSICS-DEFAULT-PROTOCOL-v1.0.md` | `REDIRECT / HISTORICAL BASELINE` | 仅作为旧入口，必须转到 R6.2.1 + P2 + P3 |

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

旧 AppDeploy／Grok 临时 production 仍为 `REFERENCE ONLY`。Netlify 的旧 archive／永久 skip 限制已被 2026-09-19 r154 站主明确指令取代：同一 GitHub `main` 由既有 `archive-stone-zhaowu-official` 承载 Vite 前端与十个 canonical API handler；不得复活旧静态壳，也不得另写命理逻辑。

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

这些文件包含早期实现快照与历史未完成清单。它们不能覆盖 `CURRENT-STATE.md`、当前代码、当前测试或 R6.2.1 + P2。保留它们只为历史接口／算法基线时，必须在文件顶部明确 legacy / partially superseded 状态。

## 5. 新资料自动入库规则

站主之后直接贴新的命理、判法、视觉或网站执行指令时：

- 先比对本 Registry 与当前 main；
- 找到同一主题的最新版本；
- 旧版本只保留不冲突部分；
- 新规则若只是解释层，不得偷改 calculation truth；
- 涉及刑冲合害破、墓库、十神功能、ODL／流通、万物类象或跨术数同源时，必须通过 P2 边界；涉及偏枯、病藥、特殊格极端强弱、五行人格化、风水／生活五行补救时，必须再通过 P3 边界；
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

## 2026-09-15 r143 命理 P2 結構動力學同步

- 站主提供的《陰陽五行系統動力學與八字理法之結構化解析》已完成清洗，不整份照收。
- ACTIVE：`docs/STONE-R6.2.1-P2-STRUCTURAL-DYNAMICS.md`。
- 固定新增／加固：
  - 穿／害＝結構性損耗，不等於控制或制取；
  - `TG-FS`：十神本體不變，功能可偏移；
  - 六沖＝結構觸發器，不預設吉凶；
  - 墓庫維持動態判定，禁逢沖必開／逢合必閉；
  - `FC` Flow Consequence 與 ODL「有路」分開；
  - 神煞維持三級降權；
  - 萬物類象採非排他多重映射；
  - 跨術數同源只作哲學／語義旁證，不互改 calculation truth。
- 明確淘汰：十神真的變成另一十神、喜忌逢沖公式、一物一行固定映射、固定疾病直斷、把氣機或命例回饋包裝成現代科學實證。
- 本次只改命理指令／知識治理，不改 Bazi deterministic calculation truth。

## 2026-09-18 r152 命理 P3 偏枯／病藥 Gate 同步

- 站主提供《八字偏枯的氣機與病藥》并要求对照现行母指令清洗后同步网站后台文字生成规则。
- ACTIVE：`docs/STONE-R6.2.1-P3-PINKU-BINGYAO-GATE.md`。
- 固定新增／加固：
  - 偏枯不得按五行字数、百分比、缺字、不透或单纯强弱直接判；
  - 偏只分「偏而能用／偏而成病」，枯只分「枯而有源／枯而无源」；
  - 六态输出：不构成偏枯／偏而能用／偏而成病／枯而有源／枯而无源／特殊格另判；
  - 特殊格先行，极旺／极弱不得自动升格；
  - 病＝功能故障，药＝功能修复，不固定等同某五行；
  - 偏枯 Gate 后必须执行 ODL → FC，有路不等于有效流通；
  - 墓库藏干不得直接视为可用药神，逢冲不自动出库；
  - 五行象义不得直接推出人格、疾病、职业、婚姻或财富；
  - 颜色、家具、方位、宠物、植物等降级为文化／生活象义，不作核心补命算法；
  - 通根与十二长生分离，不设固定倍数或固定位置权重。
- 明确淘汰：五行人格百科、固定疾病／心理映射、极旺自动从格、长生等同通根、墓库一冲即开、「缺什么补什么」式病药、物件改命。
- 本次只更新命理指令／文字生成治理与机器可读 runtime contract，不修改 Bazi deterministic calculation truth。

## 2026-09-12 實碼對帳補充

- D60：`src/components/d60-karma-section.tsx` 已有 Astronomy Engine 與分鐘確認 Gate，r113 又修正了共享資料的確認旁路；上文「CALCULATION NOT WIRED」是歷史狀態，不能再用來聲稱網站沒有元件。現有計算不等於已完成獨立星曆／流派 test-vector 認證，後者仍需驗證，不得擅改公式。
- Logo：本批採站主金葫蘆＋深藍昭梧來源，Header 與 App 尺寸分開，取代 CURRENT-STATE 的 r98 松系主 Logo 限制；功能松系圖示仍保留。
- 登入：2026-09-15 r139 依站主最新指令恢復會員登入／註冊，並新增 `/auth/callback`。r128／r129「普通用戶登入全部退出 active path」僅就**站主不得走 Supabase Auth、會員不得靠 `profiles.is_owner` 升成站主**仍然有效；「不得放出註冊」已被取代。


## 2026-09-19 r157 青玉小龍 × 音樂播放器 UI supersession

- 站主最新明確指令：右下角獨立音樂播放器與青玉小龍導覽不得再作兩個 fixed 浮層。
- r149 的播放能力保持：播放／暫停、上一首、下一首、循環、隨機、完整 owner playlist、localStorage 偏好與 iPhone Safari user-gesture unlock 全部保留。
- r149 的「獨立浮動 music dock」UI 在本範圍正式 `SUPERSEDED`；不得由舊測試、舊聊天或舊 CSS 恢復。
- 唯一 active 浮層入口是青玉小龍助手：預設右下角，可拖動、吸附左右邊緣、保存位置。
- 小龍未展開時可間歇隨機顯示單一 speech bubble；內容在站內導覽提示與迷你音樂播放器之間輪換。展開助手後停止 bubble 輪播。
- 完整歌單控制只在小龍面板內呈現；迷你音樂 bubble 只提供輕量播放／暫停與下一首，點擊可進完整面板。
- 全站同一時間只能有一個右下角主浮層入口，不得再渲染第二個播放器陰影、第二套 z-index dock 或平行音樂來源。
- Owner workspace 仍維持既有「隱藏 public dragon guide」契約；本次不以 UI 合併破壞後台專用介面。
- 此 supersession 只改 UI 組合與互動，不改 owner music API、音樂改名／批量管理、Cookie 驗證、曲目檔案、Supabase schema、命理計算、報告、auth 或 payment。

## 2026-09-19 r158 單一完整綜合報告 supersession

- 站主最新明確指令：首頁不再顯示七種個人分析／七個流派專卷入口；客人不需要自行選派系。
- ACTIVE 流程：`出生資料 → 四柱命盤與基礎解釋 → 單一完整綜合報告 → 可選的現實問題追問`。
- 子平八字維持唯一結構主判。紫微、西洋占星、印度古法、七政四餘、一掌象意、生命靈數只在內部專項層運算與交叉旁證，不能反向覆蓋子平主判。
- 前台報告只按「核心底盤／性格節奏／關係互動／事業資源／人生階段／反覆課題與行動」呈現，不用流派名稱裝飾報告，不恢復多 Session、多卡片或七個可點入口。
- 原專項 routes 與 deterministic engines 保留作內部能力與回歸驗證；本次只移除首頁公開入口並新增單一組裝閱讀層，不刪計算、資料或歷史報告。
- r116/r129 與其他要求首頁展示「七種個人分析」卡片的舊 UI 指令，在首頁展示範圍內 `SUPERSEDED`。

## 2026-09-19 r160 首頁測驗收口 × 人像瑕疵隔離

- 站主最新明確指令：首頁測驗區只留一個標題入口，不得把全部測驗卡直接展開。
- ACTIVE 名稱：繁中／簡中「昭梧 · 心境小測」，英文「ZHAOWU · SELF DISCOVERY」；入口預設收起，點開後才載入既有測驗卡與五行香氣譜。
- 原測驗題目、計分、歷史紀錄、`/fun-tests` 與各獨立 quiz routes 保留；本次只改首頁呈現層。
- 站主以實際截圖確認多張舊人像母圖存在面部重影。這批 `/report-visuals/` 圖退出公開圖鑑與客戶命詮 Gallery-direct 候選，但原檔及既有報告母圖保留作回滾與審計。
- 公開吉象圖鑑只保留無人物祥紋；Owner 圖庫分組仍可保留原件管理與內部匹配，但不得因此自動進入客戶公開 registry。
- 不物理刪除 Supabase 原件，不改命理計算、報告文字、付款、認證、資料庫 schema 或使用者紀錄。

## 2026-09-19 r161 首頁層級 × 動畫聲音 × Netlify 登入 supersession

- 首頁唯一常駐主線為出生資料、四柱命盤、完整綜合報告與後續現實問題；它必須排在每日內容與文章之前。
- 今日、昭梧 · 心境小測、吉象圖鑑、觀世錄統一為四個延伸入口：預設全收起，同一時間只展開一個。舊的「今日收起、天象展開、圖鑑展開、觀世錄半展開」混合狀態在首頁範圍內 `SUPERSEDED`。
- 首頁五秒開場與站主登入動畫必須提供可見的使用者手勢聲音控制。不得宣稱 iPhone Safari 可在沒有點擊的情況下自動有聲播放。
- Header 日夜切換改為日／夜文字分段，不恢復原裝飾性太陽／月亮 BrandIcon。
- 站主密碼仍為 `19881004` 對應的已提交 SHA-256；Netlify Fetch `Request` 必須先用 `request.json()` 讀取，不得把 `ReadableStream` 誤當已解析 JSON。
- 本次只改首頁呈現、媒體控制與 Netlify body 相容層；不改 Cookie 權限、Supabase Auth、命理計算、報告內容、付款、資料庫或媒體原件。

## 2026-09-19 r162 專業路由與主人資料收口

- 原專業 routes 不只從首頁隱藏，必須以獨立站主 HttpOnly Cookie 作前置驗證；公開訪客直接輸入網址亦不得進入。
- 公開紀錄、知識庫與青玉小龍只可引導至首頁單一完整命盤或心境小測，不再列出流派名稱與專業 route。
- Netlify canonical host 的主人資料操作只經同源 `/api/owner-data`；瀏覽器不得取得 Supabase service-role key。上傳完成前須以簽名票據核對 bucket、path、MIME 與 size。
- Supabase Storage 超過 Free plan 容量所造成的 402 是帳務／資料保留決策，不以刪除現有素材假裝修復。付費圖片 provider 暫停與正式取用／喜用 fail-closed 邊界均不變。

## 2026-09-19 r163 表面高級化 supersession

- ACTIVE 視覺方向為「高級宋式宣紙 × 極簡層級 × 大幅留白」。背景仍屬宋式山水體系，但山水必須退到更淡、更遠、更低細節的底層，主背景以 `#faf8f1`／`#fffaf1` 暖米宣紙為主。
- `src/zhaowu-design-system.css` 繼續作唯一最後載入的 canonical 視覺權威；不得再新增 `final-final` CSS、runtime DOM 注入或另一套平行母版。
- 出生資料、命盤、報告、表單與文字承載面必須不透明、低陰影、乾淨邊界；首頁優先順序固定為留白與呼吸感 → 字體層次 → 背景乾淨度 → 紙面精緻度 → 小龍低存在感。
- 青玉小龍維持唯一 floating entry、可拖、吸邊與完整五鍵音樂控制；預設尺寸縮小，未展開提示泡泡降頻。禁止復活獨立播放器或第二個固定浮層。
- 手機 390–430px 優先；16px 表單字與可讀正文不降級。不改登入動畫、後台、命理計算、auth、支付或 Supabase schema。

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

## 2026-09-18 首頁八字命盤流程 supersession

- 最新站主指令將首頁固定為：`#customer-record → #bazi → #question-stage`。
- 生辰保存後必須立即用現有 `buildChart()`／`BaziChart` 顯示完整四柱、十神、藏干、納音、十二長生與基礎結構解釋；已保存生辰再次開站時直接恢復。
- r129「首頁不得顯示即時四柱、只在分析報告出現」在首頁這一範圍內正式 `SUPERSEDED`；不得再由舊測試或舊文件恢復。
- 時辰未知時時柱留白並降級，不得補造；流通候選不得冒充正式喜用神。
- 此變更只重接首頁展示與流程，不改八字 deterministic calculation truth、D60、付款、站主登入、Supabase／Floot 遷移。
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


## 2026-09-19 r150 全分組主鏈／EC-7 同步

- ACTIVE：网站八字 runtime 顶层主链统一为：`资料校验 → 从化真假／特殊格 → 月令 → 调候 → 根气透藏 → 格局 → PK-6 偏枯病藥 Gate → 病藥 → ODL（是否有路）→ FC（流通结果）→ 承载 → 刑冲合害／四库 → 大运 → 流年 → LBX 四轴 → 事件性质 → 六亲定位 → 流月窗口 → 可信度／依据 → 白话输出`。
- 所有八字／命理专项目录与 future Agent 都必须继承这条主链；专题只能放大自己的步骤，不得跳过上游 Gate。
- 同一案件已完成且仍有效的上游结果可压缩沿用；校时改变、从化未定、格局／病藥冲突、版本不明或证据失效时必须退回主链。
- 紫微、七政、一掌经、D60、吠陀、风水、神煞等保留自身算法；不得反向改写子平主判，不适用的步骤标记 N/A。
- 内部模块状态必须可区分：`已完成／压缩沿用／N/A／受阻／降级`。
- EC-7：气势集中不是人格／方向／成就结论；双强相战不是天然优势；中和≠五行平均；缺项≠病、补项≠藥；通关不得滥用；运动／颜色／饮食／职业等生活五行不得反向修改格局、喜用、病藥或岁运。
- 固定裁决：气势集中只能作为“主轴可能更明显”的候选，最终由成势、承载、病藥、制化、ODL、FC共同裁决。
- 本次只更新解释／治理／runtime 路由，不修改四柱、节气、真太阳时、藏干、十神、起运、大运等 deterministic calculation truth。

## 2026-09-19 r154 Netlify 正式承載 supersession

- 站主明确要求 Vercel 额度／取消不得继续阻塞全站美工与发布。
- ACTIVE HOST：既有 Netlify `archive-stone-zhaowu-official`，源码仍只认 GitHub `main`。
- r123 的 `netlify.toml ignore = "exit 0"` 与「Netlify 永久不是 production」仅在主机范围内 `SUPERSEDED`。
- 十个 `/api/*` 必须经 Netlify Functions 重用 canonical handler；禁止退化成只有 `dist` 的静态壳。
- Vercel r151 保留为非破坏性旧版 fallback，不触发新 build、不删除、不冒充当前 r154。
