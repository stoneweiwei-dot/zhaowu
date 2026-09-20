# 昭梧｜CURRENT STATE

最後核對：2026-09-21 03:45 AEST

> **这是项目唯一“当前状态”来源。** 旧 Issue、旧部署说明、旧聊天记录与本文件冲突时，以本文件 + 当前 `main` + 当前 Vercel Production + 当前 Supabase 为准。

## 1. 唯一生产主线

| 项             | 当前唯一真相                                                           |
| -------------- | ---------------------------------------------------------------------- |
| GitHub         | `stoneweiwei-dot/zhaowu`                                               |
| Branch         | `main`（唯一 source of truth）                                         |
| Hosting        | **Vercel**（唯一 Production，stone-zhaowu-official）                   |
| Production URL | `https://stone-zhaowu-official.vercel.app/`                            |
| Archive only   | Netlify `archive-stone-zhaowu-official`（无 runtime / 无 API / 无自动 build） |
| Database/Auth  | **Supabase** project `plgpxusmemnmzckbwtiv`（報告／圖庫／統計）。站主登入不走 Supabase Auth。 |
| 正式子域名     | `zhaowu.soul-terminal.com`；DNS 未完成前使用 Vercel Production URL     |

每次接手实时检查 `main` 与 Vercel Production 的 commit；GitHub `main` 仍是唯一源码真相。Vercel 是唯一正式站；Netlify 只作历史 archive，不得再承担任何正式流量或 `/api/*`。AppDeploy、Lovable standby 与其他旧临时站只读参考。

**治理政策（#411 起最高）：** 零成本单一 Production。禁止 preview 部署 churn、禁止把外挂变成 runtime dependency、禁止未经明确批准的付费计划升级。未来 Production release 必须显式手动，Git 自动部署已关闭（vercel.json `deploymentEnabled: false`）。

## 2. 已完成且默认锁住

