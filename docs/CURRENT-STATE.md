# 昭梧｜CURRENT STATE

最後核對：2026-09-24 11:35 AEST

> 本文件只保留「現在仍有效」的事實與規則。歷史版本請看 Git history／change reports；舊聊天、舊 Issue、舊部署說明若與本文件、AGENTS.md、current main 或 current Production 衝突，一律不具執行權。

## 1. 唯一 Production

- GitHub：`stoneweiwei-dot/zhaowu`
- Branch：`main`
- current main：以 GitHub `main` 即時 SHA 為準；不得把文件內固定 SHA 當永久 CURRENT。
- Hosting：Vercel
- Project：`stone-zhaowu-official`
- Production URL：`https://stone-zhaowu-official.vercel.app/`
- current Production：以 Vercel `stone-zhaowu-official` Production 即時 SHA 為準。
- 發布前必須確認 Production SHA = current main SHA。
- Vercel Git policy：只有 `main` 可觸發 Production；`deploymentEnabled` 以 `**: false + main: true` 覆蓋含 `/` 的分支名，`ignoreCommand` 再用 `VERCEL_GIT_COMMIT_REF != main` 作第二道硬擋；純 docs/Markdown／GitHub workflow 變更亦跳過。
- Netlify：archive only；不得作 Production／canonical／fallback truth。
- AppDeploy／Sites／Floot／Dropbox：只可作開發、管理、資產或備份工具，不得成為訪客 runtime 必要依賴。

## 2. 公開產品 CURRENT

最終產品收線為「昭梧命書」。

不再以增加流派入口、首頁卡片或獨立工具作為產品主線。

唯一公開主流程：

**出生資料 → 四柱與基礎解釋 → 單一完整報告 → 可選追問**

- 七個公開專卷入口已退出 active path。
- 專項 routes（紫微／七政／西占／印度古法／一掌等）保留作站主／內部能力與回歸驗證。
- 首頁吉象圖鑑入口隱藏；獨立頁與站主圖庫保留。
- 完整報告第一屏只保留原問題、1–3 句直接答案與最多一個現實下一步；可信度、最大變數、命盤與完整分析過程不得與主答案並排。
- 「查看補充重點」最多顯示三項真正會改變判斷的內容；其餘推演、技術盤、完整 reasons/risks/timing/actions 一律收進最下方的「判斷備註」。
- 新報告持久化契約仍為 `summary / body`；客戶前端只呈現一份連續閱讀層，不復活九頁／四卡／多 session。
- r189 起，直接答案與補充重點之後生成一次「一盤一景」：專屬題名、統一場景、天地／場域／主體／出口、力量與代價、單一行動及可折疊證據映射。它仍屬同一份報告，不新增保存區塊。
- 現行完整報告敘事契約為 `docs/PAID-REPORT-STYLE-v2.0.md`；v1.0 只作歷史參考。時辰未知時不得補造固定法器、晚景或精細應期。
- 圖片／provider／背景失敗不得阻塞文字答案。
- 身體內容只作傳統象義提醒，不作醫療診斷。

唯一報告契約：`docs/FOCUSED-REPORT.md`。

## 3. Login／身份

- 公開訪客：guest-first，本機保存生辰與一般使用狀態；核心問答不要求會員帳號。
- `/login`：目前是 **owner-only login**。
- 站主登入：獨立 owner cookie／owner session，不依賴 Supabase Auth。
- 不得復活公開 Email／OAuth／註冊 active path，除非站主另行明確下令。

## 4. 語言

公開 selector 只有：

- 繁體中文
- English

ko／hi／zh-Hans／ja 原始碼或相容 bridge 可保留，但不得出現在公開 selector，也不得阻塞 Production 驗收。

## 5. 視覺權威

- `src/main.tsx` 全域 CSS 載入順序：
  1. `styles.css`
  2. `legacy-visual-compat.css`
  3. `zhaowu-design-system.css`
