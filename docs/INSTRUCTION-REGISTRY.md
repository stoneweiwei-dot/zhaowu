## 2026-10-27｜《怪力亂神》獨立書目分組（站主最新指令）

- ACTIVE：將剛發布的《怪力亂神》七卷、十二地支四態與大裂隙十年編年開成一個可直接進入的獨立網站「分組」，設置輕量書目入口 `/guaili-luanshen`，從首頁《黃泉紀》畫作入口旁及既有《幽明萬象錄》目錄可見。
- ACTIVE：新頁**只作索引與導覽，不複製第二份七卷正文**；所有卷、生肖與編年連回同一 `/mythic-atlas` 正文各自的固定錨點。舊的 `/mythic-atlas#guaili`、十二原畫與《借星》連結原樣保留。
- COMPATIBLE／SUPERSEDES PART ONLY：2026-10-24「不另開重複路由」原則仍禁止第二份神話資料庫；本次站主新增之書目索引為不同目的，不構成重複正典，不更名原本的《幽明萬象錄》。
- ACTIVE：三語 title/description、sitemap、390／320px 窄屏閱讀、既有 STONE 真正 WebP 畫作，不新增幾何假圖、付費服務或第二個 Vercel。
- PROTECTED：命盤／付款／登入／報告／Supabase、全站節氣主題與既有原畫，不修改。

## 2026-10-26｜站主後台影片與優惠碼去雜訊

- ACTIVE（站主最新指令）：後台「影片素材」只列出 Supabase 中真正可管理的自訂影片；不再把兩個程式內置的登入／開場備援影片顯示成不能刪除、不能真正管理的卡片。內置影片檔與首頁／登入的 runtime fallback 保留，不刪影音二進位、不改訪客播放契約。
- ACTIVE：站主後台與總覽統一使用「影片素材」名稱，不再混用「登入影片／開場影片」造成誤解；上傳、設為首頁精選、改名與刪除自訂影片的功能保留。
- ACTIVE：優惠碼面板預設只顯示目前可用項目；建立表單、進階自訂碼／備註、名額／期限調整、停用／過期／額滿舊紀錄與規則說明均按需展開。保留全部既有優惠碼資料、兌換紀錄、API、權限與 Stripe 隔離契約。
- SUPERSEDES：舊測試／文案要求把 `LOGIN_VISUAL_CATALOG` 內置項目混入站主管理清單的部分；不取代內置備援素材本身，也不改登入、付款、報告、Supabase schema 或 Storage。

## 2026-10-24｜站主可編輯客戶報告 × 修改紀錄與還原

- 站主指令：站主後台要能修改客戶報告，保留修改紀錄並可還原；原始版本永遠保留。
- 範圍：只改各章節的標題與文字（`mother_draft.reportSections`／`paid_report.reportSections`）；命盤 `engine_snapshot` 與排盤計算**不開放編輯**。
- 資料：新表 `report_section_edits`（版本 0＝首次修改前的原始快照；`edit`／`restore` 皆新增一版，從不刪除）。僅 service role 可讀寫，RLS 啟用並撤銷 anon/authenticated。
- Edge actions：`report.edit`／`report.history`／`report.restore`（密碼與 Face ID 登入皆可）。被編輯過的報告以 `mother_draft.ownerEdited` 標記，舊版引擎升級（`upgradeLegacyRecordOnce`）不得覆寫站主文字。
- 現況邊界：目前只有站主後台會從資料庫讀取已存章節；客戶端頁面尚未讀取，因此客戶不會直接看到修改。若要讓客戶看到，需另做交付（例如分享連結），不在本次範圍。
- 部署順序（不可顛倒）：① 套用 migration `20261024000000_report_section_edits.sql` → ② 部署 Edge Function `zhaowu-owner-data` → ③ 合併部署 Vercel。
- 測試：`scripts/owner-report-edits.test.mjs`。

## 2026-10-24｜《黃泉紀 · 左道旁門設定集》完整化 × 十二幅原創圖

- ACTIVE（站主最新指令）：沿用公開 `/mythic-atlas`，完整呈現《黃泉紀 · 左道旁門設定集》；包含三界與兩序、八大支系、三十五位人物、四條相連故事線、來源分層與十二圖錄。首頁入口同步改用正式名稱，並須在不展開四步導覽時直接可見；不另開重複路由。
- ACTIVE（原創視覺）：十二幅 9:16 本地 WebP 均為 STONE 原創重構；可取法李嵩《骷髏幻戲圖》、馬王堆 T 形帛畫、永樂宮《朝元圖》等十二種歷史圖像的構圖、題材與氣韻，但不得複製原畫、裁切第三方圖或移除他人水印。圖檔保留永久 `STONE` 署名，頁面逐幅顯示完整「STONE 原創」與取法說明。
- ACTIVE（來源界線）：古籍／宗教傳統、近現代二創線索、《黃泉紀》原創必須分層；宗教人物皆作尊重的文學演繹，不把原創陣營冒充教義，不製造古籍引文。手機 390px 為首要驗收面，十二圖必須全數可讀取，搜尋／陣營／來源篩選可操作。
- PROTECTED：不改命盤、報告、付款、登入、Supabase、影片資料或單一 Vercel Production；異聞錄既有 `CuratedVideoShelf placement="mythic"` 保留。

## 2026-10-23｜文明時間軸原創圖鑑入文章 × 第二步今日星象捷徑

- ACTIVE（站主最新指令）：將已生成的「2025–2030 文明時間軸交叉分析」真正 941×1672 PNG 原畫，納入既有 `/knowledge` 觀世錄 Articles；文章需繁中／簡中／英文，清楚分開干支與玄空的可核對規則、玄學流派象義及不可驗證的文明災變推論。
- ACTIVE（導覽）：首頁四步樹第二步「今日指引」內新增直接可見「今日星象」子項，一次連到既有 `/sky-events`；勿塞入深層子樹。首頁黃曆保留原有獨立功能，不搬動星象計算及資料來源。
- 原圖為 `public/articles/civilization-timeline-2025-2030-stone-original.png`，需保持 941×1672 原始比例、原件 SHA-256 `fe37936b94efcf936ce48fe3e62c770ec81976777bd3aa6bcb738173bcbbbf1a`；不能用 SVG／CSS 幾何卡片、暫時性分享網址或裁切圖代替。新增 `scripts/civilization-timeline.test.mjs` 作內容及資產驗證。
- 邊界：僅改文章名錄與導覽，保留舊文章／後台編輯覆蓋、三語、支付、登入、排盤、星象真實天文計算及單一 Vercel Production；合併前確認 asset、測試與 CI，正式站需另行驗收。

## 2026-10-22｜Meta 官方授權 × Facebook／Instagram 自動發佈

- ACTIVE：昭梧站主後台沿用既有 `/api/owner-session`，新增 Facebook Login 官方 OAuth；站主同意一次後，系統自動讀取其管理的 Facebook 粉絲專頁，以及每個粉絲專頁關聯的 Instagram 專業帳號。Facebook 粉絲專頁可自動發純文字或圖片，Instagram 依官方接口發公開圖片貼文；兩者皆可加入既有排程，不以 Metricool 付費方案為前提。
- ACTIVE：Facebook Page access token 以 AES-256-GCM 密文保存於 server-only `social_meta_accounts`；`public`、`anon`、`authenticated` 均無表權限。瀏覽器只取得粉絲專頁名稱、ID、Instagram 公開帳號資料與連接狀態，不取得令牌。
- ACTIVE：即時發布與每日排程共用同一批已勾選的 Meta 連接；排程仍由既有 Vercel Cron、`zhaowu-social-queue` 與一天一次防重複機制執行。不新增 Vercel Function、不新增付費 SaaS；Metricool 可保留作外部工具，但不再是昭梧發布必要依賴。
- COMPATIBLE：既有 Threads 多帳號 OAuth 與舊 Instagram／Threads 環境變數回退保留。小紅書與 X 仍為文案準備完成後手動確認；Facebook 自本條起不再歸類為手動平台。

## 2026-10-23｜第二波指令 10–14：manifest 三語 × /guide 收編 × 空模組閘門 × release.json 監控

- 站主指令：10 manifest 依語言輸出（zh-TW／zh-Hans／en）；11 /guide 二選一收編；12 atlas 空區塊「有內容或入口不存在」；13 release.json 每日監控；14 把「空狀態不得進對外導航」寫成 CI。
- 現行：三份靜態 manifest（同一 id／start_url／scope／icons，僅 lang／name／description 不同），`index.html` 啟動腳本與 `applyManifestLocale` 依顯示語言切換 `<link rel=manifest>`；`/guide/*` 在 vercel.json 307 導向 `/?guide=1`（首頁開啟導覽面板），不進 sitemap；`CuratedVideoShelf`／`AuspiciousGallerySection` 無可播放／可顯示內容時 `return null`；`/api/release-watch` 暫緩（Vercel Hobby 上限 12 個 Serverless Functions，加入第 13 個會使 production 部署 ERROR；待有不佔函式名額的做法再恢復，BACKLOG）；`scripts/empty-state-gate.mjs` 掛在 `prebuild`，`--diff` 為新增空狀態文案攔截（例外須附 `empty-state-ok: <理由>`）。
- 不動：八字核心、付款、auth、Supabase schema；不新增 runtime 依賴；A$0。
- 已知限制：已安裝 PWA 的 manifest 由瀏覽器自行重新評估；其他未知路徑仍為 SPA soft-404（BACKLOG）。
- 測試：`scripts/empty-state-gate.test.mjs`、`scripts/manifest-locale-guide.test.mjs`。

## 2026-10-21｜昭梧影片改為自主觀看 × 各頁分類展映（最新站主指令）

- ACTIVE：新訪客進入首頁直接看到宋式畫作與既有三語題跋，不再於首頁掛載強制 `IntroGate`。舊「首訪影片最多 60 秒／7 天內跳過」只保留為未被掛載的相容程式，不得再作為訪客入口義務；首頁也不再提供會啟用覆蓋層的「重播開場影片」按鈕。
- ACTIVE：保留既有 Supabase `gallery_assets` 與 Storage 影片二進位、啟用／停用、`is_primary` 與 `login-background` 內部標籤，不修改資料結構或刪除任何影音；舊後台「開場影片」更名為「影片素材」。入口按需折疊：首頁精選 2 部、文化知識庫 3 部、異聞錄 4 部、吉象圖鑑列出全部最多 30 部啟用影片；在用戶展開之後才讀取已啟用的公用影片目錄；影片點擊才播放、無自動播放。
- 相容與風險：MOV 可能不支援網頁直接播放，顯示原始影片開啟選項；資料讀取失敗不阻塞頁面。不把停用影片公開、不增加付費生成、Storage 寫入或新的 SaaS。僅沿用已存在的匿名公開讀取與 Storage URL。分類透過既有名稱／標籤，未辨識片段保留在吉象圖鑑完整展廊。
- SUPERSEDES：本文件既有 2026-10-15「開場完整播放」、2026-09-28「恢復首頁 IntroGate」，以及 2026-10-21 首頁題跋條目對 `IntroGate`「保留不變」的部分；原本人手上傳、後台權限和素材庫本身仍受保護。不可改動登入、會員、付款、命盤、報告、部署或主題輪換核心。

## 2026-10-21 節氣主題實體素材與安全輪替

- ACTIVE：站主明確要求把未上架的節氣圖資部署到既有後台。霜降既有原畫三張與八張分區裁切接入`solar-frost-descent`，新增獨立節氣區，不擴增精選主題卡牆。
- ACTIVE：`solar-auto`沿用既有站主cookie／同源發布，按已驗收素材的悉尼排程日期輪替；選其他主題即可回退。缺下一套時保留上一套。非24節氣／72候全量圖資已完成的聲明。
- SUPERSEDES：設計稿僅停留docs、不上傳binary／未接SKINS的阻塞；保留原排程、宋式框架、三語、手機可讀、手動回退要求。
- PROTECTED：不改排盤、曆法、認證、付款、Supabase schema／Storage。十二地支報告原圖保留，不為新任務重畫。

## 2026-10-21 畫作／圖表分類與文章視覺失真修復

- ACTIVE（站主最新明確指令）：昭梧文章「配圖／畫作」不得以大量文字框、數字卡、漸層山形的程式 SVG 冒充真實創作；只有明確要求資訊圖表時才用圖表。執行契約為 `AGENTS.md` 第 6 節新規、`docs/ZHAOWU-SONG-AESTHETIC-FRAMEWORK.md` 與 `docs/ARTWORK-ACCEPTANCE.md`。
- ROOT CAUSE（已核）：PR #820 將本應連結真正生成繪畫的四張文章插圖換成純程式 SVG（不是 CDN 壓縮、手機渲染或文章元件把畫作變成 SVG）。圖檔結構比對站主實拍吻合。原曾暫用既有 WebP 畫作；2026-10-21 最新指令改為四張新的原創宋式三界總覽／欲界／色界／無色界繪畫，在各自原文章位置替換。四張原創素材以原始 PNG 分段保存在 GitHub，`scripts/assemble-abhidhamma-art.mjs` 在 prebuild 自本地二進位片段重組，核對 SHA-256，產生 `public/articles/` 本地檔；無執行時第三方 CDN 依賴。保留三語原文，畫作均屬象徵表現而非教理精確分層圖。正式生效仍以 Production 實際驗收為準。
- ACTIVE：`scripts/article-artwork-acceptance.test.mjs` 驗證該篇文章繪畫引用均指向存在的本地影像二進位檔，不可用 code-only SVG 或外部臨時 URL 冒充；`prebuild` 在編譯前執行。這是防止相同文件失誤的機械檢查；藝術品質仍需實際看圖，不可憑測試就報高品質完成。
- BOUNDARY：不改文章系統、會員權限、付款、報告、Supabase Schema／Storage 或全站主題。不重寫原有真正適用於圖表/互動的 SVG，不新增付費生成服務／外部 runtime 依賴。

## 2026-10-21 首頁題跋與頁尾「為何做昭梧」