- GitHub `main` 是唯一源码真相。Vercel 从 `main` 承载同一份 Vite 前端与 canonical API handlers。
- GitHub `main` branch protection 已開啟：required checks = Deploy gate／Engine suite／iPhone Safari；`enforce_admins=true`；禁止 force push。
- Supabase 报告存档、图库/背景资产、访问统计统一使用当前项目配置。站主登入改為獨立 Cookie `__Host-zhaowu_owner_session`，不經 Supabase Auth。
- 登入：`/login` 提供會員登入、註冊與獨立站主密鑰三分頁。會員走 Supabase Auth，確認信與 OAuth 必須回到 `/auth/callback`，不得把 token 倒在首頁變成空白頁。站主仍只認獨立 Cookie `__Host-zhaowu_owner_session`；`profiles.is_owner` 不得讓會員變成站主。Email＋密碼廢止契約已被 2026-09-15 站主最新指令取代。
- 現行公開語言：`zh-Hant / en / ko / hi`；`zh-Hans / ja` 僅保留歷史偏好相容並折回繁中，不再是公開選項。
- Loading ghost overlay 已移除。
- `finalizeReading` 是最终 Reading 单一来源；已保存报告不重新 live 算出另一套答案。
- 个人命请文字为证据型文案；真实命请图走私有 report image delivery，失败不得阻塞文字答案。
- Gallery/背景资产管理能力保留；全站应用页恢复 r23 固定宋画背景；后台资产管理保留，不能覆盖前台页面。
- 首页只保留一个主分析表单；`/qizheng`、`/yizhangjing`、`/ziwei` 等專項 routes 留作內部能力與回歸驗證，不在首頁或青玉小龍展示。旧 `/tianji-dual` 仅保留运行兼容，不再作为客户产品名称；不得复活旧入口。
- `/yizhangjing` 內部能力仍以達摩一掌經排前四世六道、逐世特徵與留到今生的習性；不再是首頁入口。D60 不在此能力中。
- `/indian-astrology` 的 D60 必須先顯示年月日＋精確時分＋出生地，經明確分鐘確認（綁定 birth fingerprint）後生成自己的分組（D1／D60 表、十二宮、五個主題）。±2 分鐘不穩仍輸出盤面，標弱旁證；計算失敗才「不作判定」。不用 D60 反向考時。已從最新 `main` 重建，**不得 merge 舊 PR #304**。D60 分析只掛在這一卷，不得再嵌回前世今生。
- `/qizheng`、`/ziwei`、`/astrology`、`/indian-astrology` 在有完整生辰時顯示各自對應命盤（`data-natal-chart`）；內部 calculation profile、原始 debug 狀態仍不進客戶畫面。舊「技術盤一律不向客戶顯示」已廢止。
- `/astrology` 完整盤：七曜星座與宮位、十二宮宮頭與宮內行星、ASC／MC／DSC／IC、主要相位；未知出生時間對宮位／四軸 fail-closed。來源為已合併的 #310，不是舊 release 基底。
- Loading：`IntroGate` 指向 `/intro/owner-immortal-ascent-r123.mp4`（原時長 10.04 秒、720×1280，不降解析度）與同名 JPEG 海報；一進站影片可見並主動 `play()`，右下角 Skip；真正影片錯誤才約 1.6 秒 fail-open；硬退出 12 秒。r126 拿掉「opacity:0 直到 is-playing」與 buffering 時 `onStalled` 再把片藏起來。舊 2.4／2.8／3 秒 Loading 契約已廢止。
- 夜間問事標題必須月白可讀；客人資料卡與觀世錄／知識頁宣紙維持深字。五行穿衣併入首頁「今日指引」展開區，方塊顯示木青／火紅紫／土黄棕／金白金銀／水黑藍。完整指南在 `/daily-colors`。
- r140：確認出生分鐘後，D60 必須在印度古法卷生成分組；±2 分鐘不穩改弱旁證，不再空白【不作判定】。PWA cache `zhaowu-shell-r140`。
- r139：首頁只留客人資料，不得再放自問自答標語或問事 textarea。生辰寫在這台手機的 `zhaowu.birth-record.v1`，登入／登出不得刪。西洋十二宮表在 iPhone 必須換行／卡片，不得 `nowrap` 裁欄。登入頁必須看得見全螢幕登入動畫。
- r135：Header 字標 PNG 已含「昭梧」，不得再並列第二個文字「昭梧」。夜色不得把宣紙標題反成月白。12MB 以內 MP3／M4A 原檔分段上傳，禁止再把相容音檔送進無逾時的 iPhone `decodeAudioData`。
- 2026-09-18 最新首頁流程：`#customer-record → #bazi → #question-stage`。生辰保存後立即用現有 `buildChart()`／`BaziChart` 顯示完整四柱與基礎解釋；再次開站直接恢復。r129「首頁不得顯示即時四柱」已被此指令取代。四柱主卡仍只顯示柱名＋干支＋十神，藏干／納音／十二長生在同一命盤細項中完整展開。
- 2026-09-19 r158：首頁七個公開專卷／流派入口退出 active path。生辰保存後，同一個 `#bazi` 區域直接顯示一份連續完整綜合報告；子平是唯一結構主判，紫微、西占、印度古法、七政、一掌象意與生命靈數只作內部專項旁證，不以流派名稱或分卡向客人展示。原專項計算路由保留作內部能力，不反向改寫子平主判。
- 2026-09-19 r159：青玉小龍的捷徑與語意導覽同步收起七政、一掌經、紫微等流派入口，全部導向首頁單一完整綜合報告；原專項 routes 只保留內部能力與回歸用途。
- `/numerology` 含靈魂獨白、人生角色、五項天賦分述與 11／22／33 區塊分析。首頁不得出現大師數文章標題「你是少見的」。
- 研究札記與《術數的邊界》放在 `/knowledge`「昭梧 · 觀世錄」。首頁觀世錄只留最新一篇與「進入觀世錄」入口。
- r130：背景音樂只播站主後台上傳的曲子（`/api/owner-music`）。不得再播 r129 內建佔位音，也不得把公開播放綁回 Supabase `zhaowu-audio` 公開桶（該桶 live HEAD 回 402）。後台上傳不經 Supabase session。舊檔仍在原桶，解除 spend cap 前無法自動撈回。
- r149：背景音樂改為完整多曲目播放器，直接使用 `/api/owner-music` 返回的站主歌單；固定提供播放／暫停、上一首、下一首、循環播放、隨機播放五個 44px 以上觸控按鈕。循環與隨機偏好存本機；iPhone Safari 首次播放仍保留 user-gesture unlock。
- r156：站主後台統一多選／批量操作。背景音樂上傳後可改顯示名稱，且可多選刪除非播放中曲目；內容圖庫、登入素材、首頁背景與客戶報告均有獨立選取框與批量操作列。圖庫／登入素材／首頁背景可批量啟用、停用、刪除；報告可批量刪除。內置登入素材保持唯讀，正在播放的音樂禁止批量刪除；所有刪除仍須二次確認。
- r157：站主最新 UI 指令把 r149 的獨立右下角播放器 UI `SUPERSEDED`。播放邏輯、完整五鍵控制、owner playlist、loop／shuffle 偏好與 Safari 手勢解鎖全部保留，但只存在於青玉小龍助手內。小龍是唯一 floating entry：預設右下角、可拖動、左右吸邊、位置本機持久化；未展開時間歇隨機顯示導覽或迷你音樂 speech bubble。禁止重新掛回第二個 fixed music dock。
- 首页各分组必须用简短三语说明回答两件事：用户“会知道自己的什么”与“这个体系最擅长看什么”；英文必须自然简洁，不做逐字直译。
- 「趣味测验」是独立的轻量自评系列，不冒充命盘；包含「内在动物 × 命局瑞兽」与「五行功能测验」。五行功能测验只判断当前需要训练的生长、启动、落地、收敛或恢复功能，不等同八字喜用神。
- r160：首頁不再直接攤開全部測驗卡，改為預設收起的單一入口「昭梧 · 心境小測」；點開後保留原測驗、計分、紀錄與路由。公開吉象圖鑑與命詮 Gallery-direct 候選只展示無人物祥紋；舊人像報告圖因面部重影退出圖庫展示，但既有報告母圖與原檔不刪除。
- r161：首頁核心流程置頂；今日、心境小測、吉象圖鑑、觀世錄統一為預設收起且同時只開一區。Header 日夜控制改為文字分段。開場與登入動畫提供使用者手勢聲音控制。
- r162：專業計算 routes 改為站主 Cookie 前置驗證，公開訪客即使知道網址亦會回首頁；公開紀錄、知識庫與青玉小龍只再導向首頁完整命盤或心境小測。
- r163：首頁與核心流程採「高級宋式宣紙 × 極簡層級 × 大幅留白」。山水降權為遠景，出生資料、命盤、報告與延伸入口改用不透明暖米紙面；canonical 視覺仍只由 `zhaowu-design-system.css` 最後接管。青玉小龍縮至 52px 並把未展開提示降為約 48–72 秒一次；播放器仍只在小龍內。
- r166：固定宋式遠山背景提高到肉眼可辨識但仍低於內容的權重；首頁暫時移除吉象圖鑑入口與其載入，獨立 `/auspicious-atlas`、素材原件與站主圖庫管理保留。
- r167：站主認定 r166 仍過於寡淡；首頁改為較有份量的礦物色宋畫層級，降低洗白遮罩並加深遠山、深松綠標題、鎏金細線與少量朱砂。宣紙內容仍不透明，手機可讀性與圖鑑首頁隱藏契約不變。
- 「六道习气测验」已独立落地于 `/quiz/six-realms`，只作当下日常惯性自评，不冒充死后去处、前世判定或一掌经排盘。
- 趣味測驗結果可顯示已核准的隱藏神聖圖像；這是結果頁視覺補充，不改命盤計算、報告契約或付費圖片流程。
- Logo／STO-12 已完成，不重新製作。STO-5 普通會員入口廢止已被 2026-09-15 站主最新指令取代：會員登入／註冊必須存在且確認信不得掉進空白頁。
- Netlify 已強制 archive-only：`netlify.toml` ignore = exit 0，functions 移除，不再承載 runtime / API。

