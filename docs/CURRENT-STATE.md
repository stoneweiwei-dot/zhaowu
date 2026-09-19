# 昭梧｜CURRENT STATE

最後核對：2026-09-20 09:03 AEST

> **这是项目唯一“当前状态”来源。** 旧 Issue、旧部署说明、旧聊天记录与本文件冲突时，以本文件 + 当前 `main` + 当前 Vercel Production + 当前 Supabase 为准。
>
> **2026-09-20 09:03 AEST supersession：** 正式 Production 已回到 Vercel `stone-zhaowu-official`，正式網址為 `https://stone-zhaowu-official.vercel.app/`。下文凡仍提到「Netlify canonical／主站」者只作歷史版本背景，不得再作當前部署指令。GitHub `main` 仍是唯一源碼真相。

## 1. 唯一生产主线

| 项             | 当前唯一真相                                                           |
| -------------- | ---------------------------------------------------------------------- |
| GitHub         | `stoneweiwei-dot/zhaowu`                                               |
| Branch         | `main`                                                                 |
| Hosting        | **Vercel**（2026-09-20 最新 supersession）                             |
| Vercel project | `stone-zhaowu-official` (`prj_81IIJjyeM3l47ZPsiIE7d6eOrp9I`)          |
| Production URL | `https://stone-zhaowu-official.vercel.app/`                            |
| Historical archive | Netlify `archive-stone-zhaowu-official` 只保留歷史／備查，不作 Production |
| Database/Auth  | **Supabase** project `plgpxusmemnmzckbwtiv`（報告／圖庫／統計）。站主登入不走 Supabase Auth。 |
| 正式子域名     | `zhaowu.soul-terminal.com`；DNS 未完成前使用 Netlify production URL   |

每次接手实时检查 `main` 與 Vercel Production 的 commit；GitHub `main` 仍是唯一源码真相。Vercel `stone-zhaowu-official` 是 canonical 主站；Netlify archive、AppDeploy、Lovable standby 與其他旧临时站只读参考，不得再切回 Production。

歷史（2026-09-19）：Vercel 與 Netlify 曾同時承載 r158/r159。此狀態已被 2026-09-20 supersession 取代；目前只以 Vercel `stone-zhaowu-official` 為 Production。不得把部署 READY 等同真實 iPhone／已安裝 PWA／站主登入验收。

## 2. 已完成且默认锁住