- ACTIVE：站主要求以最輕方式在首頁表達初心。`PaintedHome`（Song gallery 排版）在畫作與兩顆入口按鈕之間新增單行靜態三語題跋；首頁頁尾（僅首頁）新增原地展開的「為何做昭梧」`<details>`。文案只沿用站內既有宣言與已成立的產品事實：排盤與快速讀免費免登入、報告加密保存在本機瀏覽器、完整報告單次付費不自動續費、不作醫療診斷。
- DECIDED NOT TO DO：開場影片不放首屏；首屏不加第二行字（與現有標題／命 · 勢 · 選層級重疊，按鈕已承擔行動引導，且「便見分晓」過度承諾）；不做背景「呼吸」縮放動畫——Aesthetic Framework 規定動效以透明度與輕微位移為限，且現行首頁畫作是版面內框圖而非全頁背景，縮放會溢出圓角裁切。
- PROTECTED／UNCHANGED：Hero 標題與皮膚機制、`命 · 勢 · 選`、IntroGate、命盤／付款／登入／Supabase、頁尾的法律／站主入口／會員入口契約。
- 驗證：`scripts/home-origin-note.test.mjs`；Chromium 實測三語 × 390／320／1280 寬無橫向溢出、無 JS 錯誤。基線（main）已紅且與本項無關：`brand-system-r97`、`guest-first-access`（記為 BACKLOG，不在本 PR 處理）。

## 2026-10-19 固定多幣別報告定價

- ACTIVE：快速讀維持免費。七政四餘／西洋占星／印度占星／一掌經／生命靈數單項固定為 US$9.90／A$14.90／¥68；八字與紫微深度單項固定為 US$16.90／A$24.90／¥108；六系統合集（不含八字）固定為 US$26.90／A$39.90／¥168。
- ACTIVE：Stripe Payment Links 保留原網址，Price 以手動 `currency_options` 寫死 USD／AUD／CNY；Checkout 依所在地顯示已配置貨幣，不用即時匯率。網站只以瀏覽器地區／時區在 AUD、CNY、USD 三者間顯示對應固定價；無法判斷時回退 USD。
- ACTIVE：Webhook 只接受已知 Live Payment Link 與該幣別的精確固定金額，並把實際 `amount_total`／`currency` 寫入既有 server-only entitlement；舊 USD 金額與舊連結僅保留歷史訂單及已開啟 Checkout 的恢復相容。
- SUPERSEDES：2026-10-16「八字／紫微單項 US$19.99」及「六系統合集 US$19.99」的公開售價；不改既有購買授權、優惠碼、報告內容、命理計算或會員資料。
- PROTECTED：不得先改 Live Payment Links 再部署資料庫約束與 Webhook，避免付款成功但無法解鎖；履約仍只由 Stripe Webhook 驗證，不以成功頁或瀏覽器狀態授權。

## 2026-10-17 自訂正式域名與大陸同源代理

- ACTIVE：站主已購買並指定 `https://zhao-wu.com/` 為唯一 canonical 正式網址；此域名與 `www.zhao-wu.com` 已在既有 Vercel Production project `stone-zhaowu-official` 驗證。`www` 與舊 `stone-zhaowu-official.vercel.app` 均以 308 保留路徑與查詢參數轉向主域名，不另建主機。
- ACTIVE：`src/lib/supabase-config.ts` 將 `zhao-wu.com` 納入 `/sb/*` 同源 Supabase 代理白名單；既有代理 rewrites 不變，讓正式新域名沿用大陸訪客端登入／讀取路徑。
- ACTIVE：`index.html` 的 canonical、Open Graph、Twitter 與 JSON-LD，`robots.txt`、`sitemap.xml`、`llms.txt` 和 SEO 測試均使用新 canonical。
- PROTECTED：保留 `.vercel.app` 入口、Vercel 單一 Production、既有付款／命盤／登入邏輯及 Supabase 設定；不假設自訂域名能保證所有大陸網路可達。
- SUPERSEDES：下方 2026-10-16「正式域名更正」條目的未購買自訂域名與 `.vercel.app` canonical 狀態。

## 2026-10-17 文章管理：站主編輯與下架

- ACTIVE：`/account?view=articles` 提供站主 cookie 驗證的文章清單、繁中／簡中／英文標題／摘要／正文編輯、下架、還原及恢復原文；公開 `/knowledge` 與首頁讀取 `article_editor_overrides`，保留原文編譯資產與插圖／互動元件。一般訪客不得寫入，只有 `/api/owner-data` 同源 cookie bridge 能呼叫獨立的 `zhaowu-owner-articles` Edge Function 寫入。新增資料表 RLS 僅允許匿名讀，沒有匿名寫入政策。
- ACTIVE：按站主要求，過時的中國大陸可訪問性診斷《昭梧網站在中國大陸的訪問診斷》從編譯文章名錄與靜態 HTML 完全移除，三語界面都不可再列出；其他文章與知識教學維持。
- 不新增 Vercel serverless function，不另建 Production。編輯會立即影響公開內容；若公開 Supabase 查詢失敗，文章區暫停顯示以免下架稿件重新曝光，支付與排盤互不受影響。

# 昭梧｜Instruction Registry

## 2026-10-17 黃曆仙佛聖誕名錄啟用與擴充

- ACTIVE：每日黃曆的「今日聖日」已由 `src/lib/almanac/sacred-days.ts` 計算並送入 `AlmanacInkBoard`；現在另可展開佛、道、儒、民間信仰四類完整已收錄名錄，直接按農曆或公曆日期查閱。今日資料與全表共用同一份列，三語可讀。
- ACTIVE：補入有公開來源的道教及地方民間紀日，並保留儒家孔子、朱熹紀日與既有佛教紀日；地方/宗派變體標示來源，不宣稱所有神佛聖誕都只有一個通用日期。來源與閏月／大小月政策見 `docs/sacred-day-source-policy.md`。
- SUPERSEDED：本檔下方 2026-10-03 對舊 PR #584「神佛聖日資料列為 BACKLOG，需新指令」的部分；該舊分支仍不合併，其黃曆首頁與靈籤畫面仍不移植。站主已於本次明確指定四類名單並要求接入現有三段式黃曆。
- PROTECTED：不改節氣、農曆換算、命盤、登入、付款或其他三段式內容。

## 2026-10-17 站主後台優惠碼管理（取代「後台管理介面列為 BACKLOG」）

- ACTIVE：站主後台新增「優惠碼」分頁，可建立（單一系統／全系統套組、名額、有效天數、備註、自訂或自動產生 `ZW-XXXX-XXXX` 碼）、列表、停用／啟用、名額 +1、延長 30 天。動作 `promo.list`／`promo.create`／`promo.update`／`promo.setActive` 經既有 `/api/owner-data`（站主 cookie＋同源）轉送到獨立 Edge Function `zhaowu-owner-promo`。
- ACTIVE：因 Vercel Hobby 已達 12 個 serverless function 上限，不新增 `api/*.js`，也不改動 836 行的 `zhaowu-owner-data`；`api/owner-data.js` 只新增 `ownerUpstreamFunction(action)` 路由。
- PROTECTED：只能新增與修改 `promo_codes`；不提供刪除、不寫 `redeemed_count`、不碰 `promo_redemptions` 與客人兌換路徑 `promo-code`。名額不得低於已兌換數。兌換仍不記金額、與 Stripe 完全分離。
- 驗證：`scripts/owner-promo-admin.test.mjs`（8 項）、tsc、build；Edge Function 部署後以真實呼叫驗證見 PR 說明。

## 2026-10-16 正式域名更正（SUPERSEDED 2026-10-17）

- HISTORICAL：當時尚未購買或授權自訂網域，因此 canonical 為 `https://stone-zhaowu-official.vercel.app/`；此狀態已由 2026-10-17 站主購買並指定 `zhao-wu.com` 的明確指示取代。
- SUPERSEDED：任何舊 Cloudflare／DNS／自訂網域設定指示均非當前執行規則。


## 2026-10-17 西方占星十章客戶報告模板 V2.0（承接 PR #772）

- ACTIVE：`docs/ASTROLOGY-REPORT-PROTOCOL-v2.md` 為本次十章報告正式規格；`src/lib/astrology/report-protocol.ts` 為純函式章節摘要與 AI Prompt Builder，不在瀏覽器自動呼叫計費模型。
- 十章依序：總覽、自我、事業財富、關係、家庭、身心照顧、精神課題、未來 12–18 個月行運、特殊配置、綜合建議。輸出先結論、明示證據、利弊、行動；可調語氣、語系、目標字數與章節順序。
- 限制：只接 Tropical 與已有 Placidus／Whole Sign；Sidereal ayanamsa、Alcabitius、北交點、福點、Chiron、完整行運與跨系統自動資料抓取尚未驗證；缺資料一律不判，不准由 LLM 虛構。Whole Sign 下 MC 不必在第十宮。
- 付費全文繼續由原有 `ReportAccessGate` 驗證；不得因裝置本地資料、匯入 JSON 或前端旗標繞過付款。尚未接通正式 AI provider，不得宣稱有 3000–5000 字 AI 自動文稿。
- 不使用命理推斷醫學診斷、疾病部位、一定婚嫁或災難；八字、紫微、印度占星僅具獨立計算證據且客人勾選時才作獨立旁證。
- 新模板不改其他五個專項、八字主判、Stripe/Supabase/Owner 行為，不自動觸發額外 Vercel 部署。

## 2026-10-17 西洋占星十大行星深度旁證（承接 PR #772）

- ACTIVE：現有 `/astrology` 保留七曜古典視角與既有 `ReportAccessGate`，額外增加獨立的現代十行星（太陽至冥王星）熱帶黃經、主要相位、全十二宮落星分布與 A/B/C 宮位主題，免費統計與付費人生方向分層。
- 計算來源使用現有本站自家託管 `/vendor/astronomy-engine-2.1.19.browser.min.js`，不用未核准的 Swiss Ephemeris 專業授權，也不建立新付費 SaaS／第二部署。七曜舊源與現代十星源分開標示；不得假裝兩者已完成精度同源化。
- A＝1/8/9/12、B＝2/6/10、C＝3/4/5/7/11。每組同時列原始顆數與每宮密度；兩套排名不一致、交界不穩或資料不足時不強定人生主軸。這是占星文化象意而非八字十神換算，更不得用數量決定人格、富貴或健康。
- 已知時間但未核對出生證明的分鐘最高只標 `medium`；出生證明分鐘已確認且 ±2 分鐘落宮穩定才允許 `high`；未知時間或 Placidus 不成立時落宮／宮位主題降為 `low`，不得自動改宮制隱瞞。
- 排盤資料的本地 IndexedDB、JSON 匯入匯出僅為西占副本；不額外寫站主 Supabase、不修改共享出生資料、會員或付款授權。付費解鎖維持既有 server-side entitlement 驗證，不採裝置旗標繞過付款。
- 印度占星是獨立 D1/D60 旁證入口，不因宮位意義相似就判定互證成功；原有 `/indian-astrology` 的分鐘校驗與 D60 算法不變。
- VERIFIED（2026-10-17，合併前）：`tsc --noEmit`、`npm run build`、`western-house-depth`／`western-report-protocol` 共 11 項測試通過；Chromium 320px 實測 /astrology：訪客只見免費十星區（10/10 星位、10/10 落宮）且無付費章節，站主 session 才見十章，第 8 章（未來 12–18 個月）明確標示未判，無 console 錯誤、無橫向捲動。iPhone Safari(WebKit) 未跑。




## 2026-10-15 中國大陸可讀取／可登入：同網域 Supabase 代理與自家託管天文腳本

- ACTIVE：訪客端（登入、`rest/v1` 讀取、`functions/v1`、公開媒體 URL）在正式主域名 `zhao-wu.com` 與相容入口 `stone-zhaowu-official.vercel.app` 一律經本站同網域 `/sb/*`；`vercel.json` 以四條白名單 rewrite 轉到 Supabase（`/sb/auth/v1`、`/sb/rest/v1`、`/sb/functions/v1`、`/sb/storage/v1/object/public`）。`src/lib/supabase-config.ts` 匯出 `SUPABASE_URL`（瀏覽器在上述生產網域時為 `<origin>/sb`，本機開發與測試維持直連）與 `SUPABASE_DIRECT_URL`（永遠直連）。
- ACTIVE：站主背景音樂與五音贈曲播放改由同網域 `/api/owner-music?track=<id>` 代理串流並設定邊緣快取（`s-maxage=604800`），訪客端不再直連大陸不可達的 `cdn.jsdelivr.net` 或 `raw.githubusercontent.com`；失敗時自動回退至本站靜態 `/audio/zhaowu-background.mp3`。
- ACTIVE：站主上傳／刪除（`storage/v1/object/<bucket>`）、TUS 續傳簽名端點與 OAuth `authorize` 導向仍用 `SUPABASE_DIRECT_URL`，不經代理（大檔不佔用 Vercel 轉送，OAuth 提供商本就無法在大陸使用）。
- ACTIVE：`astronomy-engine@2.1.19` 由 jsDelivr 改為自家 `/vendor/astronomy-engine-2.1.19.browser.min.js`（同一版本，不變更演算公式）；`/vendor/*` 以 immutable 快取。
- SUPERSEDED：D60 元件從 `cdn.jsdelivr.net` 載入天文腳本的做法（`scripts/d60-reliability-gate.test.mjs` 契約同步更新），以及 `/api/owner-music` 把訪客音訊重導向至 `cdn.jsdelivr.net` 的做法。
- 不改：登入邏輯、Supabase 資料／Schema／RLS、付款、命理計算、報告內容、SPA fallback rewrite。
- COST（AGENTS §F）：消耗 Vercel Fast Data Transfer（公開媒體與音訊加 `s-maxage` 邊緣快取以減量）；無新增付費服務；Supabase 或 Vercel 不可用時行為與先前相同（請求失敗或回退本地靜態資源）；回滾＝還原本提交，無資料遷移。
- OPERATIONAL（非程式）：`*.vercel.app` 共享網域在中國大陸部分電信商會有 DNS 污染／SNI 阻斷；程式端已確保單一網域可達即可完成全站載入、排盤、讀取、登入與聽音樂，但若大陸直連 `*.vercel.app` 入口本身被牆，仍需綁定一個已指向 Vercel（或經 Cloudflare 指向 Vercel）的自訂網域。
- ACTIVE（2026-10-17）：站主後台音訊／影片轉檔的 ffmpeg 核心（`@ffmpeg/core@0.12.10`，釘版 devDependency）於建置時由 `vite.config.ts` 外掛複製到 `dist/vendor/ffmpeg-core/`，載入端先走同源、失敗才退回 jsDelivr；同源回傳若為 HTML 或非 WebAssembly 位元組一律拒收。31 MB 的 wasm 不進 repo，只進每次 production 產物。
- BACKLOG（P2）：`@ffmpeg/ffmpeg` 封裝與 worker 仍由 esm.sh 載入（僅站主使用），尚未自架。

