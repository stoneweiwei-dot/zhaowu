# 昭梧更新報告｜ZW-WEB-2026.09.01-r24

## 本次改動

- 依 Linear STO-13 的 B 方案，恢復客戶前台每日背景輪播；固定壁紙優先，其次是有效排程，最後才是一般每日輪播。
- 站主後台支援一次選取多張背景，逐張顯示等待、上傳、完成或失敗及各自進度。
- 背景管理首次只請求並顯示最近一張；站主主動點開上傳歷史後，才按每頁最多 12 張載入，並提供上一頁／下一頁。
- 正式報告列表在伺服器查詢與客戶端各設一道 QA 隔離，排除 `test`、`qa`、`e2e` 與明確 QA context 記錄；正式客戶資料與原有報告讀取路徑不變。
- 客戶報告卡保留兩個主要操作；生成圖、複製、重生與刪除集中到主動展開的管理操作，不重新塞滿手機畫面。
- 前台仍使用現行宋畫宣紙 B 版卡片、字體、留白與主按鈕層級；背景失敗時回退倉庫內建 `/wallpaper-song.jpg`。

## 為什麼改

現行主線保留了背景選擇與多圖選取能力，但前台已不再調用每日輪播，後台仍在進頁時抓取全部背景，多圖上傳也只有一個總體忙碌狀態；先前 QA 排除又在報告摘要／詳情懶載入重構時被移除。這次把 STO-13 四個缺口一次收口，同時保護目前已批准的手機精簡畫面。

## 影響範圍

- 客戶與登入頁背景選擇：`src/components/site-shell.tsx`、`src/home-sheet-ui-v5.css`
- 背景資料、輪播優先級、分頁與上傳進度：`src/lib/background-assets.ts`
- 站主背景管理與客戶報告卡操作：`src/routes/account.tsx`
- QA 列表隔離：`src/lib/supabase-rest.ts`
- 驗收鎖：`scripts/sto13-b-variant.test.mjs`

不改動子平主判、問題直答、男女／LGBTQ、真太陽時、每日三次、帳號／Owner 權限、歷史報告、PDF 隔離、付款、Supabase schema 或 ZW-FINAL-SINGLE-IMAGE-1.0。

## 回滾

回滾本版本 commit 即可恢復 r23：前台回到內建固定宋畫背景、後台回到原全量背景列表與總體上傳狀態、報告卡操作回到原展開方式。沒有資料庫 migration；既有背景、排程、報告及客戶資料不需轉換。

## 驗證狀態

- 本機 TypeScript：PASS。
- STO-13 定向契約與完整 engine tests：331/331 PASS。
- Vite production build：PASS（284 modules）。
- iPhone Safari、Android Chrome、Desktop Chrome 的 STO-13 Playwright 案例已建立並通過測試枚舉；本機瀏覽器下載端點回傳 0-byte 檔，實際渲染改由 Vercel preview／production 驗收。
- Vercel Production、正式網路請求、Owner 真實登入與 frontend/backend/network error：待 main 部署後直接驗證。