- `zhaowu-design-system.css` 是最後 visual authority。
- 不再新增新的 `visual-hotfix-rXXX.css` 全域入口。
- SiteShell 語言列不得用 inline style 與 canonical CSS 打架。
- iPhone 優先；主要 touch target >=44px；表單控制文字 16px，避免 Safari auto zoom。
- 浮動 UI 只有青玉小龍；播放器控制整合在小龍內，不得掛第二個 fixed music dock。
- 手機頁面不得要求左右拖動。
- r185 起夜間模式必須按「表面」配色：米白／宣紙卡保持深墨正文；只有深松綠等暗色承載面使用月白字。禁止再用全域 night 文字變亮覆蓋整個 result flow。
- r186 起首頁視覺採單一「宋式編輯排版」權威：禁止以大膠囊、大圓角卡片牆、深綠大色塊作主要資訊架構；Header 為細字導覽，Hero 以宋體＋留白＋細線構成，Disclosure 以分隔列呈現。
- r186 核心閱讀面（生辰／命盤／問題／報告）統一為低圓角暖紙；Night mode 為墨色背景＋暖紙正文，不把整頁染成暗綠。
- r186 青玉小龍維持唯一浮動入口，但入口縮至 44–46px、主動泡泡隱藏；展開面固定為小型底部抽屜，不得再覆蓋大半個 iPhone 畫面。
- r187 起 English 是獨立排版系統，不得把中文尺寸直接換成英文字符串：Latin 標題使用 Iowan Old Style／Baskerville／Georgia fallback，UI 使用 Avenir Next／SF Pro／system sans；手機 English Header 分成品牌／更新／語言與外觀三列，禁止長字串互相交叉或壓住。
- r187 起站主後台執行「資訊減法」：分區下方不再放教學式／解釋式 helper copy；只保留標題、狀態、操作與必要資料。Storage freeze 只用單行 short status。
- r188 起新增「宋式小漫畫翻譯層」：宋式仍是唯一視覺骨架；漫畫只允許出現在首頁「今日一格」、命書核心底盤後單一白話插頁、命書末端分享一格。不得擴張成新工具入口、卡片牆或第二套品牌視覺。
- r188 漫畫角色只用本機 React／SVG，依五行切換柔和色系；不得為漫畫層新增 Supabase Storage 寫入或付費圖片 provider。漫畫只翻譯概念，不得修改排盤／格局／用神／吉凶 truth。
- r190 起首頁完整命盤細節採 lazy mount：只有使用者展開後才掛載完整命書；核心生辰錄入、四柱與基礎解釋必須先 fail-open。
- r191 起命書新增「結構不是平衡表」治理：五行不以平均為目標、十干無先天高下；「使命／為何而生」只轉譯為結構功能與反覆課題；圖像／神獸／漫畫只能由既有主判向下翻譯，禁止反推格局、喜用或吉凶。

- r192 起正式站與昭梧 Lite 採「雙入口、單核心」：正式站是唯一完整產品／Production；zhaowu-guide.ston1004.chatgpt.site 保留為免費快速體驗與備援，不另建帳號、付費、Supabase 或第二套命理核心。正式站吸收 Lite 的 560px 手機優先比例、米紙／青玉／朱砂色系與低陰影卡片層級。

## 6. Loading／Login animation

r184–r185 依 2026-09-23 真 iPhone Safari 驗收修正：

- 首頁恢復 **一次性 Loading／IntroGate**；同一瀏覽器只在第一次進首頁顯示。
- seen key 使用穩定的 `zhaowu.intro.seen.public.v1`；看過後 refresh、返回、一般路由與報告頁不得重播。
- `zhaowu.intro.force=1` 仍可作測試強制顯示；初始化失敗必須 hard-exit／fail-open，不得白屏。
- `/login` 仍保留 r183 的全屏動態站主登入舞台與聲音控制；首頁 Loading 與 Login 動畫是兩個不同用途，不得互相取代。
- r181 Storage 寫入凍結期間，新上傳登入影片不得寫入 Supabase；runtime 仍只使用正式 build 內 same-origin 素材。

## 7. Supabase

主專案：`plgpxusmemnmzckbwtiv`。