## 2026-10-15 開場影片完整播放・英文預設語言・首頁頁尾・優惠碼 supersession（PR #746 + 後續）

- ACTIVE：首頁 `IntroGate` 開場影片一分鐘以內一律完整播放：`INTRO_GATE_MAX_PLAY_S = 60`、`INTRO_GATE_HARD_EXIT_MS = 62000`；後台上傳壓縮上限 `LOGIN_VIDEO_MAX_SECONDS = 60`，輸出最寬 1920px、30fps、crf 22。訪客仍可隨時跳過。
- SUPERSEDED：2026-09-30「開場影片最長 15 秒」以及 r197 條目中「登入動畫最長 15 秒」的秒數部分；其餘（MP4／WebM、7 日內不重播、內建 r148 退回）不變。
- ACTIVE：全站預設語言為 English；只有瀏覽器語言為中文時才預設中文（zh-CN／zh-SG／Hans → 简体，其他 zh → 繁體）。訪客已明確選過的語言永遠優先。僅用瀏覽器語言判斷，不接付費 geo-IP 服務。
- SUPERSEDED：`i18n.ts`／`display-language.ts` 原本一律預設 `zh-Hant` 的行為。
- ACTIVE：首頁的「最新更新」連結與站主「後台管理」捷徑位於頁尾（`[data-footer-status-strip]`），不在頂部 header；非首頁的狀態列不變；站主工作區仍不顯示任何公開狀態列。
- ACTIVE：換頁使用單一 CSS 淡入（`.zhaowu-route-fade`，260ms，遵守 `prefers-reduced-motion`）；不得引入動畫套件或第二套過場系統。
- ACTIVE：付費區提供收合式「有優惠碼？」輸入。兌換只經 `promo-code` Edge Function 與 `promo_codes`／`promo_redemptions`（RLS、僅 service role），與 `report_purchase_entitlements`／Stripe 完全分離，不記任何金額。同一瀏覽器重輸已兌換的碼為冪等解鎖、不扣名額。
- OPERATIONAL：建立優惠碼目前以 SQL 新增 `public.promo_codes` 列（`code`、`product_id` system／bundle、`system_id` 可空＝全系統、`max_redemptions`、`expires_at`）；後台管理介面已於 2026-10-17 啟用（見下方最新條目），SQL 方式僅作備援。
- 不改：Stripe Payment Links、webhook、entitlement、命理計算、報告內容、Owner 登入。

## 2026-10-13 站主參考圖重排首頁與主題預覽

- ACTIVE：以本次八張參考圖的構圖與版面為視覺依據；首頁按錦鯉四格、龍蓮卷軸、日夜龍吟、漫畫預覽四種構圖排版。主視覺、卡片插畫、標題與操作分層，真實文字／按鈕不得改成整張截圖熱區。
- SUPERSEDED（首頁範圍）：所有主題只換背景並共用同一張置中生辰表單的呈現；首頁低圓角／禁膠囊限制在本次參考圖已有膠囊的位置不再適用。填資料由首頁 CTA 進入原有 #birth-form，原有表單／命書／提問流程保留。
- ACTIVE：後台顯示各主題真正渲染的首頁截圖，可點擊放大；不得以畫作縮圖或虛構報告色卡宣稱實際頁面。截圖為本版中文首頁；內容與語言切換仍以真實頁面為準。
- PROTECTED：不更動主題全站同步設定、登入權限、付款、排盤、解讀、客人資料。報告插畫紙面仍使用現有答案／理由／風險／下一步資料，不填入參考圖的示範預測或捏造選項。
- EVIDENCE：首頁構圖重做與整站逐像素還原為不同驗收層級；開場影片本批未修改。不得把生成插畫或測試通過說成八張參考圖全部一致。

## 2026-10-13 全主題驗收與新增主題防回退

- ACTIVE：本次逐款主題驗收在隔離測試執行器使用真正頁面、中英文 390px 與桌面；主題資料及權限回應只在測試攔截，禁止為驗收切換正式站全域皮膚或讀寫客人資料。
- ACTIVE：主題檢查從完整 SKINS 清單動態取樣；新增第 19 款及以後也必須有完整名稱／本地圖像／明暗模式／CSS 色票／可讀對比，不得用固定數量或格式正則漏過。每次正常 build 先執行輕量 test:themes，不合格即停止。
- ACTIVE：SKINS 與 server 全站發佈白名單必須完全一致；新主題不得只出現在後台而無法同步訪客。驗收會比較全部 id，未知 id 仍拒絕；不放寬伺服器的登入／同源／發佈權限。
- ACTIVE：暖紙報告封面在所有主題固定使用深色文字與相同 WebKit 填色；報告段落導覽共用書頁底色，禁止深色主題淺灰底配淡字，實際展開報告後核對兩個文字通道。
- ACTIVE：僅主題相關 PR 觸發 Theme acceptance，核對貼片底色、陰影、焦點、44px 操作、橫向溢出、免費／解鎖展示與頁面錯誤，保存短期截圖；涉及新皮膚或主題樣式的 PR 必須查看本次結果再合併。
- ACTIVE：實測修正首頁登入 40px／舊淺色底、#birth-form 主按鈕固定深綠膠囊／陰影及重播 36px；全部主操作綁定主題色並維持 44px。量測等待有限動畫結束，避免把過渡瞬間誤作最終樣式；保留訪客動效。
- COMPATIBLE：舊訪客隱私測試允許唯一公開 GET view=site-skin；管理讀取和所有 POST 仍受原有阻擋檢查，權限實作不變。
- PROTECTED：舊 Production Smoke、Engine、iPhone Safari、全站 Visual Regression 維持手動，並未恢復為一般發布門檻；不建立預覽部署、不更動主題共享機制、權限、價格、排盤或主站架構。
- EVIDENCE：自動檢查與畫面目測必須分開記錄；尚未實際渲染者不能宣稱逐款視覺通過，新增主題亦不得承諾所有未來頁面永遠 100% 無缺陷。

## 2026-10-13 主題下的標題與按鈕融合

- ACTIVE：18 款主題的區塊與操作沿用同一主題紙色／墨色／強調色；內層標題、三步與返回／修改按鈕不再貼固定米白面板，改為透明底、細線及清楚的選中／焦點狀態。
- ACTIVE：主要閱讀面保持不透明；生辰／命書內層取消重複框、陰影、描邊與裝飾。主操作使用主題內的可讀實色，淺色鯉魚沿用原有較深按鈕色；每款背景與字體保留。
- SUPERSEDED：同一命書內每層重複主題卡框、厚重陰影／發光、玻璃模糊及固定深綠／米白操作貼片的展示方式。
- PROTECTED：只改 CSS，不更動全站主題共享設定、站主選擇、價格、付費邊界、排盤、解讀、路由或資料。色卡顏料、黃曆文化色序、報告封面與圖像不隨一般控制文字重染。

## 2026-10-12 多 Threads 帳號官方授權與零月費發布

- ACTIVE：站主社群後台改用 Threads 官方 OAuth，可逐一連接多個 Threads 帳號，發布時可勾選單一或多個帳號；不再以 Metricool 付費品牌數作為多帳號發布前提。
- ACTIVE：Threads 使用者令牌只以 AES-256-GCM 密文保存於 server-only Supabase 表；`public`、`anon`、`authenticated` 均無表權限，瀏覽器與 API 狀態只取得帳號公開資料。
- ACTIVE：沿用現有 `/api/owner-session` 與 `zhaowu-owner-data`，不新增 Vercel Function、不新增付費 SaaS、不影響網站、排盤、報告、付款或未配置 Meta 時的正常營運。
- COMPATIBLE：既有 Instagram／Threads 環境變數發布保留作相容回退；OAuth 多帳號存在時，Threads 發布按站主勾選的帳號執行。

## 2026-10-13 免費內容收斂與提問相關性

- ACTIVE：八字首頁免費只保留基本排盤、兩段命書試讀與簡短提問摘要；完整命書、額外解讀、詳細時運、判斷依據與連續追問須經既有 server-verified system／owner access 才顯示。站主免費規則保持，不改價格、Stripe、webhook 或歷史購買授權。
- SUPERSEDED：八字首頁未付費即可展開 UnifiedBirthReport、更多命盤解讀、連續追問與額外三段摘要的展示路徑。quick 權限在其他專項的既有契約不因本項被刪改。
- ACTIVE：食物／口味偏好回答不得以流年、月份、工作比較或五行診斷代替；文化象徵、實際偏好與飲食評估須區分。缺乏相关依據的問題先說明所缺資訊，不補造無關時運答案。
- ACTIVE：路由錯誤提供三語重載／首頁／我的報告恢復入口，不刪本機生辰、報告或付款識別；本項是 fail-open，不宣稱已定位站主截圖錯誤的根因。

## 2026-10-13 全站簡化引導流程

- ACTIVE：公開主流程為「填資料 → 看命書 → 問問題」；只保留一套可切換步驟。填資料時不顯示空命書或提問區；保存後先看兩段免費概要，其餘文字按需展開，提問為選填。
- ACTIVE：補充資料、校時細節、進階內容預設收起；出生日期／時間／城市與既有性別排運選項、未知時辰限制及所有資料值保持原契約。前端分步不重新定義排盤／解讀或付款。
- ACTIVE：天干地支圖可在看命書時直接展開；提問結果先看答案，追問框緊隨其後，命盤圖改為一層展開。獨立完整報告保留簡明導讀，已有答案的結果頁不重複導讀。
- ACTIVE：常駐首頁／建立命書／我的報告；「怎麼用」開啟既有導覽，列出三步與建立／重看兩個主操作。今日／測驗／文章及其他命盤／文化工具收於「更多功能」，不刪除原路由或客戶紀錄。後台不顯示無可用導覽的按鈕。
- SUPERSEDED：首頁重複三步文字、表單與命書同時鋪開、公開頁第二套「其他命盤」目錄，以及追問框置於整份結果尾部的展示行為。只有展示部分改變，主題／圖片、權限、計算、價格、後端及單一正式站政策保持。

## 2026-10-13 命象位置改用既有天干地支圖

- ACTIVE：報告「日主／月令／日柱納音／出生時辰」下方的命象改用已接入的十天干人物圖與十二地支景色圖；日主按 chart.dayMaster 精確對應，地支按實際有效四柱去重，最多四款。
- SUPERSEDED：此位置原先按喜用／題目從公共圖庫選取畫作、以生成圖 URL 覆蓋或提供製作命象按鈕的行為。圖庫與既有生成 API 保留供獨立功能相容使用，不再決定此位置圖片。
- COMPATIBLE：保留文字四柱資料、三語、同一天干舊母圖備援與地支圖片失敗文字回退。完整命書獨立閱讀仍展示天干地支；結果頁已有此展示時，不在命書圖解重複。僅調整展示，不改排盤、解讀、付款、登入或資料。

## 2026-10-16 八字／紫微單盤價格更新 supersession

- ACTIVE：八字完整命書與紫微斗數單盤完整深讀的一次性價格由 USD 9.90 調整為 **USD 19.99**（站主 2026-10-16 指示）；不自動續費。
- ACTIVE：七政、西占、印度古法、一掌經／前世今生、生命靈數單盤維持 USD 9.90；六盤套裝維持 USD 19.99（不含八字）；免費快速讀不變。
- ACTIVE：八字與紫微單盤使用 2026-10-16 新 live Payment Links；舊 USD 9.90 連結只在 webhook 保留，供已開啟或已完成的舊付款回訪，不再作銷售入口。
- ACTIVE：`report_purchase_entitlements` 的 `system` 金額白名單新增 1999；授權仍須通過已登記 live Payment Link、精確 USD 金額、合法 access key 與 live event 驗證。
- SUPERSEDED：2026-10-13 區段中「單一系統一律 USD 9.90」與「八字 USD 9.90」僅對八字與紫微失效，其餘付款安全規則繼續有效。

## 2026-10-13 Stripe 價格更新 supersession

- ACTIVE：快速讀維持免費迎新內容，不再出售；單一系統完整深讀統一為一次性 **USD 9.90**，六個專項系統完整套裝為一次性 **USD 19.99**，均不自動續費。
- ACTIVE：八字完整命書是獨立單盤購買，價格同為 USD 9.90；六盤套裝不包含八字。
- ACTIVE：公開頁只使用 2026-10-13 新 Payment Links；webhook 同時保留舊連結／舊金額驗證，只為已開啟或已完成的舊付款回訪，不再作新銷售入口。
- ACTIVE：`report_purchase_entitlements` 金額白名單同時接受舊價與新價；授權仍必須通過已登記 live Payment Link、精確 USD 金額、合法 access key 與 live event 的 server-side 驗證。
- SUPERSEDED：本文件所有「USD 1.99／4.99／9.99 價格不變」及同義舊敘述；其付款安全、一次性收費、server-side entitlement 與六盤不含八字等非價格規則繼續有效。

## 2026-10-12 每日穿衣色卡重設（站主畫面回饋）

- ACTIVE：首頁「每日穿衣｜五行色彩」個人版不得只列低對比色名；每一個主色、今日天時色與少量使用色都必須有名稱相符、肉眼可辨的實體色卡。
- ACTIVE：色卡維持宋式暖紙、礦物低飽和、細線與低圓角，不做高飽和電商色票、玻璃卡牆或大膠囊；首飾／材質另以文字材質籤呈現，不冒充顏色。
- PROTECTED：只調整既有結果的視覺映射與排版，不改八字排盤、喜用／泄耗取值、每日干支、報告資料、權限或付款。
- RELEASE：站主於 2026-10-12 已明確指示發佈；本批合併唯一 `main` 並觸發一次 `stone-zhaowu-official` 正式部署，不建立 Vercel Preview。

## 2026-10-11 品牌水印（站主指令）

