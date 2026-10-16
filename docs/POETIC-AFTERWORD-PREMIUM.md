# 昭梧・詩證天機｜最高階命書收卷（草稿）

狀態：DRAFT / NOT LIVE，2026-10-17。此分支只建立可追溯古詩庫、三語文學呼應純函式及單元測試；沒有修改任何 runtime callsite、收費、登入、授權、報告持久化或正式站。

## 產品位置

留給未來**真正最高階付費命書**的最後一段文字。現行單一報告首屏仍先回答問題，維持「直接答案 → 總體概括 → 身體需要注意 → 判斷備註」的閱讀契約，不恢復九頁、十五頁或多套相矛盾的結論。最後以宋式宣紙留白與一則適配詩詞收束；390px iPhone 單欄可讀，英文以獨立原創譯文呈現並留中文原詩。

## 權限硬邊界（阻擋上線）

現行 ReportAccessLevel 僅有 quick / system / bundle，六系統 bundle 不含八字；現行最高售價為 US$19.99，與尚未正式啟用的 Zenith 頂級方案並非同一權限。未來新增頂級商品前，需要先確定其購買/退款/持久化方案，再由受信任後端驗證 entitlement。不得靠前端 boolean、localStorage、query、套組價格或既有 bundle 權限偽造專屬內容。此模組中的 editorialApproved 只表示文獻/文案審核，不是任何付費授權。目前純函式沒有被任何頁面呼叫。

## 內容結構與驗證

輸出依次為：已審核詩句（作者/朝代/篇名）→ 古典作品來源連結 → 該詩的實際文學語境 → 直接沿用 canonical report 已完成的解讀 → 沿用唯一現實行動 → 明示「詩句只是文學呼應，不是命理證據」。不以單一五行、生肖、神煞、日干自動匹配詩詞；不以詩重新判旺衰、格局、喜用、宮位或流年。沒有匹配主題、未審核、沒有主結論或沒有現實行動時，返回 null，不以泛吉祥詩湊數。敏感健康、金錢或安全決策禁止把詩句當證據。

資料：本版五則原文已以外部維基文庫文本交叉核對，來源 URL 逐首附於模組。雖參照 palemoky/chinese-poetry-api v0.6.0 的整合方向，**尚未下載並核對該版 SQLite 中五首作品的具體 record ID**，因此一律記錄 apiRecordId=null，嚴禁宣稱逐首在該版本 API 已命中。未來若依 API 擴充，必須在離線流程固定 v0.6.0 checksum、檢查作者/篇名/段落/異文和逐首權利；不可在 Production 自動下載 639 MB 資料或將第三方 API 成為客戶依賴。Go API 的 GPL 與原始資料 MIT 權利分別處理；英文譯文為昭梧自撰。文學類引用不能混作既有古籍命理引文的 verified calculation evidence。

## 尚未完成的工作與最小 QA

1. 建立未來最高級別的正式 server-side entitlement/購買契約。沒有這步不得顯示專屬章節。
2. 核對 v0.6.0 來源庫逐首實際存在、變體和作品編號；補充 approved corpus 後才能聲稱使用 API 中的作品。
3. 將 afterword 作為**最後的可選文字段落**接至受授權的報告正文、持久化和匯出，且不影響現有 summary/body 或 first-screen。
4. 測試：node --import tsx --test scripts/poetic-afterword.test.mjs；npm run check；npm run build；最小 390px Safari；未登入、免費、單系統、bundle、優惠碼都不能冒充頂級 entitlement。
5. 不啟用第三方 provider，不新建 Production，不為測試觸發 Vercel preview，統一經 PR 審核與一次正式發布。

此 PR 合併前仍需完成上列涉及正式授權及整合的工作，當前只代表安全的模組預備，不代表已上線。