- GitHub `main` 是唯一源码真相。Netlify 只从 `main` 建置同一份 Vite 前端与 canonical API handlers；Vercel 的旧自动部署设定保留但当前不触发。
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
- 2026-09-19 r159：青玉小龍的捷徑與語意導覽同步收起七政、一掌經、紫微等流派入口，全部導向首頁單一完整綜合報告；Netlify 為 canonical 主站，Vercel 保留同版備援。原專項 routes 只保留內部能力與回歸用途。
- `/numerology` 含靈魂獨白、人生角色、五項天賦分述與 11／22／33 區塊分析。首頁不得出現大師數文章標題「你是少見的」。
- 研究札記與《術數的邊界》放在 `/knowledge`「昭梧 · 觀世錄」。首頁觀世錄只留最新一篇與「進入觀世錄」入口。
- r130：背景音樂只播站主後台上傳的曲子（`/api/owner-music`）。不得再播 r129 內建佔位音，也不得把公開播放綁回 Supabase `zhaowu-audio` 公開桶（該桶 live HEAD 回 402）。後台上傳不經 Supabase session。舊檔仍在原桶，解除 spend cap 前無法自動撈回。
- r149：背景音樂改為完整多曲目播放器，直接使用 `/api/owner-music` 返回的站主歌單；固定提供播放／暫停、上一首、下一首、循環播放、隨機播放五個 44px 以上觸控按鈕。循環與隨機偏好存本機；iPhone Safari 首次播放仍保留 user-gesture unlock。
- r156：站主後台統一多選／批量操作。背景音樂上傳後可改顯示名稱，且可多選刪除非播放中曲目；內容圖庫、登入素材、首頁背景與客戶報告均有獨立選取框與批量操作列。圖庫／登入素材／首頁背景可批量啟用、停用、刪除；報告可批量刪除。內置登入素材保持唯讀，正在播放的音樂禁止批量刪除；所有刪除仍須二次確認。
- r157：站主最新 UI 指令把 r149 的獨立右下角播放器 UI `SUPERSEDED`。播放邏輯、完整五鍵控制、owner playlist、loop／shuffle 偏好與 Safari 手勢解鎖全部保留，但只存在於青玉小龍助手內。小龍是唯一 floating entry：預設右下角、可拖動、左右吸邊、位置本機持久化；未展開時間歇隨機顯示導覽或迷你音樂 speech bubble。禁止重新掛回第二個 fixed music dock。
- 首页各分组必须用简短三语说明回答两件事：用户“会知道自己的什么”与“这个体系最擅长看什么”；英文必须自然简洁，不做逐字直译。
- 「趣味测验」是独立的轻量自评系列，不冒充命盘；包含「内在动物 × 命局瑞兽」与「五行功能测验」。五行功能测验只判断当前需要训练的生长、启动、落地、收敛或恢复功能，不等同八字喜用神。
- r160：首頁不再直接攤開全部測驗卡，改為預設收起的單一入口「昭梧 · 心境小測」；點開後保留原測驗、計分、紀錄與路由。公開吉象圖鑑與命詮 Gallery-direct 候選只展示無人物祥紋；舊人像報告圖因面部重影退出圖庫展示，但既有報告母圖與原檔不刪除。
- r161：首頁核心流程置頂；今日、心境小測、吉象圖鑑、觀世錄統一為預設收起且同時只開一區。Header 日夜控制改為文字分段。開場與登入動畫提供使用者手勢聲音控制；Netlify 站主登入修正 Fetch Request body 讀取，站主密碼仍為 `19881004`。
- r162：專業計算 routes 改為站主 Cookie 前置驗證，公開訪客即使知道網址亦會回首頁；Netlify 新增第十一個 canonical handler `/api/owner-data`，站主報告、背景、圖庫、登入素材與命詮圖統一經同源橋接。公開紀錄、知識庫與青玉小龍只再導向首頁完整命盤或心境小測。
- r163：首頁與核心流程採「高級宋式宣紙 × 極簡層級 × 大幅留白」。山水降權為遠景，出生資料、命盤、報告與延伸入口改用不透明暖米紙面；canonical 視覺仍只由 `zhaowu-design-system.css` 最後接管。青玉小龍縮至 52px 並把未展開提示降為約 48–72 秒一次；播放器仍只在小龍內。
- r166：固定宋式遠山背景提高到肉眼可辨識但仍低於內容的權重；首頁暫時移除吉象圖鑑入口與其載入，獨立 `/auspicious-atlas`、素材原件與站主圖庫管理保留。
- r167：站主認定 r166 仍過於寡淡；首頁改為較有份量的礦物色宋畫層級，降低洗白遮罩並加深遠山、深松綠標題、鎏金細線與少量朱砂。宣紙內容仍不透明，手機可讀性與圖鑑首頁隱藏契約不變。
- 「六道习气测验」已独立落地于 `/quiz/six-realms`，只作当下日常惯性自评，不冒充死后去处、前世判定或一掌经排盘。
- 趣味測驗結果可顯示已核准的隱藏神聖圖像；這是結果頁視覺補充，不改命盤計算、報告契約或付費圖片流程。
- Logo／STO-12 已完成，不重新製作。STO-5 普通會員入口廢止已被 2026-09-15 站主最新指令取代：會員登入／註冊必須存在且確認信不得掉進空白頁。
- r155 延續取代舊 Netlify 永久 skip：`netlify.toml` 現在執行正式 build；r162 起由 `netlify/functions` 承載十一個 `/api/*`。站主音樂密封金鑰以 JSON module 納入 serverless bundle，不得退回執行期相對檔案讀取或只有靜態 `dist` 的舊殼。

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