- ACTIVE：站主後台發布的圖片一律在發布動作時燒入「昭梧 ZHAOWU」水印並加上 `wm-baked` 標籤（`src/lib/brand-watermark.ts`，接在 `uploadGalleryAsset` 與 `uploadBackground`）；影片、舊素材與非燒入素材以顯示層疊加（`src/brand-watermark.css`，class `zhaowu-wm`／`zhaowu-wm-on`），不改動已存放的原檔；報告頁加極淡平鋪水印。已燒入的素材不得再疊加顯示層水印，避免雙重。
- SUPERSEDES（僅此部分）：`AGENTS.md` §6「no invented or unwanted logos, marks or decorative overlays」中針對品牌水印的禁止；其餘禁止（任意新增 Logo、遮擋文字／按鈕的裝飾）仍有效。
- BOUNDARY：網頁無法阻止系統截圖，水印是追溯與威懾，不是防截圖。影片不燒入（手機端 ffmpeg.wasm 不穩定且耗時），僅顯示層疊加。舊素材批次重製需備份與 service key，未執行。

## 2026-10-10 站主免費閱讀與報告入口

- ACTIVE：站主由同源 HttpOnly cookie 經伺服器確認後，可免費閱讀本人與所有人的已保存完整報告。不得以 localStorage、URL、前端自填 role 授權。訪客的付款權限維持既有伺服器核驗。
- ACTIVE：常駐入口為首頁／開始排盤／我的報告；站主另見所有人報告。生成後先讀答案，出生資料收合並可重新展開。
- ACTIVE：新的提問結果保存在本機「我的報告」；站主登入時生成／重新開啟的本機提問結果，透過既有 owner bridge 保存至 report_requests。雲端列表分頁讀取所有已上傳的客戶紀錄，不限最近 50 筆。
- BOUNDARY：2026-10-10 查核 report_requests 為 0 筆。從未上傳、只存在其他訪客裝置的舊結果無法由站主後台還原；本次不改為自動收集其他訪客裝置資料。舊測驗保存規則不變。
- COMPATIBLE：保留客戶資料隔離、既有付款／排盤引擎、單一 Production 與 A$0 新增基礎設施成本。

## 2026-10-09 全站宋式視覺分批統一

- ACTIVE：`docs/ZHAOWU-SONG-AESTHETIC-FRAMEWORK.md` 是全站視覺最高優先準則；既有功能可保留其專用資訊結構，但不得另起玻璃擬態、巨大膠囊、深色卡牆或高圓角 App 風格。
- ACTIVE：全站視覺改造採「一次盤點、持續接續、分批落地」；固定路由清單、批次順序、重疊 PR 與每批驗證證據寫入 `docs/ZHAOWU-SONG-VISUAL-ROLL-OUT.md`，後續不得無故重做全站盤點。
- ACTIVE：每批先改最小共用視覺面，再檢查實際畫面與手機可讀性；保留單一宋式礦物山水背景、暖紙閱讀面、墨色正文、松綠層級、局部礦物色與克制金／朱砂。
- PROTECTED：不藉視覺統一改動命理計算、報告內容、登入／權限、付款、Supabase、資料、路由或多語邏輯。
- RELEASE：原本的禁止部署限制已被站主 2026-10-12「去執行發佈」取代；本批可合併唯一 `main` 並觸發一次正式部署，仍禁止分支 Preview 與第二正式站。

## 2026-10-07 複雜／長尾問題推理層 supersession

- ACTIVE：複雜問題不得只靠「把原答案寫順」處理。先建立 question graph，識別人物／關係、主問題、次問題、題域、比較／條件／情境／時間要求、第三方邊界與高風險邊界，再從 CURRENT deterministic runtime 的既有結果組合答案。
- ACTIVE：新增 `src/lib/qa/complex-question-ontology.ts`、`src/lib/report/complex-reasoning.ts` 與 `docs/COMPLEX-QUESTION-REASONING.md`。人物關係目錄覆蓋本人、伴侶／前任、父母子女手足、朋友室友鄰居、老闆主管同事下屬、客戶／合夥人／投資人、老師／醫生／律師、房東租客、公司團隊、公眾人物、寵物、未出生孩子、亡者與未知第三方等 40+ 類。
- ACTIVE：問題領域必須能處理自我／天賦／工作／學業／創業／商業／財務／債務／感情婚姻／家庭六親／人際合作／衝突／法律／健康／生育／孩子／房產／搬遷／移民／旅行／時間／A-B／排名／情境／風險／談判／回溯驗證／前世與象徵層等；新句式用分類組合處理，不要求先寫過一模一樣的問句。
- ACTIVE：複雜題第一屏先使用 deterministic complex composer；它只重組 Decision Report、題域 reading、timing、risks 與現實邊界，不重新排盤、不新增命理 truth。provider 不可用時，這層仍然生效。
- OPTIONAL / DISABLED CURRENTLY：`answer-reasoner` 是可選的 fact-ID 受控 AI 綜合層；只有輸入 facts 可作證據，每個實質結論必須引用存在的 fact ID；不得輸出 chain-of-thought、不得替第三方讀心、不得把醫療／法律／投資／死亡等高風險問題寫成保證。
- PROVIDER STATUS：2026-10-07 實測現有 OpenAI provider credential 對舊 `answer-writer` 與新 `answer-reasoner` 均回 HTTP 401，因此兩個 `site_settings` AI 開關暫時設為 disabled。不得把「Edge Function ACTIVE」冒充「AI provider 正常工作」。
- RE-ENABLE GATE：只有安全更新 provider secret，且真實 invocation 回傳有效、可核對 fact IDs 的答案後，才可重新開啟 AI writer/reasoner。不得把 API key 寫進 GitHub、前端 bundle、文件或聊天紀錄。
- PRIORITY：complex deterministic synthesis → optional bounded reasoner → simple wording writer；任何 AI/provider 失敗一律回 deterministic answer，不白屏、不阻塞排盤／報告／付款／Launch。


## 2026-10-07 首頁 Hero／背景視覺吸收與防回退

- ACTIVE：2026-10-07 外部視覺審閱只吸收適合昭梧的原理，完整規則已寫入 `docs/ZHAOWU-SONG-AESTHETIC-FRAMEWORK.md`「首頁 Hero／背景落地補充」。不得照抄第三方 CSS、另起一套配色或新增第二套首頁視覺系統。
- CONFIRMED CURRENT MAIN：PR #631 已完成首頁畫作自動輪播、定位沿用與首頁背景專區；PR #636 已完成單張背景上傳即套用、站主選定 wallpaper 真正顯示、Hero 不再遮住 SiteShell 背景，以及白色輪播 rail 的移除。這些已存在的功能不得因後續 agent 誤讀舊指令而重做或回退。
- ACTIVE：首頁 wallpaper 必須由站主後台目前選定的 `background_assets.theme = wallpaper` 驅動；禁止把某張站主圖片重新硬編碼進 CSS／route。只保留一層主背景，採 `cover`／`no-repeat` 與淡暖紙遮罩；禁止黑色壓暗、重 vignette、整圖 blur。
- ACTIVE：Hero 前景畫作與全頁 wallpaper 分工保持；現有本地畫作自動輪播、reduced-motion 與手動選圖語義保持。沒有新的站主明確指令前，不接入 runtime AI 自動生成或外部圖片服務。
- ACTIVE：首頁圖片區禁止白條、空白 rail、重複 dots 或因圖片尺寸不同造成的縫隙；容器與圖片尺寸由現有 Hero CSS 統一控制，圖片失敗時回退為暖紙，不得破壞頁面閱讀。
- WORKFLOW：本項屬視覺防回退與治理吸收；若 `main` 已符合規則，預設只更新文件，不為相同 P2 建議觸發新的產品部署。

## 2026-10-07 Payment Links 正式收費路徑 supersession

- ACTIVE：公開付費改用 Stripe 官方 Payment Links，不再由瀏覽器 POST 到 Supabase 建立 Checkout Session，因此網站 runtime 不需要保存 Stripe server API key。
- ACTIVE：快速讀 USD 1.99、單盤完整讀 USD 4.99、六盤全讀 USD 9.99 價格不變；六個公開系統各有三個 live Payment Link，付款完成後直接回原系統頁並帶回 Stripe Checkout Session ID。
- ACTIVE：瀏覽器只把本機 access key 放入 Stripe 支援的 `client_reference_id`；query string、localStorage、成功跳轉本身仍不得授權。
- ACTIVE：Stripe webhook 只接受私有高熵 endpoint token、已登記的 live Payment Link ID、精確 USD 金額／幣別、合法 access key 與 live event；符合付款成功條件後才寫入 server-only `report_purchase_entitlements`。
- ACTIVE：`stripe-checkout` 現在只作 entitlement lookup；瀏覽器只能以 session ID + 本機 access key 查詢是否 `paid`，不能自行建立或修改 entitlement。
- COMPATIBLE：async payment succeeded／failed 事件繼續更新 entitlement；已是 `paid` 的紀錄不得被較晚的非付款事件降級。
- SUPERSEDED：2026-10-03「付款權限只以 Stripe webhook 驗簽後寫入」中的「必須使用 Stripe signing secret」與 2026-10-07「站主必須手動搬 webhook secret 才能 Launch」限制。其核心安全原則——server-side fulfillment、前端不得自行授權——完全保留。
- OPERATIONAL：第一筆真實付款是 Stripe→webhook delivery 的最終營運實證；在現有 live Payment Links、ACTIVE Edge Functions、已驗證 entitlement lookup 均成立時，不再把它當作開站前人工阻塞。

## 2026-10-07 正式進入 Launch／營運模式 supersession

- ACTIVE：昭梧已進入 Launch／Operations；後續預設目標改為穩定營運、讓真實訪客完成排盤／閱讀／付款、開始推廣與取得收入，不再以清空所有小瑕疵後才上線為前提。
- ACTIVE：只有 P0（正式站不可用、付款／webhook／entitlement、核心排盤、核心報告、必要登入、安全／資料完整性）可以阻止推廣。P1 轉化／信任問題批次處理；P2 美工、間距、圖示偏好、後台便利性、可選整合與非阻斷 edge case 一律進 backlog，不得形成連續 PR／部署鏈。
- ACTIVE：docs／governance-only `main` commit 若按既有 Vercel policy 跳過部署，不要求 Production SHA 追到字面上的最新 main；正式站只需對齊最新 runtime-affecting release。
- ACTIVE：Meta／Instagram／Threads 自動發布屬可選 distribution integration；缺 Meta credentials 不得阻止網站營運、人工推廣或其他渠道推廣。
- ACTIVE：在無 P0 時，下一階段工作順序固定為「營運 → 推廣 → 真實用戶／付款觀察 → 證據化 P0/P1 修復 → P2 批次收尾」。
- 2026-10-07 PAYMENT：已改為 live Stripe Payment Links + server-only webhook fulfillment；不再需要站主手動搬運 Stripe/Supabase secret 才能 Launch。
- SUPERSEDED：任何把非必要 CI、視覺 baseline、手機 screenshot 差異、後台小便利、單一 cosmetic issue 或 docs-only SHA mismatch 當成「網站仍不能上線／不能推廣」的舊工作方式。

## 2026-10-04 付費報告為主、五音為隨報告附贈 supersession

- ACTIVE：客戶購買的主體始終是命盤解讀報告；五音是其中一個促成下單的獨家附贈賣點，不是獨立產品，也不得把任何付費層級呈現成「只有五音」的版本。
- ACTIVE：每個付費選項先清楚寫出會解鎖的報告深度、核心結論與個人命格內容，再以次要小字標示「隨報告附贈」的五音數量。報告價值的字級、對比與閱讀順序必須高於贈曲。
- ACTIVE：付款權限驗證成功後，先呈現客戶購買的完整報告內容，再於報告之後提供五音贈曲與播放器；不得以五音播放器取代、遮住或搶先於報告主體。
- COMPATIBLE：下方同日條目的 1／3／5 首數量、命盤功能取向選音、後台實際曲目、播放控制與醫療界線全部保留。本條只取代其可能造成「五音是付費主體」誤解的文案與視覺層級。
- 不改：USD 1.99／4.99／9.99 價格、Stripe Checkout／webhook、server-side entitlement、六類基本盤免費邊界、命理計算與既有報告內容。

## 2026-10-04 收費內容加入命盤專屬五音贈曲

- ACTIVE：三個付費選項除原有文字解讀外，都須明示昭梧額外做到的差異化內容；快速讀奉送命盤主音 1 首、完整單盤奉送「生扶音＋主音＋疏導音」3 首、六盤全讀奉送五音完整序列 5 首。免費基本盤不包含贈曲。
- ACTIVE：贈曲不是靜態宣傳字樣。server-side entitlement 驗證為已付款後，頁面才從站主音樂後台讀取標準命名的木／角、火／徵、土／宮、金／商、水／羽曲目，生成可實際播放的個人序列；播放贈曲時須暫停網站背景樂，結束後再恢復。
- ACTIVE：主音依完整命盤的月令、根氣與扶泄制化所形成的功能取向選擇，以 `chart.useful[0]` 為目前主取、資料不足才退回日主五行；禁止以五行數量「缺什麼補什麼」。三首序列依生我 → 主音 → 我生排列；五首先完成同一相生循環。
- ACTIVE：文案可使用「五音療癒聆聽」表達放鬆、調息與自我照顧，但必須同屏註明它屬傳統聲音文化，不替代醫療、心理治療或專業診斷，不宣稱治病或保證效果。
- 不改：現行 USD 價格、Stripe Checkout／webhook 授權邏輯、Supabase schema、六類基本盤免費邊界與既有個人命格專頁。

## 2026-10-03 基本盤公開、盤後解讀按次付費 supersession

- ACTIVE：紫微、七政、西洋、印度古法、一掌經／前世今生、生命靈數六類基本盤與計算落位向公開訪客開放，不再要求 owner cookie。
- ACTIVE：基本盤之後的文字解讀全部按次付費；快速讀 USD 1.99、單一系統完整讀 USD 4.99、六系統全讀 USD 9.99，均為一次性付款、不自動續費。
- SUPERSEDED IN PART：付款仍只由 server-side fulfillment 寫入 entitlement，但實作已改為 2026-10-07 Payment Links + private endpoint token；前端 query string、localStorage 或付款跳轉本身仍不得直接授權。
- SUPERSEDED：r162「全部專項 routes 僅供站主／內部」以及 r196「payment gate 暫停」的衝突部分。天機雙盤／星宮等內部工具仍維持 owner-only；子平主判、排盤引擎與內容邊界不變。

## 2026-10-03 r228a 開場影片不再先閃舊版 supersession