没有新的可复现 FAIL 时，不得因为旧 Issue / 旧聊天复活已废止实现。

## 3. 报告产品唯一结构（2026-08-29 最新）

**固定九页、四核心区、多编号 session、多张报告卡全部废止。**

客户可见完整报告是一张连续报告纸面，顺序只有：

**总体概括 → 身体需要注意的地方**

- 总体概括合并直接答案、与本题有关的命理依据、时间节奏、现实行动与确实相关的条件，不再拆成独立卡片；站主维护的修心／命理建议如命中题目，只能最多两条并入同一个总体概括，不能新增第三层。
- 身体需要注意紧接总体概括之后，在同一张报告纸面里用小标题与细线区分，不是第二张报告卡。
- 新报告数据使用 `summary / body`；历史 `conclusion / basis / timing / action / relationship / ninePages` 仅作兼容读取，并入同一连续 renderer。
- 茶仙守护继续作为独立 `/tea-guardian` 工具，**不自动附加到完整报告底部**。
- 命请图独立于文字报告，由用户主动生成；图片失败、额度不足或旧图读取失败都不得让文字报告消失。

唯一产品契约：`docs/FOCUSED-REPORT.md` + `src/lib/report/focused-report.ts` + `src/components/paid-report-pages.tsx`。

## 4. 客户报告内容硬规则