- Header 使用站主核准的金葫蘆＋深藍「昭梧」橫向原圖（`/brand-ui/header-gourd-wordmark-r113.png`），固定在 132 × 54 容器內；r117 已修正舊 CSS 導致的裁切。登入／帳戶／首頁功能 Icon 仍沿用細圓框系統。
- PWA／加入主畫面使用獨立裁切與縮放的 r113 App Icon（`/apple-touch-icon-r113.png` 與 manifest 192／512 尺寸），不得拿 Header 長字標直接替代；瀏覽器 favicon 亦使用獨立輸出。
- Footer 使用橫版「昭梧＋雲紋」標誌。
- 金葫蘆現為核准品牌主體；功能松系圖示仍保留，但不得覆蓋 Header／App Icon。青玉小龍不是品牌 Logo。
- 同一畫面最多兩種裝飾母題。首頁現用「松枝＋山日分隔」；禁止松、月、山、雲、水、印章同時出現。
- 主按鈕金底松綠字膠囊；次按鈕／登出為 Ghost 金框。
- 夜間模式：深松綠／玄黑底、金線、月白字，Header 切換至 `logo-primary-night.svg`；禁止亮白大面積。完整綜合報告、輕測驗、命盤細項必須實色底＋月白字，禁止壁紙透字。
- r27：全站應用頁與登入頁使用米色宣紙底、朱印。固定山水背景已被站主本次指令取代；圖鑑海報不參與背景。
- 表單、結果、命請、登入紙面與工具卡一律使用不透明暖米宣紙 `#faf8f1` / `#fffaf1`，禁止玻璃擬態、半透明卡與厚重浮空陰影。
- iPhone 390–430 px 優先；不使用 `background-attachment: fixed`。
- 動態 owner 背景不再參與前台 shell；圖庫、後台上傳與管理獨立保留。
- 完整報告為一張連續暖宣紙閱讀面。
- 青玉小龙 AI 導覽、Gallery 命請匹配與真實命請圖生成邏輯不因 UI 改版改變。

最終視覺權威：`src/zhaowu-design-system.css` 必須最後載入，舊 CSS 只保留相容依賴，不得再覆蓋 canonical 規則；報告內容結構仍由 `src/focused-report.css` 與現行 renderer 承載。

## 6. 专题报告与 Calculation Truth Layer

`src/lib/ziwei/` 已进入确定性计算数据可用于生产的阶段；其白话专题报告與十二宮命盤保留作內部能力與回歸驗證。primary-source unanimity 仍为 false，紫微计算事实与八字核心保持分层，不得反向覆盖八字锁定逻辑。内部 calculation profile 不进客户画面。

`src/lib/qizheng/engine.ts` 继续负责七政真天象计算；`src/lib/qizheng/plain-summary.ts` 只做內部旁證組合，不改动星体计算。七政對性情、情绪节奏、行动压力、关系取向和机会落地的觀察併入統一報告，不以專卷入口或命盤表向客人展示。内部 debug 口径不进客户画面。

## 7. 2026-09-13 十項收口對帳

舊聊天「先修 Safari、重建 D60、西洋完整盤、真機 Gate、branch protection、Supabase、停 Netlify、Linear、DNS、#295 暫停」不得再當未做任務重做。對帳如下：

| # | 項 | 狀態 |
| --- | --- | --- |
| 1 | Production CI Safari | **PASS** on r129 `7a35307`（Deploy gate／Engine／iPhone Safari 全綠）；r130 合併後再核一次 |
| 2 | D60 minute gate，不 merge #304 | **DONE** on main；#304 CLOSED 未合併 |
| 3 | 西洋完整盤（#310 內容在最新 main）+ 專卷命盤 | **DONE**；未知時辰四軸 fail-closed |
| 4 | 真實 iPhone／PWA／登入／報告重開 | **未完成**（CI ≠ 真機）。r129 獨立 `.js` 登入已上線；r130 後台上傳背景音樂須再核 |
| 5 | GitHub main protection | **DONE**（三項 required checks + enforce_admins） |
| 6 | Supabase advisor／Edge Functions | **文件化**，Dashboard 勾選仍需站主 |
| 7 | Netlify 承載 | **r155 SUPERSEDED**：改為 active host，必須連同十個 Functions 驗證 |
| 8 | Linear STO-12／STO-5、CURRENT-STATE SHA | Logo／舊會員入口已鎖；Linear 未接入無法寫卡。live SHA 對到 `7a35307`（r129） |
| 9 | `zhaowu.soul-terminal.com` | **未完成**；尚未綁到目前 Netlify active host，DNS 無法解析 |
| 10 | PR #295 Paid Visual | **維持暫停**；不 merge、不 rebase |

