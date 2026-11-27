# 十張遺失圖庫圖片的引用與影響

依提交 `297d63d9` 的原始碼靜態追查。以 rg 搜尋 src、public、scripts、e2e、docs 的文章目錄名、背景檔名及 CSS 類別，再沿文章註冊與元件追到路由。既有實測記錄於 `docs/closeout/gallery-404.md:3`，當時 HTTP 為 400，回應內的物件狀態碼為 404。本次未重新連線或執行測試。

| 直接引用檔案與行號 | 對應頁面與讀者所見 | 測試依賴 |
| --- | --- | --- |
| `src/lib/life-view-long-form/ai-discarnate-intelligence.ts:7, 93–94, 112` | 組出同一目錄的 01.png 至 09.png，依序配給〈AI 是在創造智慧，還是在給「無形意識」一個身體？〉第 1 至 9 段。首頁筆記及 /knowledge 開啟文章時，載入失敗的段落插圖連同圖框與放大連結一起隱藏，段落文字仍可讀。清單另用獨立縮圖。 | 下列文章測試逐張比對路徑及段落順序。 |
| `scripts/ai-discarnate-article.test.mjs:5, 7–19, 21–47` | 測試引用相同文章與九張 PNG，無頁面輸出。 | 一般斷言檢查九個唯一網址、段落位置、寬圖設定及替代文字。啟用 VERIFY_ARTICLE_MEDIA_NETWORK=1 才會逐張驗證 HTTP 200、MIME、大小、PNG 檔頭及 SHA-256；若物件仍遺失，會在 HTTP 斷言失敗。 |
| `src/zhaowu-layered-styles.css:6818, 8361–8375`（URL 在 8365 行） | 舊「命之書」總覽背景。搜尋未找到目前頁面掛載該類別，故無法指認現行受影響路由。若套用此樣式，缺圖時仍有漸層和下一層 /wallpaper-song.jpg（public 內有檔案），不會產生破圖圖示。 | scripts、e2e 未找到直接依賴此檔名或類別的斷言。 |
| `docs/change-reports/ZW-WEB-2026.09.06-r62.md:7, 26` | 歷史版本說明記錄總覽背景與備援。文件讀者看到路徑文字，無執行期載圖。 | 未找到依賴此文件引用的測試。 |
| `docs/closeout/gallery-404.md:7–16` | 既有缺檔紀錄。第 7 至 15 行依序對應 01.png 至 09.png，第 16 行對應 overview-bg.webp。文件表格列出網址，無頁面嵌圖。 | 未找到依賴此表格的測試。 |

## 文章顯示與間接測試

- `src/lib/life-view-long-form.ts:9, 35` 匯入並註冊文章。`src/routes/index.tsx:178–179, 467` 與 `src/routes/knowledge.tsx:8, 76` 分別載入同一個首頁筆記元件和它的典藏模式。
- `src/components/life-view-home-section.tsx:174, 201–207` 優先使用本篇指定的清單縮圖。第 472–494 行才將內文插圖放入連結，失敗時對圖片及最近的 figure 套用隱藏類別。`src/zhaowu-layered-styles.css:12802–12804` 將整框設為 display: none。
- `scripts/r135-readability-music.test.mjs:23, 37, 39` 檢查 CSS 與兩份文章元件的錯圖處理類別。另一份元件見 `src/components/life-view-section.tsx:274`，未找到路由掛載。`scripts/life-view-section.test.mjs:17–18` 及 `scripts/r129-home-music-login.test.mjs:63, 69` 涵蓋相關頁面接線。這些靜態斷言不會下載十張圖。
- public 與 e2e 未命中十張圖的直接引用。