- 不输出自问自答、内部推理、实现说明、模型说明、UUID、时间戳、方法状态。
- 第一段直接回答用户真正问的事。
- 不为职业题自动塞感情／财务；不为感情题自动塞工作／财务。
- 复合问题只回答实际问到的主题，并在同一总体概括里组织。
- 旅行／去哪里题必须直接给目的地与执行顺序，不反问补城市。
- 病药／通关、刑冲合害关系库与原局→大运→流年→流月作用链均已接入；正式取用／喜用仍须继续全格局验证，不得把五行数量、颜色或方位直接当用神。
- 偏枯／病藥文字生成新增 P3 Gate：不得按五行字数、缺字、不透或单纯强弱判偏枯；特殊格先行；偏枯只输出六态；病＝功能故障、药＝功能修复；必须 ODL→FC；五行人格／疾病直译与物件补命禁止进入核心结论。
- 2026-09-19 全分組主鏈／EC-7：所有八字／命理專項統一繼承「資料校驗→從化真假／特殊格→月令→調候→根氣透藏→格局→PK-6→病藥→ODL→FC→承載→刑沖合害／四庫→大運→流年→LBX四軸→事件性質→六親定位→流月→可信度／依據→白話輸出」。氣勢集中、雙強相戰、中和、缺項、通關與生活五行不得獨立越級下結論。
- 身体栏属于传统象义提醒，不是医疗诊断。
- 图失败不能拖死文字报告。

## 5. 當前視覺系統（2026-09-14；r129 夜間／首頁結構）

视觉母版是高級暖米宣纸／宋式图谱体系，品牌主體鎖定為松、日／月、山、水、雲；r163 起山水只作低權重遠景，內容紙面與文字層級優先。

最終視覺權威：`src/zhaowu-design-system.css` 必須最後載入，舊 CSS 只保留相容依賴，不得再覆蓋 canonical 規則；報告內容結構仍由 `src/focused-report.css` 與現行 renderer 承載。

## 6. 专题报告与 Calculation Truth Layer

