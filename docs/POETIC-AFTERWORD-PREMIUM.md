# 昭梧・詩證天機｜現行最高付費套組之報告收卷

狀態：PR #795 待驗證及正式部署，2026-10-17。

## 本次立即發佈範圍（取代先前 draft 暫緩說明）

使用者已明確要求「發佈」已提案的最高價付費命書詩證。**目前唯一可用的最高存取層是現行 `bundle`（六系統套組，US$19.99）**；它是現行 highest access rank，**不是未啟用的 Zenith 訂閱**。此功能僅附於既有六系統套組的正式閱讀末尾：紫微、七政、西占、印度占星、一掌經、生命靈數。原八字 USD 19.99 單系統不屬於該套組，本次不改售賣、解鎖或八字的完整命書主流程，也不新增訂閱、收費或 Stripe Link。若將來另建 Zenith，必須獨立制定付費與 server entitlement，不得混淆名稱。

目前 `ReportAccessGate` 依 `resolveReportAccess(system)`，透過伺服器驗證 Stripe session/優惠碼或 owner cookie。此次新增的 `poeticContext` 是**純文學段落輸入**，不是付費授權：僅當 `level === "bundle"` 且文本能適配核驗過的詩句時，才於現有完整報告、五音與資料等級說明後呈現收卷。原 `quick` / `system` 均不得展示；`bundle` 的權限由既有伺服器可驗證途徑取得。現有 Bundle 本來就不含 BaZi，不可暗示此功能會新增八字解鎖。

## 內容和來源品質

匹配順序：**已完成的報告文字 → 已知文學主題 → 經核對詩句**。不得以五行/天干/生肖/神煞反推出高階命局結論；不得將詩句視作吉凶或醫療、投資、法律、婚姻判定的證據。若沒有合適詩句、最後報告缺可信結論或行動、關鍵詞匹配並列，則**省略附錄**，不強行美化。核心完整報告不受影響。

讀者看見：原詩和作者/朝代/作品 → 三語文學解說 → 原報告結論 → 原報告行動 → 文學非命理證據聲明 → 可點擊作品來源；英文保留原始中文。布局沿用宋式宣紙米白、文字清楚、無暗黑粒子。

詩泉 `palemoky/chinese-poetry-api` v0.6.0 的 SQLite 真正詩詞 record ID 尚未核對，因此 `apiRecordId: null`；五則候選作品的引文以維基文庫作品頁逐一核對，沒有引入 GPL 的 Go API server，也不宣稱詩泉 API 已和 Production 串接。作品為原有公有領域詩詞；英文解說/翻譯為昭梧文學轉述。來源須保留，後續擴大庫時應固定 v0.6.0 資料版本、確認每篇來源校勘與授權。

## 必須通過的發佈門檻

1. `node --import tsx --test scripts/poetic-afterword.test.mjs` 及新增的付費分層回歸。
2. `npm run check`、`npm run build`。
3. 最小 390px Safari smoke，檢查 `quick`、`system`、無效/無權限、`bundle` 及 owner，特別不能僅靠 query/localStorage 解鎖。
4. 確認初始 loading / Source failure 都不會導致主要報告回歸或掉付款閘門。
5. 保持 **唯一** `stone-zhaowu-official` Production，main 合併後一次部署、正式站 SHA 與基本頁面驗證；不開 preview host。

文字段屬可選最後一節，不改 `summary/body` 存檔契約、不新增圖像生成或費用。新詩句不算命理計算證據。若上述無法驗證，PR 停留待審核，不能宣稱「已發佈」。