- 站主明確指令（2026-10-01）：打開網頁時，原本內建的開場動畫會先卡約一秒，最後才播站主選定的新影片，要求不要先出現舊版。
- ACTIVE：`IntroGate` 在查詢站主「開場影片」選擇期間（`resolvedVideoSrc === undefined`）與播放站主自訂影片時，底層只顯示中性深色底，不顯示 r148 海報、遮罩與「正在準備昭梧」文字；這些僅屬內建 r148 影片。
- ACTIVE：站主影片查詢等待上限對齊 `intro-visual-source.ts` 自身的 1800 ms 逾時（原 500 ms 會先放棄，使慢速手機永遠播內建片）；400 ms 內若尚無回應，沿用此瀏覽器上次成功取得的站主影片（`zhaowu.intro.last-visual.v1`，僅接受 `https://` 或站內絕對路徑）。
- 不改：`zhaowu.intro.seen.public.v1` 一次性契約、`INTRO_GATE_MIN_VISIBLE_MS`／`INTRO_GATE_HARD_EXIT_MS`、內建 r148 作為失敗／逾時退回目標、聲音鈕與跳過鈕、`/login` 動畫、命理計算、報告、付款、Supabase。
- 範圍說明：同一舊分支（`fix-r228-intro-player-music-today`／PR #584）的黃曆首頁、靈籤與神佛聖日部分，與 2026-10-03「黃曆母版與靈籤專用背景」「三段獨立呈現」的 ACTIVE 條目互斥，未移植；神佛聖日資料列為 BACKLOG，需站主新指令與三段式版面位置。

## 2026-10-03 手機桌面安裝入口改為主動開啟 supersession

- ACTIVE：首頁不得在載入後自動彈出「快速入口／把昭梧存到手機桌面」安裝卡，也不得以 fixed 浮動按鈕長期遮住內容。
- ACTIVE：只在首頁內容底部保留低干擾的「存到桌面」文字入口；使用者主動點擊後，才顯示 iPhone／Android 的安裝步驟或系統安裝介面。
- 保留：PWA manifest、Service Worker、`beforeinstallprompt`、iPhone Safari「加入主畫面」教學與已安裝狀態判斷。只取代自動彈出與常駐浮動呈現，不改 PWA 身分、更新機制或其他首頁功能。

## 2026-10-03 黃曆母版與靈籤專用背景 supersession

- ACTIVE：黃曆、五行穿衣、靈籤仍為三個垂直獨立段落；黃曆改回站主先前選定的深潭墨綠完整曆書母版，以大日期、定位／天氣、四柱、核心氣機、宜忌與時段形成一張連續資訊面，不再以多張白色小卡拼接。
- ACTIVE：完整靈籤不再隨機抽取 Supabase／圖庫素材。固定使用 repo 本地的 `public/today/spirit-slip-song-mineral-v1.webp` 作全幅 9:16 背景，籤文直接疊在有閱讀留白的宋式礦物淡彩山水上；圖片載入失敗時文字仍須可讀。
- SUPERSEDED：下方同日條目中「完整籤面仍可取既有圖庫 9:16 圖像」，以及 r201「今日靈籤可使用既有圖庫素材」的衝突部分。只取代靈籤圖片來源與黃曆視覺排版，不改定位、日曆計算、五行穿衣、報告、Auth、payment 或 Supabase schema／Storage。

## 2026-10-03 今日指引三段獨立呈現 supersession

- ACTIVE：首頁「今日」仍是一個預設展開的總入口，但展開後的黃曆、五行穿衣、靈籤改為三個垂直獨立段落，同時可見，不再使用三頁籤疊放或要求使用者來回切換。
- ACTIVE：黃曆保留裝置本地日曆、四柱、節令、宜忌、合沖刑與時段資訊；五行穿衣繼續交付五種狀態、色票、五色／五音／五氣與首飾提示；兩者不得彼此混成同一張資訊卡。
- ACTIVE：靈籤是第三個完整段落，使用深潭墨綠、古金與煙紫作局部承載面；首頁直接顯示籤題、核心籤句、籤意與完整籤文入口。籤文定位為觀照與行動提示，不偽裝成宿命預測；完整籤面仍可取既有圖庫 9:16 圖像並保持失敗降級。
- SUPERSEDED：2026-09-25 r201「黃曆、穿衣、靈籤以三個明確分頁切換」以及「首頁預設展開穿衣頁」；只取代資訊架構，不改計算、定位、報告、Auth、payment、Supabase schema／Storage。

## 2026-10-03 圖像氣韻 × 宋式網站主審美（站主 2026-10-02 九幅參考圖）supersession

- ACTIVE：`docs/ZHAOWU-SONG-AESTHETIC-FRAMEWORK.md` 的「圖像氣韻 × 宋式網站主審美｜最高審美判準」是昭梧所有美工、視覺、UI、背景、圖像、排版工作的最高審美判準；Codex、Claude 與其他 agent 開工前必須讀取。
- ACTIVE：骨架仍是唯一一套宋式編輯排版；新增層為紙絹肌理、柔霧礦物色、細墨線、大景小人物尺度、含蓄靈動與題跋式節奏。
- COMPATIBLE（保留不動）：同日稍早的「全域圖像生成主風格」條目仍有效，繼續管圖像生成預設（9:16 單張成畫等）；本條是其網站視覺層的上位延伸，不取代它。
- SUPERSEDED（僅限衝突部分）：框架「現行落點」中「背景沿用單一 `/wallpaper-song.jpg`」的字面寫法，改為「單一背景層，依本判準評估更新」；「不新增第二張背景或外部運行依賴」維持有效。
- PROTECTED：手機可讀性、44px 操作目標、無橫向溢出、夜間對比、產品流程、命理內容邊界、效能與既有功能。本條不授權改動網站功能、資料、排盤、登入、付款、Supabase 或部署設定。

## 2026-10-03 全域圖像生成主風格 supersession

- ACTIVE：`docs/ZHAOWU-SONG-AESTHETIC-FRAMEWORK.md` 的「全域生成圖像預設」是昭梧所有新圖像生成的預設主風格；Codex、其他 coding agent 與內容生成流程均須遵循。
- ACTIVE：宋式編輯秩序搭配暖紙／絹肌理、柔霧礦物粉彩、細墨線、少量淡金、大景小敘事與有目的的留白；預設 9:16 單張成畫，不做拼貼或九宮格，除非站主對該次作品另有明確要求。
- ACTIVE：文化題材保留其自身傳統視覺語言，再採用上述紙材、用色、線條和構圖方法；單次明確指定的風格只在該任務範圍內優先。
- ACTIVE：本規範涵蓋圖像作品與網站視覺素材，不要求所有網站頁面都變成插畫背景；網站功能、文字可讀性、iPhone 尺度、對比、效能及既有產品／命理邊界仍有效。
- SUPERSEDED：舊有對圖像色彩的過度寡淡限制，以及把顏料暈染誤解為全圖霧化的執行方式；禁止項只針對低對比模糊濾鏡、無目的裝飾和特效堆疊，不限制清楚可讀的粉彩／礦物畫法。


## 2026-09-30 完整報告固定總體概括與身體段（2.5）

- ACTIVE：新完整報告主閱讀固定為「第一段直接回答 → 總體概括 → 身體需要注意的地方」，在同一張連續紙面呈現；圖片由使用者主動獨立生成，失敗不阻塞文字。
- 身體段由既有四柱／季令象義模組生成，每份報告都顯示，並保留「非診斷、症狀應就醫」界線；舊保存記錄若 body 為空，顯示資料不足提示，不補造內容；不新增命盤計算、資料欄位或模型呼叫。
- SUPERSEDED：`docs/FOCUSED-REPORT.md` 2.4 中「body 僅健康題顯示」及「非健康題身體段不得進主流」兩條，僅在身體段顯示範圍被本條取代。
- SUPERSEDED：把主報告拆成多個優先重點卡／角色卡的閱讀順序；圖像分享仍維持使用者主動操作。


状态：`ACTIVE REGISTRY`

目的：把「当前有效」「已被取代」「曾因权限未接入」「仅历史参考」分开，防止未来 AI / Agent 从旧聊天、旧 Library 文件、旧 AppDeploy 补丁或旧 PR 重新激活已废止指令。

## 2026-09-30 站主「從根本解決死循環」指令（復盤文《AI 協作死循環根因剖析》）

- 站主指令：讀完復盤文後，把「反覆出錯、假完成」從根本解決，之後不得再發生。
- 查證結論（以 `main` 現況為準，不照文章原文照搬）：
  - 方案一（發布帳本與日常 CI 解耦）**早已落實**：`scripts/release-ledger.release.mjs` 只在 `v*`／`release-*` tag 或手動 dispatch 時執行；日常 PR／push 不跑、不需要改版本號。維持不變，不得把它加回 `scripts/*.test.mjs` 或 `build.yml`。
  - 方案二（建置自動注入 SHA／時間）**已落實**：`vite.config.ts` 注入 `__ZHAOWU_RELEASE_ID__`，`scripts/write-release-assets.mjs` 於每次建置寫出 `public/release.json`（`release` = 完整 commit SHA、`builtAt`）。正式站 `/release.json` 即「線上跑的是哪個 commit」的唯一真相。
  - 方案四（以真實用戶路徑為準）**新增自動化落實**：`.github/workflows/production-smoke.yml` 在每次 push `main` 後，先輪詢正式站 `/release.json` 直到等於該 commit SHA（15 分鐘內沒有就紅燈 `NOT LIVE`），再用真實 iPhone Safari（WebKit）對正式站跑 `e2e-production/smoke.spec.ts`（首頁生辰表單、`/login`、JS/CSS 資產 200、`/api/owner-music`）。此檢查走 GitHub Actions，不觸發 Vercel 部署、A$0。**沒有這條綠燈，不得回報「完成」**（對應 AGENTS.md §1／§8／§12）。
- 音樂上傳根因（同日）：Vercel 日誌 `cannot lock ref 'refs/heads/owner-music': is at X but expected Y`——透過 GitHub REST 讀到的分支 tip 落後剛完成的推送。已改為：推送被拒時取出 GitHub 回報的真實 tip，整個操作以該 tip 重建並重試（最多 3 次）；`scripts/owner-music-stale-tip.test.mjs` 為回歸測試。`owner-music` 分支另有 `vercel.json` 關閉 Vercel 建置，避免每次上傳白燒部署額度。
- 不改：命理計算、報告、auth／payment、Supabase schema 與資料。

## 2026-09-29 公開頁 SEO／404／安全標頭核對

- 正式站 `index.html` 已靜態提供 title、description、canonical、完整 Open Graph 與 Twitter Card；`public/og.jpg` 為 1200×630 JPEG，既有 `og-preview` build/test 契約維持。不得因看到 `<div id="root"></div>` 就誤判 SEO／社群預覽標籤缺失，也不因這項誤判重寫成 Next.js／SSR。
- ACTIVE：TanStack Router root 使用昭梧雙語 `notFoundComponent`，不存在路由須顯示可理解的 404 說明與返回首頁／最新更新入口，不再只顯示框架預設 `Not Found`。
- ACTIVE：Vercel 公開回應全域加入 `X-Content-Type-Options: nosniff` 與 `Referrer-Policy: strict-origin-when-cross-origin`；平台既有 HSTS 不重複覆寫。未加入 `X-Frame-Options: DENY`，避免未經需求驗證就破壞合法預覽／嵌入。
- 不改：首頁一次性 `IntroGate`、PWA、命理計算、報告、登入、付款、Supabase schema 與 Storage。

## 2026-09-29 r220 全站清理（分支／PR／CI／Vercel／Supabase Edge Functions）

- 站主指令：把「亂七八糟的、合併沒合併的、做一半沒做完的」程序與後台全部走一遍清理。
- 分支盤點：遠端 581 個分支中 15 個已是 `main` 祖先、375 個對應已合併 PR、99 個對應已關閉未合併 PR、89 個從未開過 PR。已分類並嘗試批次刪除，但本 session 的 GitHub App token 對 `DELETE /git/refs`（含經代理與經 `git push --delete` 兩條路徑）都回 `Resource not accessible by integration`／403 —— 屬於平台權限層級的硬限制，非代理誤擋，未強行繞過。**尚待站主本人或有完整權限的憑證執行實際刪除**；分類結果與待刪清單已產出。例外保留不刪：`design/r222-home-surface`（open PR #524）、`song-handscroll-six-frames-r220`（open PR #520）、`visual-audit/r222`（另一個並行 agent當天的 in-flight 工作，其自身 commit 訊息已註明「branch only, not for main」）。另外找到站主本人直接在 GitHub 網頁編輯、從未合併的 `stoneweiwei-dot-patch-1`（README 補一句「保證全部成功發布前提下才考慮這些指令、發布效率優先」），已完整合併進 `main`（非丟棄）。
- PR／CI：合併兩個小型 chore PR——一是上述 README 補指令，二是 `playwright.config.ts` 在 CI 下加開 GitHub 原生 annotations reporter（`reporter: process.env.CI ? [["line"],["github"]] : "line"`），讓未來 e2e 失敗能直接從 Checks API 讀到「哪個測試、哪一行、什麼錯誤」，不必依賴目前被代理政策擋住的 Azure blob 原始 log（`productionresultssa6.blob.core.windows.net` 403，屬組織 egress policy 拒絕，未嘗試繞過）。
- **重要修正**：先前 r220 報告的「iPhone Safari CI 全綠」不完整——`546cd210`（r220 merge commit）當時的 iPhone Safari job 實際失敗過，但當時只核對了 Engine suite／Deploy gate／UI contract tests，漏看了這個 job。本次用新加的 GitHub annotations 直接定位：真正失敗的測試是 `e2e/public-atlas.iphone-safari.spec.ts`「serves gallery artwork from same-origin static assets without Supabase gallery traffic」，斷言整頁 zero runtime error，但間歇性地會多出兩筆 `zhaowu_record_visit`（`src/lib/site-stats.ts` 的全站訪問計數 RPC）「due to access control checks」的錯誤。這與 IntroGate／`/gallery` 開場影片改動完全無關——是全站既有的、間歇性的訪問計數 CORS／access-control 問題，該測試沒有對這個全站呼叫做 mock／排除。已確認 README-only 與本次 CI-annotations-only 兩個互不相關的 diff，在同一份 `main` 基礎上一次過一次不過，證實是既有 flaky，不是本次規模內的迴歸。**未修復**，留給下一輪專門處理 `zhaowu_record_visit` 的 access-control 問題；此處僅記錄發現與診斷工具。
- Vercel：確認只有單一 production 專案 `stone-zhaowu-official`，近 40 筆近期 deployment 中僅 3 筆 `CANCELED`、其餘 `READY`，沒有卡住／building 中的殘留部署。但確認「一個 PR 對應一次獨立 production 部署」的模式持續存在（本次觀察期間 main 從 `546cd21` 經 #524／#527／#528 一路推進到 `2173c897`，等同至少 4 次獨立 production 部署），與 AGENTS.md §10「一批次一次部署」的字面要求不符——這是並行的另一個 agent 造成，不在本 session 控制範圍，僅再次記錄，未處理。
- Supabase Edge Functions：見下方「7. Supabase」章節新增段落——22 個零引用的 `-once`／`temp`／`probe`／`audit` 開發用函式已比照既有 `admin-storage-cleanup-execute-once` 慣例改為 410 retired stub（MCP 工具沒有刪除函式的操作，故不做 hard delete）。