`src/lib/ziwei/` 已进入确定性计算数据可用于生产的阶段；其白话专题报告與十二宮命盤保留作內部能力與回歸驗證。primary-source unanimity 仍为 false，紫微计算事实与八字核心保持分层，不得反向覆盖八字锁定逻辑。内部 calculation profile 不进客户画面。

`src/lib/qizheng/engine.ts` 继续负责七政真天象计算；`src/lib/qizheng/plain-summary.ts` 只做內部旁證組合，不改动星体计算。七政對性情、情绪节奏、行动压力、关系取向和机会落地的觀察併入統一報告，不以專卷入口或命盤表向客人展示。内部 debug 口径不进客户画面。

## 7. 2026-09-13 十項收口對帳（歷史）

舊聊天「先修 Safari、重建 D60、西洋完整盤、真機 Gate、branch protection、Supabase、停 Netlify、Linear、DNS、#295 暫停」不得再當未做任務重做。Netlify 已改為 archive-only；Vercel 為唯一 Production。

## 8. 当前真正未完成

- 正式子域名 `zhaowu.soul-terminal.com` DNS → Vercel 綁定與 SSL。完成前正式地址是 `https://stone-zhaowu-official.vercel.app/`。
- 真實 iPhone 關鍵流程與已安裝 PWA 自動更新最終實機驗收。GitHub iPhone Safari CI 已通過；這不等於實機完成。
- 八字 chart：刑冲合害关系库、结构病药／通关层与原局→大运→流年→流月作用链已经接入并有确定性测试；但「正式取用／喜用」尚未完成全格局验证，因此生活建议仍不得据此硬推颜色、方位、时段或宠物。
- 付費圖片接線 PR #295 由站主暫停；不得合併或重建，亦不得阻塞免費文字流程。現行圖片失敗必須回退 Gallery-direct，且不得讓文字報告消失。
- Supabase Storage 實查約 1.20 GB，超過 Free plan 1 GB；Storage 與 Edge gateway 回 402 `exceed_storage_size_quota`。解除只能由站主升級／調整帳務，或先核准可刪除／外移的至少約 200 MB 媒體；本版不擅自刪資料。r130 起站主音樂不依賴此桶。
- Netlify project 層 Continuous Deployment / Git build hook 仍需站主在 Dashboard 手動關閉或 unlink（代碼側已 ignore = exit 0 並移除 functions）。
- Vercel Project Settings 的 Git 欄位 provider-side 核對（程式碼已 `deploymentEnabled: false`，行為已證明無自動部署）。

## 9. 生产优先级

1. 白屏 / 无法进入 / 无法分析
2. 排盘或核心结论错误
3. 登录 / 报告读取 / 保存失败
4. 完整报告与用户问题不相关、答案不一致或泄露内部推理
5. 真实报告图生成
6. 后台管理
7. 纯视觉微调

低优先级不得阻塞高优先级。

## 10. 锁定边界

没有独立版本升级与明确验收时，不重写：

- `src/lib/palm/engine.ts`
- `src/lib/core/method.ts`
- `src/lib/bazi/calendar.ts`
- `src/lib/bazi/chart.ts`
- `src/lib/bazi/interpret.ts` 分类顺序
- `src/lib/actions.ts` 前世 0-AI 短路

报告结构与首页视觉允许改组合层、UI、相关测试与兼容读取；不得借机改排盘核心、auth、payment 或 Supabase schema。

## 11. 接手规则

每次改网站之前：读 `AGENTS.md` 与本文件；查实时 main + Vercel Production；只处理当前可复现问题。新指令与旧指令冲突时，按 AGENTS 的安全 supersession 规则使旧 active path 失效，但不得破坏运行依赖。

- 外掛（Canva / Replit / Runway / AppDeploy / Floot 等）永不成為 runtime dependency；`scripts/customer-cost-isolation.test.mjs` 已強制掃描 runtime source，違者 CI fail。
