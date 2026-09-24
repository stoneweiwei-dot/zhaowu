# 昭梧｜CURRENT STATE

最後核對：2026-09-24 13:48 AEST

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
- r187 起站主後台執行「資訊減法」：分區下方不再放教學式／解釋式 helper copy；只保留標題、狀態、操作與必要資料。任何 Storage 狀態只用單行 short status。
- r188 起新增「宋式小漫畫翻譯層」：宋式仍是唯一視覺骨架；漫畫只允許出現在首頁「今日一格」、命書核心底盤後單一白話插頁、命書末端分享一格。不得擴張成新工具入口、卡片牆或第二套品牌視覺。
- r188 漫畫角色只用本機 React／SVG，依五行切換柔和色系；不得為漫畫層新增 Supabase Storage 寫入或付費圖片 provider。漫畫只翻譯概念，不得修改排盤／格局／用神／吉凶 truth。
- r190 起首頁完整命盤細節採 lazy mount：只有使用者展開後才掛載完整命書；核心生辰錄入、四柱與基礎解釋必須先 fail-open。
- r191 起命書新增「結構不是平衡表」治理：五行不以平均為目標、十干無先天高下；「使命／為何而生」只轉譯為結構功能與反覆課題；圖像／神獸／漫畫只能由既有主判向下翻譯，禁止反推格局、喜用或吉凶。
- r192 起完整報告執行客戶文案減法：不再顯示 `PERSONAL ANALYSIS`、`YOUR QUESTION`、`Reasoning notes`、`Chart basics` 等 prompt／dashboard 式標題；只保留問題、答案、補充、四柱、附註、依據與下一步等成品語言。
- r192 起 `STONE-R6.2.2-CURRENT-MASTER.md` 為 CURRENT governance/evidence master；deterministic runtime 仍為 R6.2.1 + P2 + P3（含 r191 結構增補），不得把治理版本號冒充排盤核心重寫。
- r192 起首頁漫畫、生辰流程與安裝提示各自有 fail-open boundary；單一區塊或舊本機資料異常不得再拖垮整頁。
- r192 手機閱讀面收至最寬 560px，採暖紙／青玉／朱砂節制配色與小圓角；這只是正式站的視覺層，不引入 Lite 站的獨立流程、登入或 Storage 寫入。
- r193 修正正式站實測發現的夜間對比回歸：英文 Header 切換、延伸入口主／次文字與暖紙內容面第二步標題必須保持可讀；只改 CSS，不改功能或命理核心。

## 6. Loading／Login animation

r191 依站主最新指令修正：

- `/login` 是唯一登入動畫入口；首頁、一般分區、報告頁與返回導覽一律不掛載 `IntroGate`。
- 每次站主登入流程只在首次進入 `/login` 播放一次；影片不循環，播完使用靜態封面。切到其他 route 再返回 `/login` 不重播；站主主動登出後才開始下一次登入流程。
- 後台「登入動畫管理」只列出具有 `login-background` 標記的 MP4／WebM；普通圖片、背景圖及封面圖不會成為動畫卡片，新增上傳也只接受 MP4／WebM。
- 歷史 `IntroGate` 元件與 policy 只留回歸／相容參照，不得重新接回公開 runtime。
- r194 起 Supabase Pro 已由站主明確批准，舊 r181 Free 容量寫入凍結退出 active path；runtime 的既有 same-origin fallback 保留。
- r194：登入影片最多播放 15 秒，結束後顯示封面；喇叭圖示為單一聲音控制，觸控區至少 44px。站主影片管理器接受 MP4／WebM、時長上限 15 秒、單檔上限 500 MB；大於 6 MB 使用 Supabase TUS 斷點續傳。系統不在瀏覽器內轉碼，來源檔須已是可播放的 15 秒內成品。
- r196：完整綜合報告新增「完整命書／漫畫 Lite」雙閱讀模式，預設漫畫 Lite 六格；每格可展開同一份完整報告原文。這是呈現層，不新增 calculation、Storage、AI provider 或 payment gate。\n- r197：站主 `/gallery` 素材後台改為「登入影片／內容圖片」二選一分頁，一次只渲染一個管理器；登入影片、總圖庫、背景與報告的批量工具列只有先勾選項目後才顯示。功能、Owner 權限、Storage 寫入與資料結構不變。\n- r197：已安裝 PWA 以 release metadata + service worker 前景檢查吸收新正式版本，不要求刪除 App 重裝。

## 7. Supabase

主專案：`plgpxusmemnmzckbwtiv`。