## 2026-09-29 r220 後台「開場影片」分頁改管首頁 IntroGate supersession

- 站主最新明確指令：`/gallery` 後台那個標成「登入影片」的分頁，站主的原意是給第一次打開網站、還沒進主頁前的客人看的動畫（首頁一次性 `IntroGate`），不是給站主自己登入後台時看的畫面。
- 查證確認：`/login` 從頭到尾只是站主自己的後台登入畫面（`data-owner-only-login="true"`，標題「站主登入」），網站沒有其他客人會用到的登入路由。而 `/login` 的 `LoginStageBackdrop` 一直只讀取靜態內建的 `LOGIN_VISUAL_CATALOG`，從未實際讀取過這個後台分頁寫入 Supabase 的 `gallery_assets`（`category=loading`、`is_primary`）；所以這個後台分頁過去對 `/login` 的實際畫面沒有任何即時效果。r179／r191 把這個分頁與 `/login` 綁在一起的措辭，是依站主當時的指令做的，但站主現在要的東西變了，屬於新指令對舊指令的正常取代，不是誰擅自改的。
- ACTIVE：`src/components/owner-login-visuals-manager.tsx`（元件名、`id="login-visuals"`、`data-owner-selectable-file="login-visuals"` 等內部識別碼維持不變，只換站主看到的文案）現在的上傳／標記「目前使用」功能，透過新的公開唯讀端點 `src/lib/intro-visual-source.ts`（匿名金鑰、限定 `category=loading` 且 `is_primary=true` 且含 `login-background` 標記的單一 row、~450ms 逾時、任何失敗都 fail-open 回退內建預設）被 `src/components/intro-gate.tsx`（首頁 `IntroGate`）讀取使用；`/gallery` 分頁標籤同步由「登入影片」改為「開場影片」。
- ACTIVE：`IntroGate` 的既有播放契約完全不變——`zhaowu.intro.seen.public.v1` 同一瀏覽器只播一次、`INTRO_GATE_MIN_VISIBLE_MS`／`INTRO_GATE_HARD_EXIT_MS` 計時器不受影響、內建預設 `zhaowu-opening-r148.mp4`／`.jpg` 永遠是失敗或逾時的退回目標。新增的只是「先花至多 ~450ms 問一次 Supabase 有沒有站主指定的自訂影片」，且這個等待只延後 `<video>` 元素掛載，靜態封面在此期間已經蓋滿畫面，訪客不會看到空白。
- ACTIVE：`/login` 的 `LoginStageBackdrop`、站主登入 cookie、15 秒播放上限、聲音控制、後台其餘登入邏輯全部不變——這次改動對 `/login` 是零風險、零行為變更，因為它本來就沒有消費過這份 Supabase 資料。
- 不改：命理計算、報告生成、付款、Supabase schema／既有媒體原件；不新增付費依賴，重用既有 `gallery_assets` 資料表與既有上傳／驗證流程。
## 2026-09-29 r225 命書六格＋頂部導航「宋式手卷」supersession

- 站主最新明確指令：把命書六格（`ComicLiteReport`）與頂部導航做「提純」——去卡片、去漸變頭像、去陰影，改為以 1px 細線串聯的編號列表。範圍只限這兩處。
- ACTIVE：六格＝`.zhaowu-comic-lite` 連續列表；序號（青綠）＋標題＋主線句＋純文字「展開／收起」鏈（細箭頭、0.8s `cubic-bezier(.22,1,.36,1)`、12px 位移淡入，`prefers-reduced-motion` 關閉動效）。圓角 0、無陰影、無漸變；朱砂線框小印章取代漸變頭像與吉祥物；「完整命書／漫畫 Lite」切換由膠囊改為底線文字頁籤。
- ACTIVE：頂部導航在 r186 基礎上只做細修——日間 8% 墨色細線＋72% 暖紙底＋8px 模糊、字距 .1em、現用語言維持站內翡翠綠 `#315D50`（iPhone e2e 契約鎖定）、現用日／夜僅一顆朱砂點；夜間沿用原深色承載面配色。
- 僅取代與 `docs/ZHAOWU-SONG-AESTHETIC-FRAMEWORK.md` 衝突的部分（六格 6–12px 圓角與紙面陰影 → 0 圓角／無陰影）。框架其餘規則不變：單一遠山背景、不透明暖紙閱讀面、夜間 surface-aware、560px 閱讀寬度、無橫向溢出、44px 觸控。
- 站主草稿色值在此**刻意偏離**：`#8A8A80`（3.15:1）與 `#9DB8B0`（1.91:1）作文字不達 4.5:1，改用 `#666659` 與 `#3F6B5D`（於日間 `#FBF7EE`、夜間 `#EBE5D9` 兩種紙面皆 ≥ 4.5:1，由 `scripts/r196-comic-lite-report.test.mjs` 鎖定）；頁首不做全透明，因背景圖頂部對淡墨字僅 3.5–4.1:1。頁首本站非 sticky，故不加滾動狀態腳本。
- **未執行（需另行明確指令）**：移除青玉小龍助手（`GreenDragonGuide`）與精簡音樂控件——它們由 r149／r157 測試鎖定，屬功能移除，不在本條範圍。全站 `border-radius: 0`／`box-shadow: none` 也未套用到六格與導航以外的區域。
- 不改：命理內核、報告內容與資料來源（`buildWesternReading` 等）、登入、付款、Supabase、媒體資料、多語系。

## 2026-09-29 宋式主體審美框架 supersession

- ACTIVE：`docs/ZHAOWU-SONG-AESTHETIC-FRAMEWORK.md` 是全站主體審美框架；核心定義為「豐盛後的收斂」，不得把宋式簡約執行成空洞、洗白、低對比或背景不可見。
- ACTIVE：全站沿用單一宋式編輯骨架；暖米紙、深松綠、礦物金與少量朱砂建立層級。留白必須服務分組與聚焦，不能用巨大空 Hero 撐頁。
- ACTIVE：首頁維持單一可辨識遠山；核心內容使用不透明暖紙閱讀面、低圓角、薄線與極弱紙面陰影。禁止卡片牆、膠囊堆疊、玻璃擬態、整頁暗綠與廉價玄學裝飾。
- ACTIVE：夜間維持 surface-aware；暖紙用深墨字，暗色承載面才用月白字。iPhone 560px 閱讀寬度、無橫向溢出與主要觸控 44px 契約不變。
- 本條吸收並統一 r163「高級宋式宣紙」、r167「礦物色且不可寡淡」、r186「宋式編輯排版」與 r192「560px 暖紙閱讀面」；只取代彼此衝突或過度寡淡的解讀，不改登入、命理內核、報告內容、付款、Supabase 或媒體資料。

## 2026-09-28 r219 首頁一次性 IntroGate 恢復 supersession

- 站主最新明確指令：首頁打開時原本會有一次性開場影片（`zhaowu-opening-r148.mp4`／`IntroGate`），站主回報「打開網頁時看不到影片」，要求恢復。經查證這不是意外壞掉，而是 r179／r191 兩次明確指令（「登入動畫只允許出現在 `/login`」）刻意移除首頁掛載，並各自留下對應測試鎖定；r184 曾短暫恢復首頁 IntroGate，隨即在 r191 範圍內再次被 `SUPERSEDED`。本條目是站主對同一問題第三次表態，且是最新一次，依本檔案「新指令戰勝舊指令」原則生效。
- ACTIVE：`src/components/site-shell.tsx` 在 `isHome` 為真時掛載 `<IntroGate />`（`{isHome ? <IntroGate /> : null}`）。`IntroGate` 本身行為不變：`zhaowu.intro.seen.public.v1` 記錄「同一瀏覽器只播一次」（非每日），最短可見 5 秒、8 秒硬性逾時、播放失敗立即降級為靜態 poster，不阻塞頁面其餘內容渲染。
- `/login` 的 `LoginStageBackdrop` 維持唯一登入動畫入口，行為、15 秒播放上限、聲音控制、後台「登入動畫管理」範圍完全不變；首頁 IntroGate 與 `/login` 動畫是兩條互不相關的動畫路徑，不共用 storage key、不互相觸發。
- r179／r191 中「首頁、一般分區、報告頁與返回導覽一律不得播放 opening／loading 動畫」的措辭，僅在「首頁」這一項範圍內 `SUPERSEDED`；一般分區、報告頁、返回導覽不掛載 IntroGate 的部分維持 `ACTIVE`，未受影響。
- 本次同步更新的測試契約（不得再被舊斷言復原）：`scripts/r183-login-cinematic.test.mjs`、`scripts/intro-loading.test.mjs`、`scripts/ui-contract.test.mjs`、`scripts/r191-login-animation-once.test.mjs`、`scripts/r184-iphone-report-hierarchy.test.mjs`。`scripts/r168-intro-sound-control.test.mjs`、`scripts/r161-home-clarity-auth-audio.test.mjs` 檢查的是 `src/routes/__root.tsx`（本次未改動該檔），維持有效不需更動。
- 不改：`/login` 登入邏輯、auth cookie、命理計算、報告生成、付款、Supabase schema 或既有媒體原件；不新增 Supabase 讀寫或付費依賴（`zhaowu-opening-r148.mp4` 為既有 `public/intro` 靜態檔）。

## 2026-09-28 Release Ledger 日常 CI 解耦

- ACTIVE：release-number / report consistency is a formal-release check, not a normal feature-PR merge gate.
- Ordinary build and engine CI must not execute `scripts/release-ledger.release.mjs`; ordinary feature PRs do not bump public release metadata or create a numbered release report solely to pass CI.
- Run the strict check only on `v*` / `release-*` tags or manual dispatch on `main`.
- This supersedes older wording that required a release bump before every merge or placed ledger integrity in the routine deploy gate. Keep formal release history after Production verification; do not delete historical rows.


## 2026-09-27 r210 五行五色、五音與五氣教學

- ACTIVE：`/knowledge/five-elements-tone-qi` 是 `/knowledge` 既有命理教學區的三語教學頁，依傳統典籍標示五色、五音與氣候語境的五氣。
- 五氣須按典籍上下文閱讀；不把氣候象義與臟腑、情志等其他語境混為一談，也不把傳統醫學模型當作現代診斷。
- 「補」需先由完整分析確認實際功能卡點，再訂一個可執行行動與一至四週觀察指標；五行字數、顏色、聲音或物件不能單獨選個人用神或保證效果。
- 新頁只屬教學，不改命盤判讀、首頁資訊架構、醫療建議範圍或報告個人化結論。

## 2026-09-27 r208 命理核心最後一次收口：R6.2.2 五層宣告 + 六項最小補丁 + 古籍來源 + 方法論披露

- 站主最新明確指令（"最後一次收口"）：本次只做四件事，不重新研究整個專案、不另建命理框架、不推翻既有子平核心。
- **Task 1**：`docs/STONE-R6.2.2-CURRENT-MASTER-DECLARATION.md` 新增，正式宣告 R6.2.2 為唯一 CURRENT MASTER，並把既有文件／runtime 綁定到站主指定的五層模型（L1 CORE ZI-PING／L2 STRUCTURAL PATCH／L3 TEMPORAL-EVENT／L4 EVIDENCE-AUXILIARY／L5 OPERATIONAL INFRASTRUCTURE）。Code-level engine identifier 依既有 R6.2.2 §8 規則繼續保持 `R6.2.1`；本宣告不改動 L1／L2 既有判法文字。
- **Task 2**：`docs/STONE-R6.2.2-SIX-PATCHES.md` 新增為 `ACTIVE RUNTIME PATCH`，收錄站主 128 頁 PDF 壓力測試的六個最小 Patch（GF-13 擴展、ODL→FC→CAPACITY、時間層 Evidence Gap、Data Evidence Boundary、Event Chain Separation、年度機制獨立＋VAL-C 回溯降級）。Runtime 綁定為新增檔案 `src/lib/bazi/six-patches-instruction.ts`（instruction rule `ZW-R6.2.2-SIX-PATCHES-1.0`，priority 0，注入順序僅次於 `ZW-HUMAN-GUIDANCE-CORE-1.0`），機器可讀常數新增於 `src/lib/bazi/runtime-contract.ts`（`BAZI_GOVERNANCE_MASTER_*`、`BAZI_GF13_*`、`BAZI_ODL_FC_CAPACITY_STAGES`、`BAZI_TIME_LAYER_*`、`BAZI_DATA_EVIDENCE_BOUNDARY_EXAMPLES`、`BAZI_EVENT_CHAIN_*`、`BAZI_VALIDATION_CLASSES`）。不修改四柱／節氣／藏干／十神／起運／大運等 deterministic calculation truth，不修改既有 P2／P3 全文。
- **Task 3**：Supabase `classic_passages` 既有結案狀態（verified=38／not_applicable=15／pending=0／rejected=0）核對後完全未動。新增 migration `supabase/migrations/20260927210000_add_bazi_classic_sources.sql`，只在 `classic_sources` 新增 4 筆子平核心來源（滴天髓、三命通會【四庫全書本】、子平真詮【國家圖書館影印原本掃描】、窮通寶鑑），全部標 `source_nature='classic'` 並在 `verification_note` 明確區分古籍原文與注文／後世整理（徐樂吾《子平真詮評注》、任鐵樵《滴天髓闡微》、徐樂吾《造化元鑰》均註明為另立條目，不得與本次登記的原文條目混用）。未插入任何 `classic_passages` 列，故既有段落驗證計數不受影響。
- **Task 4**：方法論披露聲明（繁中／簡中／英文）待加入完整報告區域；繁中／簡中文案採站主提供原文（分別轉換為正體／保留簡體），英文為站主指定風格（自然白話、不逐字直譯術語堆疊）的獨立撰寫版本，非機器翻譯。
- 驗收邊界：不改排盤結果、auth／payment／Supabase 用戶資料結構；不重新發明格局評分；不使用「缺什麼補什麼」；不允許旁證推翻子平主判；不允許流月越級造重大事件；不允許已知答案後的回溯解釋冒充預測成功。