- Database 專案可讀；站主登入不走 Supabase Auth。
- 2026-09-24 Storage 已完成安全清理：39 個 live audit 確認零引用的物件已透過 Storage API 刪除，共回收 160,741,199 bytes；清理後為 **549 objects / 1,035,403,153 bytes**。
- Storage／Edge 曾回 402 `exceed_storage_size_quota`。
- r181 起 **所有新增 Supabase Storage 寫入已凍結**：背景、站主圖庫、登入素材、新命誥圖不得新增；現有內容仍可讀取／管理。
- r174 已把 Supabase 從公開站 startup critical path 移除：資料服務失敗時首頁／命盤／問答必須 fail-open。
- 不得直接 SQL DELETE `storage.objects` 冒充刪除檔案。
- 已即時核對 39 個零引用候選：14 audio／2 gallery／23 report images，共 160,741,199 bytes；manifest SHA-256 = `e73337b3bc7119f78a014fd557f0970306e5cab04f792496a8995cbea8d5396e`。report images 已加查目前欄位、歷史 JSON、blueprint 與 settings，不再只是未覆核 quarantine。
- 2026-09-23 兩條正式刪除路徑均被組織級限制拒絕：Edge Function 與直接 Storage API 都回 402，實際刪除數為 0。一次性精確路徑 policy 已撤銷；`admin-storage-cleanup-execute-once` v10 為 `verify_jwt=true` 的 410 retired stub。
- Free 組織目前無零成本即時解鎖入口；不得擅自升級、解除消費上限或 SQL DELETE `storage.objects`。額度週期重置／限制解除後先重跑 live audit，manifest 完全一致才可用 Storage API remove，刪後再復算全桶實體用量。
- 先前僅按 `background_assets` 判定出的 4 個「background orphan」其實仍被 `gallery_assets(bucket_id='zhaowu-backgrounds')` 以 enabled 資產引用，**禁止刪除**。
- `admin-storage-cleanup-execute-once` v7 的候選解析漏掉上述 cross-bucket `gallery_assets` 引用；不得再啟用 v7 邏輯。現行 v10 為 410 retired stub 並要求 JWT；Owner dry-run audit v10 已補上 cross-bucket reference。
- 刪除前 live 實體基線為 1,196,144,352 bytes：backgrounds 291 objects／627,245,539 bytes、gallery 249／370,798,037、report images 33／116,286,938、audio 15／81,813,838。279 個 `background_assets` metadata row 目前全為 enabled=true；禁止整包刪。未完成搬遷／引用核對前，不刪 private report images、仍被任何 metadata reference 的資產或 rollback 必要原件。

第二個 Supabase project `zhaowu-core` 目前 INACTIVE；不得擅自切 Production 過去。

## 8. Floot／Dropbox

- Floot `Zhaowu Media Vault` 可作媒體外移目標，但目前 workspace asset upload 已回 `storage quota exceeded`；不得宣稱 Supabase→Floot 遷移完成。
- Floot 不得成為訪客 runtime 必要依賴。
- Dropbox 目前不在 Production runtime；只可作冷備份／人工資產保存。

## 9. 已鎖核心

沒有明確新需求與完整 regression，不改：

- `src/lib/palm/engine.ts`
- `src/lib/core/method.ts`
- `src/lib/bazi/calendar.ts`
- `src/lib/bazi/chart.ts`
- `src/lib/bazi/interpret.ts` 的核心分類順序
- auth／payment／Supabase schema

子時規則保持 current 實作：23:00–23:59:59 按出生地當地當日；00:00 後次日，並處理時區／DST／真太陽時。不得復活舊「23:00 直接換日」。

## 10. 真正仍未完成

### P0
- 發布時必須確認 Vercel Production SHA = current main SHA。
- STO-5／STO-20 真 iPhone Safari 最終實機驗收尚未完成。
- Supabase Storage 超額清理已完成；Storage write freeze 繼續保留，避免重新超額。

### P1 / Backlog
- STO-14 可選命誥圖真 provider 維持 Backlog；未重啟前不得消耗 provider 額度。
- 自訂子域名只有在站主重新指定並完成 DNS/SSL 後才取代 Vercel URL；目前 canonical 不變。

## 11. Done Gate

不得再使用「基本完成／差最後一步／可以收官」作完成判定。

只有同時有證據證明：

1. current main 的必要 CI／contract gate 通過；
2. Vercel Production SHA = current main SHA；
3. 正式站首頁／Login／出生表單／完整報告可用；
4. 真 iPhone Safari 無白屏、橫向 overflow、safe-area／鍵盤遮擋、雙 floating UI；夜間模式所有主要文字與次要文字均保持可讀對比；
5. refresh／返回／前進／切 App／鎖屏恢復正常；
6. 首頁首次進入顯示一次 Loading；同一瀏覽器 refresh／回訪不重播；/login 動畫與聲音控制正常；
7. owner login／session restore／logout 正常；
8. Supabase 失效時公開核心流程仍 fail-open；

才可以把 STO-5／STO-20 標 Done。

CI、PR merge、Preview、單純 Vercel READY、桌面 viewport、文件描述均不能單獨代替 Production＋真機證據。


### r182 趣味測驗｜修仙命格靈測
- 首頁「昭梧 · 心境小測」新增 `/quiz/cultivation-destiny`。
- 來源：裝置既有生辰 → 現行 `buildChart()` 八字／五行 truth；MBTI 可選且低權重。
- 輸出：靈根／品階、宗門峰脈、入門身份、六維、九大道途、諸宗適性、三句機驗、修行命途與 9:16 個人命測圖。
- 命測圖完全在瀏覽器本機生成，不新增 Supabase Storage 寫入，不使用付費圖片 provider；r181 Storage freeze 維持。
- 邊界：仙俠結果只作趣味世界觀，不修改正式命盤；紫微未經校驗時不補造盤面。
