# 圖庫十個遺失物件

白澤與九尾在正式站逐筆 GET，以下十個物件均收到 HTTP 400，回應本文為 `{"statusCode":"404","error":"not_found","message":"Object not found"}`。來源為兩人的線上實測。先前本機核對的 198 個檔案屬另一批資產。

|正式站 URL|顯示位置|
|---|---|
|https://zhao-wu.com/sb/storage/v1/object/public/zhaowu-gallery/articles/ai-discarnate-intelligence-20261022/01.png|「AI 是在創造智慧」文章第 1 幅插圖|
|https://zhao-wu.com/sb/storage/v1/object/public/zhaowu-gallery/articles/ai-discarnate-intelligence-20261022/02.png|「AI 是在創造智慧」文章第 2 幅插圖|
|https://zhao-wu.com/sb/storage/v1/object/public/zhaowu-gallery/articles/ai-discarnate-intelligence-20261022/03.png|「AI 是在創造智慧」文章第 3 幅插圖|
|https://zhao-wu.com/sb/storage/v1/object/public/zhaowu-gallery/articles/ai-discarnate-intelligence-20261022/04.png|「AI 是在創造智慧」文章第 4 幅插圖|
|https://zhao-wu.com/sb/storage/v1/object/public/zhaowu-gallery/articles/ai-discarnate-intelligence-20261022/05.png|「AI 是在創造智慧」文章第 5 幅插圖|
|https://zhao-wu.com/sb/storage/v1/object/public/zhaowu-gallery/articles/ai-discarnate-intelligence-20261022/06.png|「AI 是在創造智慧」文章第 6 幅插圖|
|https://zhao-wu.com/sb/storage/v1/object/public/zhaowu-gallery/articles/ai-discarnate-intelligence-20261022/07.png|「AI 是在創造智慧」文章第 7 幅插圖|
|https://zhao-wu.com/sb/storage/v1/object/public/zhaowu-gallery/articles/ai-discarnate-intelligence-20261022/08.png|「AI 是在創造智慧」文章第 8 幅插圖|
|https://zhao-wu.com/sb/storage/v1/object/public/zhaowu-gallery/articles/ai-discarnate-intelligence-20261022/09.png|「AI 是在創造智慧」文章第 9 幅插圖|
|https://zhao-wu.com/sb/storage/v1/object/public/zhaowu-gallery/report-visuals/r62/overview-bg.webp|報告視覺總覽的 CSS 背景圖層|

九張正文圖由 `src/lib/life-view-long-form/ai-discarnate-intelligence.ts` 定義，首頁 `/` 的文章區與 `/knowledge` 文章庫共用 `LifeViewHomeSection`。讀者在列表展開文章 `ai-discarnate-intelligence-20261023` 後，九段正文的插圖載入失敗；元件的 onError 會標記並隱藏失效圖框。文章列表另有本機縮圖。第十個物件由 `src/zhaowu-layered-styles.css:8365` 引用；目前報告總覽使用 ReportSpriteArtwork，未找到掛載該 CSS class 的 JSX，因此已證實物件缺失，尚無該背景實際顯示破圖的頁面證據。

依審查紀錄，倉庫及 Git 歷史均無上述原圖。須由 Stone 或 Muse 交回原始十檔。九張 PNG 逐一用 Get-FileHash -Algorithm SHA256 核對 `scripts/ai-discarnate-article.test.mjs` 的對應摘要，同時核對位元組數；WebP 須由提供者確認來源並記錄獨立摘要。取得授權後才可重傳相同物件路徑，再逐筆 GET 驗證解碼、摘要和頁面顯示。
