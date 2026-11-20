# 昭梧｜全站美術與排版改版執行指令
版本：ZW-EDITORIAL-2026-10-27 · 狀態：PR 待驗收
唯一來源：GitHub `stoneweiwei-dot/zhaowu` → `main`；唯一正式站：Vercel `stone-zhaowu-official`／`https://zhao-wu.com/`

## 一、工作鎖與治理
TASK: ZW-EDITORIAL-2026-10-27
OWNER: gpt
STATUS: PR
BASE_MAIN_SHA: e5a805e8fc20fd2ed40c9c5c316bedb6efb04968
BRANCH: gpt/20261027-site-editorial-reframe
SCOPE: 現行全站共用視覺層；首頁畫境；/about 內容型頁面。整理審美排版及研究執行規格。
DO_NOT_TOUCH: Auth、owner cookie、Stripe、promo、Supabase、報告與命盤計算、曆法、路由系統、資料表、存放媒體及已發布的節氣畫作；不得自動新增雲端服務或付費額度。
FILE_LOCKS: src/styles.css；src/zhaowu-design-system.css；src/painted-home.css；src/about-zhaowu.css；src/routes/about.tsx；本文件。
ACCEPTANCE: 保留功能與語系；頁面閱讀不產生橫向溢出；首頁可開始排盤；/about 的標題、內文、原始畫作及進入首頁入口可讀、可點；主題切換保留；主機依原規則發布。
PR: 此文件建立時待填入實際 PR URL。

## 二、重設計主旨
**宋式書卷 × 當代藝術年鑑**。不是古風背景貼片，更不是通用 SaaS 卡片式 UI。

1. **編輯骨架**：畫作、標題、引言、章節、正文依序形成連續閱讀動線；能以一條頭尾分隔線表達的地方不使用卡片邊框。
2. **字體階層**：中文宋體標題為視覺主角，內文以 16–17px 可讀尺寸及約 1.9 行距為基準；輸入欄位、控制項保持清楚的 UI 字體及 ≥16px。
3. **色彩**：暖紙／墨綠黑／石青松綠；少量朱砂、礦物金；絕不新增黑底粒子、塑膠漸層、發光邊框、玻璃擬態與高對比廉價卡片牆。
4. **頁面配置**：桌面是寬而疏朗的畫冊，手機則是一條可無障礙向下閱讀的單欄；斷點首看 320px、390px。
5. **畫作**：保留本地作品與完整構圖；畫作不由 CSS/SVG 假文字圖替代。關於頁主畫保留全貌、使用 `object-fit: contain`，圖片失效仍有文字可讀。
6. **語言**：繁中／簡中／英文；英文標題使用 Iowan Old Style/Baskerville/Georgia fallback，禁止機械複製中文緊縮字距。
7. **主題**：既有 `data-zws` 節氣/站主畫境保留；修改排版不重寫每套主題的圖像色彩，不以外部 AI 工具作訪客端依賴。
8. **入口**：首頁第一個排盤 CTA 顯著可操作；/about 必須提供「進入昭梧」；站主後台、我的報告等現有入口不隱藏。
9. **無障礙**：閱讀順序以 DOM 為準，不以 CSS `order` 偽裝；鍵盤可達、有 focus；遵守 reduced-motion。
10. **效能及費用**：不新增外部前端依賴、API key 或運行型 SaaS，盡量沿用既有 assets；影片及 HyperFrames 僅作離線宣傳素材候選，非這次網頁 runtime。

## 三、落地範圍
- `src/styles.css`：去除方格紙背景，建立清爽而非空白的書頁紙色與低圓角 token。
- `src/zhaowu-design-system.css`：統一全站題頭、字型、內文換行、閱讀寬度、導覽選擇、頁尾、focus，以及手機安全留白；所有邏輯仍由原 React 組件負責。
- `src/painted-home.css`：首頁 CTA 不再膠囊化；畫卷分段、導覽樹、圖文入口、固定底部導航改成書頁分段語法，但保留圖片與動作。
- `src/routes/about.tsx`＋`src/about-zhaowu.css`：源碼閱讀順序為標題→簡介→完整畫作→繼續探索；八個現有內容分段及三語文案保留。
- 其他專業頁與站主後台：繼承共用 typographic tokens；不以全域 wildcard 改動盤面、圖表或輸入功能。後續個別頁如有經證實的樣式問題才在新任務收斂。

## 四、驗收與發布閘門
1. 在 GitHub 獨立分支提出 PR。先比對最新 `main` 與其他 ACTIVE file locks；**不得直接提交 `main`**。
2. 可用的 CI/build 必須通過；不為純視覺改版更動登入、後端、付款或命盤測試。若 baseline 既紅，區分既有故障與本 PR 回歸。
3. 檢查 320、390、760、1024、1440 px 及三語；頁面不橫向溢出、字體不被裁切、畫作完整、CTA 可點、可按 Tab 瀏覽。
4. 針對 /、/about、/knowledge、/history、/login 及付費報告畫面至少確認原路由仍可進入；主題及夜間介面對比不得下降。沒有設備就不得宣稱「iPhone Safari 實機已驗」。
5. **不建立另一個 Production，不開啟新 Vercel Preview、不新增雙重部署管線**。合併一次經驗收的 PR 後，再查既有 Vercel Production 是否 READY，檢查 canonical。
6. 若 build fail、已知核心流程受損、正式站版本不匹配，停止發布並記錄精確失敗；可以 revert／平台 rollback 但不得隱瞞。
7. SEO 的既有靜態站掃描可能誤判 React 客戶端渲染。這次不另行拆三語 URL 或把本地 preview 的 noindex 複製到正式站。

## 五、研究的適用邊界
研究報告的「重新建 GitHub／改用 Netlify／GitHub Pages／自動部署 Preview」建議建立在缺乏本專案資訊的假設上，**不適用昭梧已確認的唯一主線**。HyperFrames 是可選的離線影片生產工具，不是網頁排版引擎。Grow My Website 為發布後的外部 SEO 檢查工具，不是改版或 Production runtime 的必要服務。

## 六、完成定義
Design 改動已寫入 branch ≠ 正式上線。必須依序標明 Modified、Committed、PR、CI、Deployed、Verified，未經 production 現場與必要實機確認不得寫「全站完成」。