- Database 專案可讀；站主登入不走 Supabase Auth。
- 2026-09-24 已完成第一輪安全清理：39 個確認零引用的物件經 Storage API 刪除，共回收 160,741,199 bytes。r197 收官實測為 **552 objects / 1,033,390,182 bytes（約 0.962 GiB）**：audio 1／3,869,936 bytes、backgrounds 291／627,245,539、gallery 250／371,049,622、report images 10／31,225,085。組織為站主批准的 Pro，包含 100 GB Storage；現有用量約 1.033%，尚有約 98.97 GB 包含額度。
- Storage／Edge 曾回 402 `exceed_storage_size_quota`。
- r194 起背景、站主圖庫、登入素材與命誥圖寫入恢復；舊 r181 Free-plan write freeze 已被站主最新 Pro 指令取代。
- r174 已把 Supabase 從公開站 startup critical path 移除：資料服務失敗時首頁／命盤／問答必須 fail-open。
- 不得直接 SQL DELETE `storage.objects` 冒充刪除檔案。
- 本次已刪清單原始 manifest SHA-256 = `e73337b3bc7119f78a014fd557f0970306e5cab04f792496a8995cbea8d5396e`；14 audio／2 gallery／23 report images 的當前欄位、歷史 JSON、blueprint 與 settings 引用均已於刪除前核對。此 manifest 已用完，不得再次當作待刪清單。
- 2026-09-23 的 402 為清理前歷史阻塞；2026-09-24 額度解除後才完成正式 Storage API 刪除。一次性精確路徑 policy 已撤銷；`admin-storage-cleanup-execute-once` 現行 v17 為 `verify_jwt=true` 的 410 retired stub。
- 剩餘同內容物件的 eTag 理論去重上限約 56,245,616 bytes；它們可能同時受背景、圖庫或私人報告引用。即使 Pro 容量充足，任何後續清理仍須重新核對用途與引用，用 Storage API 刪除並復算容量。
- 先前僅按 `background_assets` 判定出的 4 個「background orphan」其實仍被 `gallery_assets(bucket_id='zhaowu-backgrounds')` 以 enabled 資產引用，**禁止刪除**。
- `admin-storage-cleanup-execute-once` v7 的候選解析漏掉上述 cross-bucket `gallery_assets` 引用；不得再啟用 v7 邏輯。現行 v17 為 410 retired stub 並要求 JWT；Owner dry-run audit 已補上 cross-bucket reference。
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
- r197 已確認 Vercel Production SHA = current main SHA 9fd7c6e6d72925b385ed05e8cd803e92f871033a；之後每次發布仍須重新驗證 exact SHA。
- Deploy gate、Engine suite 753/753、iPhone Safari CI 均 PASS；STO-5／STO-20 **真實體 iPhone Safari** 最終人工驗收仍未完成，CI／模擬器不得冒充實機證據。
- 站主登入後的 /account／/gallery 真實視覺驗收仍缺已驗證 owner session；r197 已完成 source contract、HTTP、CI 與 Production exact-SHA 證據，不得把「缺憑證的人工視覺」冒充已跑。
- Supabase release_history 已寫入 r197／197，source commit = 9fd7c6e6d72925b385ed05e8cd803e92f871033a，verification = READY_MAIN_SHA_MATCH。
- 《菜根譚》APP 截圖 37 條已完成逐條校勘並結案：28 條升為 verified direct quote；1 條確認誤歸《菜根譚》（實出《圍爐夜話》）；8 條因關鍵字／詞序／漏字與可靠底本不一致，保留截圖轉錄但改為 not_applicable，不進古籍直引池。全庫現況為 **38 verified / 0 pending / 15 not_applicable**，且非 verified 卻標 direct quote 的筆數為 0。
- Supabase Security Advisor 的 4 個 rls_enabled_no_policy 為 service_role-only 表；anon／authenticated 無 table grants，現況是 deny-by-default，不得為消除 INFO 提示而新增寬鬆 policy。Auth 目前有 8 個 Supabase users，Leaked Password Protection 仍為平台設定 WARN；現有 MCP 無 Auth Password Security 寫入能力，禁止用 SQL 假裝已開啟。
- Supabase 組織目前為 Pro；Storage 實測 1,033,390,182 bytes / 100 GB 包含額度，寫入已恢復。仍須避免重複素材；任何刪除繼續先核對引用並只用 Storage API。

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
6. 首頁及其他公開路由不掛載 IntroGate；/login 在單次站主登入流程只播一次、最長 15 秒，refresh／返回不重播，聲音控制正常；
7. owner login／session restore／logout 正常；
8. Supabase 失效時公開核心流程仍 fail-open；

才可以把 STO-5／STO-20 標 Done。

CI、PR merge、Preview、單純 Vercel READY、桌面 viewport、文件描述均不能單獨代替 Production＋真機證據。


### r182 趣味測驗｜修仙命格靈測
- 首頁「昭梧 · 心境小測」新增 `/quiz/cultivation-destiny`。
- 來源：裝置既有生辰 → 現行 `buildChart()` 八字／五行 truth；MBTI 可選且低權重。
- 輸出：靈根／品階、宗門峰脈、入門身份、六維、九大道途、諸宗適性、三句機驗、修行命途與 9:16 個人命測圖。
- 命測圖完全在瀏覽器本機生成，不新增 Supabase Storage 寫入，不使用付費圖片 provider；此成本隔離契約與 r194 恢復其他 owner Storage 寫入相容。
- 邊界：仙俠結果只作趣味世界觀，不修改正式命盤；紫微未經校驗時不補造盤面。
