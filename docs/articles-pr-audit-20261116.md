# 網站文章漏發核對（2026-11-16）

核對方式：以最新 `origin/main`（fetch 後 worktree HEAD `353ed04b95f15b89da38f719f1a70631df5afbae`）檢查文章 registry/舊 slug；以 Playwright 開啟正式站 `/knowledge`，實際找到 70 個 `article-*` 節點並逐 ID 比對。這是瀏覽器渲染後的目錄檢查，不以 200 回應或 sitemap 數量代替文章可見性。正式站 sitemap 本次為 330 個 URL；知識頁 6 個教學頁不等於 70 篇公開文章。

| 標題 | 來源檔（path／PR） | 是否在 main | 是否在正式站 | 是否有原稿 | 備註 |
|---|---|---:|---:|---:|---|
| 採生折割：律文、志怪與刑案 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 已在公開目錄；依整併決策導知識頁 overview，非獨立合併稿。 |
| 情緒有度，處世有方：四個步驟，讓溝通更有分寸 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 無常之中，何以見生機？ | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 善財童子五十三參：在欲望與威怒之中求智慧 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | PR #1038 還原；此舊錨點依 map 導 overview（14 篇之一）；已合併並可在 70 篇目錄看到。 |
| 改變命運的，不只是風水：從心念、因果到有分寸的行動 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 照見本心：從覺察、慈悲到日常修行 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 生命之門：從古埃及 Ankh 到宇宙模擬論 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 已在公開目錄；依整併決策導知識頁 overview，非獨立合併稿。 |
| 2027 丁未｜火入土庫，盛極而藏 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 2026 丙午｜赤馬之年，火勢與人事 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 七張文化圖鑑：從農曆干支到修心之路 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 已在公開目錄；依整併決策導知識頁 overview，非獨立合併稿。 |
| 2025–2030 文明時間軸：命理、玄學與文明週期交叉分析 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| AI 是在創造智慧，還是在給「無形意識」一個身體？ | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 已在公開目錄；依整併決策導知識頁 overview，非獨立合併稿。 |
| 三界三十一界：佛教宇宙觀，不只是三十一層天 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 已在公開目錄；依整併決策導知識頁 overview，非獨立合併稿。 |
| CERN 停機，到底在隱藏什麼？科學、神祕儀式與傳送門傳聞 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 已在公開目錄；依整併決策導知識頁 overview，非獨立合併稿。 |
| 恆星的一生：從星雲、主序星到白矮星 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 已在公開目錄；依整併決策導知識頁 overview，非獨立合併稿。 |
| 人多少要懂一點玄學 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 一日有香：從宋人香事到今人的晨昏 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 已在公開目錄；依整併決策導知識頁 overview，非獨立合併稿。 |
| 時間真的變快了嗎？從物理時間、主觀時間到「一天只剩 16 小時」 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 已在公開目錄；依整併決策導知識頁 overview，非獨立合併稿。 |
| 黃泉與輪迴：中國本土幽冥世界如何遇上佛教六道 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 已在公開目錄；依整併決策導知識頁 overview，非獨立合併稿。 |
| 見局，破局，歸自己 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 沒有神蹟之後，人怎麼修行 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 你不是缺什麼，而是有些力量還沒有用對地方 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 術數的最後，不是問天，而是決於人 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 去哪裡求財？月支可以看環境取象，但不能只看一個字 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 十神看你最容易嫌棄誰？從「不順眼」看見命局裡的關係模式 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 相由心生，不是命由臉定：一張臉如何留下心性的痕跡 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 真正的風水，在自己身上：心念、口德與行為 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 華蓋不是孤星：從墓庫歸藏，到一個人如何真正成器 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 十天干與身體象義：如何看先天體質與時間觸發 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 喜用神不等於審美偏好：為什麼需要木火的人，反而會愛金水？ | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 三教同修：命理裡所謂「天選之人」，真正要修的是什麼？ | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 從上古到末法：天地為什麼離人間越來越遠？ | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 一個人可能抵達的最高境界：自知、自勝與無為 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 七殺不是凶星：一頭猛虎，究竟是壓力、權力，還是反噬？ | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 知命不認命：財運、財庫、偏財與福報，到底該怎麼理解 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 六種心的功夫：懺、悲、緣、放、常、果 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 自知、自勝、知足：修行不是往高處爬，而是少被外境牽走 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 行功立德：內修八佰果，外行三千功，修行才真正落地 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 修行在日常：情緒升起之後，你還有第二個選擇 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 不困於昨日，不憂於未來 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 明心見性：真正要修的不是一個念頭，而是意根與深層習氣 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 福德與智慧：善根、福德資糧、止觀、無住與慈悲如何連成一條路 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 放下與止損：別讓已經付出的代價綁架下一個選擇 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 知人、自知；勝人、自勝 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 知命不是宿命：命理可以照見結構，不能替你活 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 善良有界線：關心、孝親與責任要分開 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 外境再雜，心中自有清明 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 知因了果：因果不是一句懲罰論，而是學會看事情如何形成 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 你想要的是擁有，還是占有 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 花開花落，心不隨境轉 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 五眼之說：肉眼、天眼、慧眼、法眼、佛眼，到底在看什麼 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 已在公開目錄；依整併決策導知識頁 overview，非獨立合併稿。 |
| 火裡栽蓮：逆境、秉性與自勝，才是修行真正的爐火 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 真正的風水：環境會影響人，人也在塑造環境 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 因上努力，果上隨緣 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 不當真，便不被一念困住 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 補充加場：宇宙真諦、陰陽進化論與多維意識模型 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 已在公開目錄；依整併決策導知識頁 overview，非獨立合併稿。 |
| 看清規律：努力很重要，但努力本身不保證結果 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 財可求，但心不能亂：先把現金流做成秩序 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 五行不是五個盒子：把它看成動勢，才看得見流通 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 世界是一面鏡嗎？先把「心識投射」還原成一種觀看方式 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 已在公開目錄；依整併決策導知識頁 overview，非獨立合併稿。 |
| 高敏感真正需要的，不是標籤，是邊界 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 關係走到最後，不過相識一場 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 愛會照人：關係裡最難的，是不把自己弄丟 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 流水不爭先，爭的是滔滔不絕 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 同頻不是入口：進入世界，仍不丟掉自己 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 順勢不是認命：從《滴天髓》的「順與悖」說起 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 人生修行的五個支柱：認知、心境、情緒、關係與行動 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 所謂高能量，最後看的其實是承載力 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 破局之前，先修心 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 信念不是魔法，它會改變你的選擇 | `article-video-plan.md` §公開文章清單；`redirect-map.json` | 是 | 是 | 是 | 公開目錄可見；本次作為 70 篇整併來源（不代表此舊文 URL 保留）。 |
| 《因果、善意與行動》（頁面標題：改變命運的，不只是風水：從心念、因果到有分寸的行動） | GPT inventory §文章／PR #930 | 是 | 是 | 是 | GPT 曾稱 PR #930 合併並核對正式站；現時 main 與正式站目錄均找到 `cause-action-kindness-life`。已納入本次第 8 篇「真正的風水，先在自己身上」。 |
| 封神榜主神系列 | GPT inventory §圖像與文章規劃 | 否（未找到此系列文章） | 否（70 篇目錄無此標題／slug） | 系列規劃稿有；未見已成網站文章原稿 | GPT 註記「網站文章專欄未證實更新」，不是已發布聲稱，也未找到明確網站發文交辦；列待核，不計漏發。 |
| 八景宮九景：從瀚海滄溟到混沌鴻蒙（圖文專題草稿） | `drive/draft-bajinggong-nine-scenes.md` | 是（`/bajinggong`） | 是（正式站 `/bajinggong` 公開專頁） | 是 | Drive 原稿明言當時尚未發布；後續 main 和正式站已出現九幅原畫專題，故不是目前漏發。不併入 11 篇，避免圖文專題扭曲長文。 |
| 核心頁補靜態可索引正文（SEO） | `drive/task-seo-static-body.md` | 否（任務單不等同文章） | 否（非新文章頁） | 任務規格有，尚待執行 | 明確待辦、靜態正文任務；按規則列待辦，不計漏發或 GPT 已發布聲稱。 |
| 補五行底層邏輯解析（對話稿） | `drive/draft-buxing-analysis.md` | 否（未找到對應文章 slug） | 否（未找到匹配頁） | 是 | 對話分析稿；未見明確 zhao-wu.com 上站交辦，也無匹配 live 頁，標記「非明確上站交辦」，不計漏發。 |
| 13 篇未上架舊稿（計畫只記數量，無標題清單） | `article-video-plan.md` §結論 | 無法逐篇核對（來源未提供名稱） | 無法逐篇核對（來源未提供名稱） | 來源僅提及數量 | 計畫稱主題已由精簡版吸收；既有 11 篇 README 記錄這批未納入公開 70 篇 redirect。因所給來源沒有 13 個標題或檔案路徑，不虛構逐篇狀態；不納入本次 11 篇。 |
| PR #1038：19 篇觀世錄候選稿 | PR #1038、`docs/RESTORE-ARTICLES-20261112.md` | 是（PR 已於 2026-11-12 合併） | 是（其獨立稿中已納入的文章可在 70 篇目錄見到；重複題材由現有頁承載） | 是 | PR #1038 mergedAt 已核實；實際保留 13 篇獨立文章、排除 6 篇重複題材，另有 1 篇情商文章。不是 19 篇全部作為新公開條目。13 個 ID：world-as-mirror-not-physics、money-needs-order-not-anxiety、five-elements-as-movement、frequency-is-not-the-entrance、sensitivity-needs-boundaries、love-reveals-the-unfinished-self、capacity-is-real-energy、follow-the-flow-not-surrender、five-pillars-of-practice、break-the-deadlock、belief-and-world、relationships-and-boundaries、long-term-practice；這些題材已在本次整併 map 中分流／overview。 |
| 微信公眾號首篇（社群發布） | GPT inventory §微信公眾號 | 不適用 | 不適用 | 是 | 僅公眾號，不是 zhao-wu.com 網站發布任務；不列漏發。 |

## 三行摘要

- 實際上站幾篇：70 篇舊目錄文章在正式站 `/knowledge` 渲染可見（另有九景圖志專頁；PR #1038 已合併，13 篇獨立內容／1 篇情商稿的實際可見內容包含於目前目錄）。
- 漏發幾篇：0 篇已能確認的網站發布任務漏發；待核項目為封神榜系列（未證實上站且無明確發文交辦）、SEO 靜態正文（明確待辦）、13 篇舊稿（提供來源未列標題，不能逐篇點名）；《八景宮九景》原稿雖曾標未發布，現已上站。
- 哪些已納入本次 11 篇合併：70 篇舊文依 `redirect-map.json` 分組，尤其第 8 篇收錄因果／風水相關來源、第 11 篇收錄修行來源；PR #1038 的 13 個獨立題材按 README/map 分流或 overview，並非另外加第 12 篇。