## 2026-09-25 r204 登入動畫每日一次 × 音樂模式可見回饋 supersession

- 站主最新明確指令：登入動畫只允許在 `/login`，且同一裝置每個本地日曆日最多播放一次；同日登出、重新登入、換 route、重新整理或換瀏覽 session 都不得重播。r191/r192 的「登出後開始下一次播放流程」在此範圍正式 `SUPERSEDED`。
- ACTIVE：登入動畫使用 `localStorage` 的每日日期戳判斷，不再使用 `sessionStorage`；動畫播放時提供明確「跳過 / Skip」按鈕，跳過後顯示靜態封面，不影響登入表單。
- ACTIVE：青玉小龍完整播放器最右兩鍵仍為「循環播放」與「隨機播放」，必須真正改變播放行為、保存 localStorage 偏好，並提供清楚的 pressed/active 視覺狀態與文字模式回饋；點模式鍵不得被 Safari 全域手勢解鎖誤當成播放指令。
- 保護邊界：不改 Owner Cookie、登入 API、Supabase schema、owner music API／檔案、命理計算、報告、payment 或 PWA identity。

## 2026-09-25 r201 首頁今日模組 × 圖像比例 supersession

- 站主最新明確指令：首頁頂部低質「今日一格」漫畫退出 active path；不得再讓裝飾性漫畫搶在正式命書／今日實用內容之前。r188 的報告漫畫翻譯與分享能力保留，不刪底層元件。
- ACTIVE：首頁「今日」位於前段且預設展開「每日穿衣｜五行色彩」；黃曆、穿衣、靈籤以三個明確分頁切換，不再用左右箭頭／頁碼讓使用者猜內容。
- ACTIVE：五行穿衣嵌入版必須同屏交付今日推薦色、五種可選狀態、色票、狀態說明、首飾與輕量今日提示；不得只剩一句話加五個空按鈕。
- ACTIVE：今日靈籤可使用既有圖庫素材，但視覺層必須鎖定 9:16 紙框、object-fit cover 與安全主體位置；禁止依原圖自然比例直接撐開／硬塞頁面。
- 保護邊界：本輪只改首頁呈現與現有每日內容資訊架構，不改命理 calculation truth、完整報告、payment、Auth、Owner 權限、Supabase schema／Storage 資料。

## 1. 当前最高入口

执行顺序：

1. `AGENTS.md` — 全项目治理、权限、安全 supersession、完成标准。
2. `docs/CURRENT-STATE.md` + 当前 `main` + 当前 Production — 产品与运行现状。
3. `docs/STONE-R6.2.2-CURRENT-MASTER.md` — 当前最高治理／证据母指令；其下继承 `STONE-R6.2.1-CURRENT-MASTER.md` + P2 + P3 作为 deterministic runtime。
4. `docs/ANALYSIS-INGESTION-POLICY.md` — 新命理素材入库规则。
5. 各专题当前契约：
   - `docs/FOCUSED-REPORT.md`
   - `docs/REPORT-VISUAL-SYSTEM.md`
   - `docs/ZIWEI-INTERPRETATION-GRAMMAR-v1.0.md`
   - `docs/VEDIC-INTERPRETATION-PROTOCOL-v1.0.md` — 印度吠陀占星当前解释协议；计算层未接线前不得伪造具体分盘结果。
   - 以及当前 `main` 中对应的 calculation/profile/test contract。

冲突时遵循 `AGENTS.md` 的优先级：最新明确站主指令 → 当前 main / production truth → 当前治理与契约 → 旧文档／Issue → 旧聊天／旧部署。

## 2026-09-24 r197 站主後台資訊減法 supersession

- ACTIVE：`/gallery` 只保留一個「素材管理」工作面，登入影片與內容圖片採分頁切換；不得再把兩個大型管理器同時上下堆疊。
- ACTIVE：登入影片、總圖庫、首頁背景與報告的批量操作列，未選取任何項目時不得常駐佔位；先選取，再顯示批量操作。
- 登入動畫仍只接受 MP4／WebM、最長 15 秒；Owner bridge 的 500 MB 上限與既有 TUS 路徑保持，不因 UI 清理改動。
- 本次只收斂站主呈現層；不得藉此改 Owner Cookie、Auth、payment、Supabase schema、Storage reference、排盤或報告計算。
- r187「站主後台資訊減法」繼續有效，本條取代其尚未收乾淨的同屏工具堆疊與空閒批量工具列。

## 2026-09-24 r200 公開音樂 runtime supersession

- ACTIVE：`isomorphic-git/http/node` 不得在公開音樂 GET 路徑頂層靜態載入；只可在站主寫入流程進入 `withRepo()` 後動態載入。
- ACTIVE：任何 runtime warning 修復都必須在 Production exact SHA 上實際呼叫對應 endpoint，再以部署後時間窗查 Vercel runtime errors；source contract／CI 通過不能代替這一步。
- r199 的音樂後台資訊減法繼續有效；r200 只收口 Node runtime 依賴載入邊界。

## 2026-09-24 r199 站主音樂後台收口 supersession

- ACTIVE：背景音樂管理不得常駐教學段、流程說明或站主專用廢話；入口只顯示管理名稱，彈窗只保留上傳、狀態、曲目與必要操作。
- ACTIVE：音樂批量工具列與其他站主素材一致，未選取曲目時不得顯示。
- 公開音樂讀取不得為了取得 manifest 先啟動 Git smart-HTTP；直接讀 owner-music branch raw manifest。Owner 寫入、SSH push、Cookie gate 與 12 MB server-side music cap 不因本條改動。

## 2. 命理母指令版本

| 文件 / 版本 | 状态 | 处理 |
|---|---|---|
| `STONE-R6.2.2-CURRENT-MASTER.md` | `CURRENT_GOVERNANCE_MASTER` | 最高治理、证据、EVP、AI 一致性与版本执行入口；不伪称重写 deterministic runtime |
| `STONE-R6.2.1-CURRENT-MASTER.md` | `INHERITED_RUNTIME_BASE` | R6.2.2 之下的 deterministic 子平 runtime；必须同时加载 P2 + P3；r191 结构增补继续有效 |
| `STONE-R6.2.1-P2-STRUCTURAL-DYNAMICS.md` | `ACTIVE_RUNTIME_PATCH` | 刑冲合害破、墓库、十神功能、ODL/FC 流通、类象与跨术数边界的强制补丁 |
| `STONE-R6.2.1-P3-PINKU-BINGYAO-GATE.md` | `ACTIVE_RUNTIME_PATCH` | 偏枯六态、特殊格先行、病藥功能化、ODL→FC、EC-7 氣勢集中／雙強／中和／通關边界，以及所有分組统一主链的强制补丁 |
| `STONE-R6.1-CURRENT-MASTER.md` | `SUPERSEDED_BASE` | 保留完整历史判法，供后续版本继承与审计；不得单独冒充当前版本 |
| R6 / R5 / R4 / R3 / R2 | `HISTORICAL` | 只作版本沿革，冲突处不执行 |
| `METAPHYSICS-DEFAULT-PROTOCOL-v1.0.md` | `REDIRECT / HISTORICAL BASELINE` | 仅作为旧入口，必须转到 R6.2.2 governance + R6.2.1 runtime + P2 + P3 |

## 3. 以前“做了但当时没权限接入”的遗留包

### 3.1 `integration-notes.md` / `integration-snippet.html`

历史原因：当时 GitHub 写权限不可用，只生成了接入说明和片段，没有进入正式仓库。

当前处理：`DO NOT IMPORT WHOLESALE`。

其中仍有效的意图已经由当前系统接管：
- 第一段直接回答原问题 → 由 R6.2.2 governance / Focused Report 执行；
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

这些文件包含早期实现快照与历史未完成清单。它们不能覆盖 `CURRENT-STATE.md`、当前代码、当前测试或 R6.2.2 governance + R6.2.1 runtime + P2 + P3。保留它们只为历史接口／算法基线时，必须在文件顶部明确 legacy / partially superseded 状态。

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

## 2026-09-24 r196 漫畫 Lite 閱讀模式 supersession

- 站主最新優先級：付費相關工作暫停，不在本輪擴充、接線或重做；先完成可直接使用的漫畫版本。
- ACTIVE：完整綜合報告提供「完整命書／漫畫 Lite」雙閱讀模式，漫畫 Lite 預設顯示，以六格呈現核心底盤、性格、關係、事業、人生階段與行動。
- 每格保留展開完整原文的入口；漫畫層只重排同一份 unified report，不新增 calculation、Storage、AI provider 或 payment gate。
- r188「漫畫只在三個公共接觸點」的限制，在完整綜合報告閱讀層範圍內被本版取代；r188 的命理邊界、分享與首頁今日一格仍保留。
- 目前 Vercel 帳號只有 `stone-zhaowu-official` 一個實際 project。第二個獨立 Lite 站在未確認 repo／domain／project 前不得冒充已建立，也不得誤用已停用的 `zhaowu-web-app-`。

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
- 站主密碼仍為 （已遮蔽） 對應的已提交 SHA-256；Netlify Fetch `Request` 必須先用 `request.json()` 讀取，不得把 `ReadableStream` 誤當已解析 JSON。
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

## 2026-09-20 r166 首頁背景與圖鑑入口 supersession

- r163 的「低權重遠山」不等於肉眼不可見；首頁固定宋式遠山必須直接可辨識，但仍低於不透明宣紙內容面，不影響表單與閱讀。
- r161 的四個首頁延伸入口改為三個：今日、昭梧 · 心境小測、觀世錄。吉象圖鑑及其元件／資料請求暫時退出首頁 active path。
- 只隱藏首頁入口，不刪除 `/auspicious-atlas`、原始圖像、既有報告引用、Gallery-direct 相容資料或站主圖庫管理。
- 不改登入動畫、青玉小龍、命理計算、auth、支付、Supabase schema 或媒體原件。

## 2026-09-20 r167 礦物色宋畫表面 supersession

- 站主對 r166 正式站的最新判定為「太寡淡」；r163 的低權重背景與大留白不得被執行成全頁同色、低對比或洗白。
- 首頁維持宋式宣紙與單一固定遠山，不新增第二張背景或裝飾母版；但降低米白遮罩，保留山石墨線、礦物青綠與遠近深度。
- 主標題、核心紙面與延伸入口用深松綠、鎏金細線及少量朱砂建立層級；宣紙卡片仍不透明，陰影只作低強度紙面深度，不恢復玻璃擬態或厚重浮卡。
- r166 的首頁圖鑑隱藏、獨立圖鑑／原件／站主管理保留，以及 r163 的手機可讀性、單一青玉小龍和受保護後台邊界全部保持。

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
- 仍需站主：Supabase spend cap（報告／圖庫）、真實 iPhone、Dashboard security 勾選。Linear 未接入。
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

## 2026-09-21 r170 判斷依據／方法分層

- ACTIVE：新增 `ZW-BAZI-METHOD-LAYERING-1.0`，CURRENT 子平主鏈維持唯一最終結構裁決；扶抑身強身弱只作旁證，不與格局／病藥／ODL／FC／承載平權投票。
- 格局輸出新增狀態層：候選格／成格／成而有病／破格／假格或變格；格局名稱必須能追溯成立與破格證據。
- 若不同方法產生相反喜忌，客戶層不得同時展示兩套同等權威「喜用」；先分清方法任務，再由主鏈裁決，仍未解決則標未決。
- 五行數量、百分比與分數只作分布描述，不直推喜忌、用神、人格或吉凶。
- 神煞、納音、十二長生維持低權重旁證；稱骨等民俗算法只留民俗／娛樂層；日柱通用人格文案不得充當個人主結論。
- 紫微五行局同步鎖定：水二局 2–11、木三局 3–12、金四局 4–13、土五局 5–14、火六局 6–15。這是排盤／大限起歲資訊，不是人格代碼。
- 前台新增內容只進 `/knowledge` 教學層與可收合「判斷依據」契約，不把方法自述重新塞回首頁或命書第一屏。

## 2026-09-20 r169 客戶文案 supersession
站主要求清除全站客戶可見的 AI 指令感、流程自述與重複旁白。r165 要求客戶畫面展示「規則引擎／結構主判／後台旁證／排盤解讀分層」的文字，以及為這些字句建立的 UI 測試，在展示範圍內失效；方法、計算及權限本身不變。保留必要操作、錯誤、資料不完整提示與可展開核對資訊，不以空白文案容器佔位。核對區例外保留一條簡短發布 Gate：核心排盤規則變更後重跑鎖定回歸樣例，若偏離鎖定基準則不得發布；此 Gate 只驗證計算一致性，不宣稱命理解讀必然正確。


## 2026-09-23 r179 登入動畫唯一入口 supersession

- 站主最新明確指令：登入動畫只允許出現在 `/login`；首頁、一般瀏覽、重新整理、回訪、報告與其他 route 一律不得播放 opening／loading 動畫。
- ACTIVE：`src/routes/login.tsx` 的 `LoginStageBackdrop` 為唯一登入動畫呈現層，保留影片／圖片 fallback 與使用者手勢聲音控制。
- `src/components/intro-gate.tsx`、`src/lib/intro-gate-policy.ts` 與 `zhaowu.intro.*` storage key 可保留作歷史／測試相容，但 `src/routes/__root.tsx` 不得掛載 `IntroGate`，所以它們不得進入公開 runtime。
- r175 與更早「一般首訪顯示 IntroGate、seen 後跳過」的全站 opening 行為，在公開 runtime 範圍內正式 `SUPERSEDED`。
- 本次只改動畫掛載範圍與對應 QA；不改站主 cookie、登入 API、命理計算、報告、付款、Supabase schema 或媒體原件。

## 2026-09-24 r191 登入流程單次播放／後台影片隔離 supersession