PR #322 已作為 r128 合併進 `58ee4a9`。獨立站主密鑰登入是現行契約。r128 的 `/api/owner-*.ts` 在 Vite+Vercel 上 FUNCTION_INVOCATION_FAILED；r129 改 `api/*.js` 自包含 Node handler，並把 SPA rewrite 改成不吞 `/api/*`。

## 8. 当前真正未完成

- 正式子域名 `zhaowu.soul-terminal.com` 若仍要啟用，應綁定 Vercel `stone-zhaowu-official` 並完成 DNS／SSL；完成前正式地址是 `https://stone-zhaowu-official.vercel.app/`。
- 真實 iPhone 關鍵流程與已安裝 PWA 自動更新最終實機驗收。GitHub iPhone Safari CI 已通過；這不等於實機完成。
- 八字 chart：刑冲合害关系库、结构病药／通关层与原局→大运→流年→流月作用链已经接入并有确定性测试；但「正式取用／喜用」尚未完成全格局验证，因此生活建议仍不得据此硬推颜色、方位、时段或宠物。
- 付費圖片接線 PR #295 由站主暫停；不得合併或重建，亦不得阻塞免費文字流程。現行圖片失敗必須回退 Gallery-direct，且不得讓文字報告消失。
- Supabase Storage 實查約 1.20 GB，超過 Free plan 1 GB；Storage 與 Edge gateway 回 402 `exceed_storage_size_quota`。解除只能由站主升級／調整帳務，或先核准可刪除／外移的至少約 200 MB 媒體；本版不擅自刪資料。r130 起站主音樂不依賴此桶。
- r162 migration 已把 `get_customer_classic_passage` EXECUTE 限縮為 `service_role`，既有 helper `search_path` 維持 hardened；`zhaowu-owner-data` Edge Function 已部署 v3。Supabase leaked-password protection 仍需站主在 Dashboard 啟用；容量 402 解除前 live Edge gateway 仍不可用。
- Linear STO-12／STO-5 無法從本環境寫入（Linear 未接入）；以本文件與 Instruction Registry 為準，不重做 Logo。會員登入／註冊以 r139 為準。

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

每次改网站之前：读 `AGENTS.md` 与本文件；查实时 `main` + Vercel Production；Netlify 只作歷史 archive，不得視為 canonical；只处理当前可复现问题。新指令与旧指令冲突时，按 AGENTS 的安全 supersession 规则使旧 active path 失效，但不得破坏运行依赖。

- r164：日／夜使用直接選擇按鈕，報告與小龍補齊夜間文字對比；維持 r163 紙面及單一浮動入口。
- r165：最終產品收線為「昭梧命書」：一次生辰 → 規則排盤 → 子平結構主判 → 後台多法旁證 → 一份連續命書 → 繼續提問。此後不再以增加流派入口、首頁卡片或獨立工具作為產品主線；排盤與解讀保持分層，解讀不得重算或改寫四柱。同一命書內提供可複製的 AI 可讀命盤資料包、計算口徑、核對方法與版本追溯；不得用虛構樣本數或「最準」口號代替可重現證據。
- r166：首頁背景必須能直接看見固定宋式遠山，但宣紙卡片仍保持不透明；首頁延伸內容只留今日、心境小測與觀世錄，吉象圖鑑及其資料請求暫時退出首頁，後台與獨立圖鑑頁不刪除。
- r167：首頁不得再以大面積低對比米白把宋畫與品牌色洗平；山水可維持內容之下的背景層級，但需保留可辨識的墨線、礦物色與深淺。主標、主要紙面及延伸入口以深松綠、鎏金細線、少量朱砂建立層級，不增加新區塊或裝飾堆疊。
- r169：依站主截圖清除首頁、命盤、命書、登入與安裝提示中的內部流程旁白與重複說明。方法與計算規則保留，不再強迫客人閱讀；命盤「如何核對」僅保留簡短發布 Gate：核心排盤規則變更後重跑固定回歸，偏離鎖定基準則不得發布，且不得把此 Gate 宣稱為解讀正確率。Sites 畫面與 Netlify 部署須分別驗證，不混稱已上線。
