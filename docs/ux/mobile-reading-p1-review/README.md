# 手機閱讀 P0 核對與 P1 最小交付

狀態：本地修改／待 PR 審閱；未合併、未部署。P2–P5 未實作。

## P0：核對依據

- 唯一倉庫 `stoneweiwei-dot/zhaowu`，基線 main `8f963e760cf897f3b9dc780567e8fd312891dec6`。
- Vercel `stone-zhaowu-official`：Production `dpl_A249CgtNoXgojeDNjqQzbPHx82PK`，READY，SHA `2d78d892810fbf617e4d661cafee3e1911b5cd68`。`https://zhao-wu.com/` HTTP 200，`release.json` 同 SHA。這不是最新 main，也不是本批的部署。
- 已讀 AGENTS、Instruction Registry、COLLAB、AI Coordination、CURRENT-STATE、FOCUSED-REPORT 與宋式框架；全倉庫未找到 `CODEX_START_HERE.md`。本對話可存取內容沒有 Bazikawa 截圖，不宣稱完成參考圖比對。
- 開放 PR #837：站主 Passkey、認證／授權相關，與本批不重疊；#838：首頁星象，與本批不重疊。兩者都修改 Instruction Registry，因此本批不碰共用指令檔。
- 首頁：`src/routes/index.tsx`、`painted-home.tsx`、`daily-almanac-widget.tsx` 已有入口與今日指引；不另建首頁，不移植 #838。
- 報告：`result-view.tsx` 已有免費預覽、解鎖後答案／追問；`paid-report-pages.tsx` 已有簡明導讀與專業折疊。`nine-page.ts` 已是歷史相容別名，現行報告並非固定九頁。保留任意數目的歷史章節，不重新產生九套分析。
- 圖庫：`report-visual-assets.ts`、`day-stem-portrait.tsx`、`branch-scenery.tsx` 已有本地十干／地支資產；主題由 `theme-skins.ts` 與既有 CSS 系統提供。不重畫、不改皮膚。
- 分享：`report-share-card.tsx`、`share-card.ts` 已有 PNG 與原生分享；另有 Song comic／illustrated 分享入口。後續 P3 應整合，不能再建一套。
- 付款：`report-access.ts`、`report-access-gate.tsx` 與 ResultView 的 server-verified access 邊界保留。現行產品是單次購買，並非前文舊訂閱方案；不改商品、價格、付款連結、站主權益或 API。
- `vercel.json` 已設定非 main 分支 deploymentEnabled=false。未呼叫部署、未更動設定。

## P1：修改與資料來源

1. 既有導讀先呈現問題、直接答案與一個下一步；解釋／利弊及證據保持原生 details，無新增依賴。
2. 有利面只取原報告 narrative.strength；缺欄位明示沒有獨立判斷。不由日主、元素數量或圖像推斷。
3. 結果頁用相同導讀的補充模式替換原本單塊明細，不重複主答案，不影響複雜答案／writer 結果；仍放在原 unlocked 分支，追問位置保留。原 actions、timing、reasons、risks 不丟棄。
4. 專業區增加逐章原文與四類證據折疊，直接消費傳入的 sections，不經術語過濾、截短或重新生成。技術原文全部被過濾的舊報告仍可閱讀。原圖解、摘要、身體與方法區原封保留。
5. 八主題完整導讀尚未提供：目前沒有八組完整、可對應證據的統一欄位。本批只交付已成立的單題閱讀層，不憑文案擴寫職業／關係／三年運勢。

## 驗證範圍

- `npm run check`：PASS（Vite 更新本機生成的 routeTree 後）。第一次 check 的 mythic-atlas 型別錯誤來自舊生成路由，不提交生成差異。
- `npx vite build`：PASS；不是 npm prebuild，不執行整站門禁。既有公開圖庫 URL 的 build-time unresolved 警告仍保留 runtime URL，不是本批新增。
- `node --import tsx --test scripts/mobile-reading-guide-p1.test.mjs`：5 項 PASS。
- 舊 `report-answer-first-r110.test.mjs`：FAIL，main 同樣引用不存在的 `src/focused-report.css`（ENOENT）。本批不修過時整站契約，不宣稱所有相關測試綠燈。
- Chromium 真實掛載 React 元件與現有 styles／layered／design-system／theme-skins CSS，三語 × 日夜 × 320/390px：無橫向溢出。點擊展開九章匿名 fixture 的全部正文、facts／conditions／limits／checks，均可讀。
- 截圖 before 為基線的真實 MobileReadingGuide 元件；after 為本批元件與真實 FocusedReportSections，使用相同匿名示範資料。非客人報告，非 Production 截圖；不代表登入、付費或完整路由 E2E 已驗收。
- React review：無新增 hook／effect／fetch／計費流程；details 原生鍵盤互動，長文沿用 overflow-wrap 與 17px 正文；未加全站 CI／Safari 強制門禁。
- 命理核心／付款／認證／資料庫：均未修改。新章節僅在原專業閱讀面內，結果頁仍受既有 unlocked 限制。

## 手機對照

| 語言 | 修改前 | 修改後 | 展開 |
|---|---|---|---|
| 繁中 | [before](zh-Hant-before.png) | [after](zh-Hant-after.png) | [expanded](zh-Hant-expanded.png) |
| 簡中 | [before](zh-Hans-before.png) | [after](zh-Hans-after.png) | [expanded](zh-Hans-expanded.png) |
| English | [before](en-before.png) | [after](en-after.png) | [expanded](en-expanded.png) |

尚未驗收：真實 iPhone Safari、Production 新閱讀層、真實付款／登入 E2E。此次沒有授權部署，不以正式站驗收作為 PR 交付前置條件。回滾只需還原本 PR，沒有資料遷移或新資源。