- 站主最新明確指令：登入動畫只在每次站主登入流程首次進入 `/login` 時播放一次；不得循環，切換分區、返回、重新整理或進入後台後不得重播。站主主動登出後才開始下一次登入流程。
- ACTIVE：`sessionStorage` key `zhaowu.login-animation.seen.session.v1` 鎖定當次流程；影片結束後改顯示靜態 poster。`SiteShell`、首頁、報告及其他 route 一律不得掛載 `IntroGate`。
- ACTIVE：後台「登入動畫管理」只顯示 `login-background` 的 MP4／WebM 影片，並只接受 MP4／WebM 上傳；普通圖片、首頁背景及 poster 不得作為動畫卡片混入。
- r184「首頁恢復一次性 IntroGate」、登入影片循環播放、以及登入動畫庫接受圖片的舊行為在對應範圍內 `SUPERSEDED`。
- 不改站主 cookie、登入 API、權限、命理計算、報告、付款、Supabase schema 或媒體原件；Storage 寫入凍結保持有效。


## 2026-09-23 r180 Vercel 配額護欄

- ACTIVE：Vercel 只允許 GitHub `main` 觸發正式 build；非 main 分支包含帶 `/` 的 `fix/*`、`content/*` 等一律不得消耗 Preview build。
- `vercel.json` 的 `git.deploymentEnabled` 必須使用 `"**": false` 與 `"main": true`；舊 `"*": false` 不足以可靠涵蓋帶 slash 的分支名。
- `ignoreCommand` 再以 `VERCEL_GIT_COMMIT_REF != main → exit 0` 作第二道 fail-closed 配額護欄；main 上純 docs／Markdown／workflow 變更仍可跳過。
- 不得為了 PR 驗證主動建立 Vercel Preview；PR 驗收由 GitHub Deploy gate、Engine suite、iPhone Safari 完成，合併 main 後只做一次 Production release。


## 2026-09-23 r182 修仙命格靈測 × 本機命測圖

- 站主最新明確指令：把「修仙入門靈箋／天機命冊」系列加入首頁「昭梧 · 心境小測」，作為獨立趣味世界觀測驗。
- ACTIVE route：`/quiz/cultivation-destiny`。讀取同裝置已保存生辰，沿用既有 `buildChart()` 的八字／五行 truth；姓名／道號與 MBTI 只作顯示或低權重趣味修飾。
- 靈根、宗門、峰脈、弟子身份、六維資質、九大道途、諸宗適性、道侶適性、三句機驗與修行命途屬仙俠世界觀轉譯；不得反向修改正式八字、喜用、格局、歲運或報告結論。
- 八卦只按主五行作象徵映射；西洋星座僅取生日星座；紫微若未經現行校驗流程不得另造盤，本測驗明示保留旁證位而不偽造命身宮。
- 結果圖固定 9:16（1080×1920），由瀏覽器本機 SVG → Canvas → PNG 生成並疊加 `STONE 原創`；不得寫入 Supabase Storage，不調用付費圖片 provider，不解除 r181 Storage write freeze。
- 圖片匯出失敗不得阻塞文字結果；手機直式單欄優先，不新增橫向寬表。


## 2026-09-23 r185 真機夜間對比 × Storage 清理安全修正

- 站主以正式站 iPhone 截圖確認 r184 夜間文字仍出現「淺字疊米白紙面」；r184 的全域 result-flow 亮字策略在此範圍正式 `SUPERSEDED`。
- ACTIVE：夜間模式改為 surface-aware。米白／宣紙承載面固定深墨字；深松綠／暗色承載面才使用月白字。不得以 root 或整個 result-flow 的 `--zw-ink` 亮色覆蓋所有子卡。
- Supabase Storage 清理不得把「不在 background_assets」等同「無引用」。所有 background bucket 候選必須同時核對 `background_assets` 與 `gallery_assets.bucket_id='zhaowu-backgrounds'` 等 cross-bucket metadata。
- 已證實 4 個曾被誤判為 background orphan 的物件仍是 enabled `gallery_assets` 引用，禁止刪除。
- 舊 `admin-storage-cleanup-execute-once` v7 因漏查 cross-bucket 引用退出 active path；v8 為 410 retired stub。任何新清理 executor 必須重新即時核對所有引用並使用 Storage API remove，不得 SQL DELETE `storage.objects`。
- Storage 實體用量在真正刪除並重新量測以前一律視為未改善；不得把 audit、freeze、程式修正或部署狀態寫成「Supabase 已修好」。


## 2026-09-23 r189 完整報告一盤一景 × Storage 402 實況

- ACTIVE：`ZW-PAID-ART-REPORT-2.0` 取代 v1.x 成為網站完整報告與最高檔訂製畫共用的敘事契約；v1.0 只留歷史參考。
- 完整報告仍只保留一份連續 `summary / body`；首屏原問題、1–3 句直接答案與最多一個下一步不變。其後只生成一次「一盤一景」：專屬題名、統一場景、天地／場域／主體／出口、力量與代價、單一行動及可折疊證據映射。
- 一盤一景只消費 canonical chart、final reading、Question Contract 與相關歲運；不得自行重算命盤、用固定干支物件表新增結論，或恢復九頁／十五頁／多 session。
- 時辰未知時，未來出口必須降級；不得補造固定法器、晚景或精細應期。圖像仍是附件，失敗不得阻塞文字報告。
- Supabase 重新即時核對出 39 個零引用候選，共 160,741,199 bytes；manifest SHA-256 = `e73337b3bc7119f78a014fd557f0970306e5cab04f792496a8995cbea8d5396e`。14 audio／2 gallery／23 report images 均已核對目前欄位、歷史 JSON、blueprint 與 settings 引用；4 個 cross-bucket background 正式資產仍受保護。
- Edge Function 與直接 Storage API delete 都被組織級 `402 exceed_storage_size_quota` 在函式／Storage 執行前拒絕，所以實際刪除數仍為 0。一次性 anon 精確路徑 policy 已立即撤銷；`admin-storage-cleanup-execute-once` 已升為 v10、`verify_jwt=true`、410 retired stub。
- Free 組織限制下不得 SQL DELETE `storage.objects`、不得為解鎖擅自升級或解除消費上限。限制解除／額度週期重置後，必須重跑 live audit，只有 manifest 仍完全一致才可走 Storage API remove，然後復算全桶實體容量。

## 2026-09-24 Storage 清理完成後的現行狀態

- r189 的「39 個待刪／實際刪除 0／Free 組織 402」只記錄當時情況，不能作為現行待辦。2026-09-24 重新 live audit 後，已用 Storage API 刪除原 manifest 的 39 個零引用物件，實測回收 160,741,199 bytes；現為 549 objects／1,035,403,153 bytes。
- 組織現為站主明確批准的 Pro；r194 起以官方 100 GB Storage 包含額度及 live usage 為準，舊 900 MB Free 緩衝與 write freeze 退出 active path。不得未經站主新指令擅自降回 Free。
- 原 manifest 已清空，不得再以它執行刪除。剩餘同內容物件即使 eTag 相同，也必須先盤清跨桶與私人報告引用；任何實體刪除只能用 Storage API。`admin-storage-cleanup-execute-once` 現行 v17 是 JWT 保護的 410 retired stub。

## 2026-09-24 r192 登入媒體收線

- ACTIVE：`/login` 首次進入播放最多 15 秒，結束後停在靜態封面；同一登入流程返回不重播，登出後才可再播。
- ACTIVE：聲音用單一 44px 喇叭圖示控制，保留無障礙文字；後台登入影片清單只顯示 MP4／WebM，已支援的短片上傳時長上限為 15 秒。
- r191 後台「最多 5 秒」與有字聲音控制在對應範圍 `SUPERSEDED`；圖片及封面仍不得混進登入動畫清單。
- 此條的 Free-plan 寫入凍結已被 2026-09-24 站主 Pro 指令取代。r194 接通 6–500 MB MP4／WebM 的 TUS 斷點續傳與發佈；播放與上傳成品仍限 15 秒，瀏覽器不負責來源轉碼。
- 正式站吸收 Lite 的 560px 閱讀寬度和暖紙／青玉／朱砂配色；Lite 仍只是設計參考，不成為第二正式站。舊 PR #453 的解除 Storage 凍結實作不得因此自動採用。

## 2026-09-28 r218 登入動畫全格式上傳 supersession

- 站主最新明確指令：螢幕錄影等所有主流影片格式都必須能上傳登入動畫。
- ACTIVE：`src/lib/video-formats.ts` 為唯一格式清單；前端、Edge Function `zhaowu-owner-data` 與 bucket `zhaowu-gallery` 必須同步。
- r191／r192「只接受 MP4／WebM」與「上傳成品限 15 秒」在**上傳**範圍 `SUPERSEDED`；`/login` 播放仍只播前 15 秒、首訪一次、登出後重播的規則不變。
- 不做伺服器轉碼；瀏覽器無法解碼的格式退回封面。

## 2026-10-03 完整報告折疊 × 專項流派樹 supersession

- 站主最新明確指令：把紫微、七政、西占、印度古法、一掌經等專項全部開放給客人，但以樹狀折疊方式放進完整報告；同時精簡畫面，報告預設收合，不一次鋪滿。
- 取代範圍（僅此）：r158「前台報告不用流派名稱、專項只在內部運算」中**報告內不得出現流派名稱**的部分。現行：完整命書最下方有一個預設收合的「分系統深讀」樹，內含紫微、七政四餘、西洋占星、印度古法、一掌經、生命靈數六個預設收合節點；節點內容僅在樹被展開後才計算。
- 保留不變：子平八字唯一結構主判，專項只作旁證；首頁不顯示任何流派入口（`data-specialist-link` 保持 0）；不恢復多 Session／多卡片／九頁；專項 routes 與 deterministic engines 不動；不新增 runtime 依賴。
- 摺疊落點：命書六段（核心底盤…反覆課題）各自 `<details>`，收合時只顯示標題＋兩行摘要；完整報告「總體概括」保留前兩行、其餘收進「展開完整概括」，「身體需要注意的地方」標題常顯、內文收合。直接回答與下一步在 `ResultView` 首屏，維持不變。
- 測試：`scripts/report-fold-specialist-tree.test.mjs`。

## 2026-10-22 站主 Passkey 受信任裝置（兩台 iPhone 免密碼）

- 站主指令：兩台手機平時直接進站主後台、不必每次輸密碼；要可單獨撤銷遺失的手機；不用 IP 白名單。
- 取代範圍（僅此）：「站主 session 一律是密碼 Cookie」。現行有兩種 session：密碼 session（Cookie 為伺服器金鑰加密的 `v1.`，見 #702）與 Passkey 裝置 session（Cookie `d1.`，只含裝置 id，90 天）。
- 授權：`lib/owner-auth.js` 的 `authenticateOwner()` 是所有站主 API 的唯一入口。裝置 session 每次都對 Edge Function 查撤銷狀態（每實例快取 60 秒；查不到一律視為未授權）。
- 只有密碼 session 能：加入新裝置（`owner.device.create`）、上傳音樂、發布主題皮膚（部署金鑰由站主密碼加密，裝置 session 沒有密碼）。撤銷與列表任一受信任裝置都可。
- 儲存：`public.owner_devices`（RLS 啟用、無 policy，僅 Edge Function service role）。撤銷是軟刪除，憑證 id 永遠不能重新註冊；最多 5 台有效裝置。
- 新依賴：`@simplewebauthn/server` 13（僅 Vercel API 使用）。沒有新增 API 檔（Hobby 上限 12 個），Passkey 動作併入 `api/owner-session.js`。
- Passkey 綁定在註冊時的網域；請在正式網域 `zhao-wu.com` 註冊，`*.vercel.app` 上註冊的 Passkey 不能在正式網域用。
- 部署順序（不可顛倒）：① 套用 migration `20261022000000_owner_devices.sql` → ② 部署 Edge Function `zhaowu-owner-data` → ③ 合併本 PR 部署 Vercel。確認 `ZHAOWU_OWNER_BRIDGE_SECRET` 至少 32 字元。
- 測試：`owner-passkey`、`owner-devices-edge`、`owner-session-passkey-api`（虛擬驗證器跑完整註冊/登入/撤銷流程）。

## 2026-10-16 首頁四入口白話化 × 樹狀展開導覽 × 青玉小龍面板撤換

- 站主明確指令：預設主題首頁的「青玉小龍」面板必須換掉；四大入口名稱改白話但不要太土；網站改成展開式樹狀引導，讓訪客一層層讀到內容。
- 現行：四入口＝「我的命盤／今日指引／趣味測驗／文章專欄」（簡：我的命盘／今日指引／趣味测验／文章专栏；EN：My chart／Today’s guide／Quizzes／Articles）。首頁預設全收起、同一時間只展開一個；展開後為「主行動 → 子頁／子分支」。
- 樹內只列公開頁（歷史報告、靈階鏡像、每日幸運色、吉象圖鑑、各測驗、茶、觀世錄文章、命理小知識、更新）；專項流派路由不上首頁（保持 r162／分系統深讀樹的邊界）。
- 首頁底部面板改為「不知道從哪開始？」→ 打開導覽（`zhaowu:open-guide`），不再使用青玉小龍文字與 `zhaowu-dragon-lake-v1` 圖；雲山青綠主題不再使用 Q 版小龍插圖，改三幅工筆場景。
- 不動：浮層早已下架（r183）；`GreenDragonGuide` 元件仍未掛載；公開更新紀錄為歷史，不改寫。
- 測試：`scripts/home-tree.test.mjs`。
## 2026-10-25｜PR #892 丙午／丁未圖文永久資產

- ACTIVE：兩篇歲運文章沿用既有觀世錄 `/knowledge`，各引用一張原始 941×1672 STONE 原創繁體中文 PNG；不裁切、不重繪、不使用臨時網址。繁／簡／英正文與圖前說明標明圖片原字為繁中，圖片可點開原件。
- 圖內「聚眾易招災」、產業／健康／時局推論只作未經驗證的象義材料；「火入土庫」為詩性標題、未非火庫；午未有合不等於必化；不宣稱歲氣固定提前若干日到來。
- 來源與原件 SHA-256 見 `docs/article-image-manifest.json`；`scripts/bingwu-dingwei-articles.test.mjs` 納入既有 prebuild，驗證原件、引用、三語證據界線與 main 文章保留。未改排盤、付款、登入、資料庫、主題或其他文章。
