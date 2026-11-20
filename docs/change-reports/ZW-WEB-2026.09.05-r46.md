# 昭梧更新報告｜ZW-WEB-2026.09.05-r46

日期：2026-09-05 AEST

## 本次改動
- 重做首頁「今日黃曆」視覺：改成更接近站主參考圖的單張大圓角日卡，保留昭梧米白、宣紙、松綠與低飽和暖色語言。
- 黃曆卡加入大日期暗紋、清楚的日期／今日能量、主提示、兩欄「宜／忌」與前往問事的圓形箭頭入口；手機優先閱讀，桌面自動放寬。
- 今日卡會在訪客本地午夜後自動刷新，不需要重新載入整個網站。
- 首頁重新整理為單一閱讀流：今日 → 問事／八字 → 本次答案 → 四門分觀 → 趣味測驗 → 吉祥圖庫 → 觀世錄 → 加到主畫面。
- 統一首頁各分組的外距、內距、圓角、邊界與欄寬；手機增加左右安全留白，桌面內容欄放寬但不散開。
- 四門分觀在寬螢幕改兩欄，趣味測驗在寬螢幕改三欄；手機仍保持單欄，避免擁擠。

## 為什麼改
站主在今日黃曆初版上線後，要求「做出來，然後網站整體排版」。初版只有功能存在，首頁仍沿用較緊密的舊 v5 間距，與參考圖的大留白、卡片層級不一致。r46 把黃曆與首頁其餘內容整理成同一套視覺節奏，而不是再疊一張孤立卡片。

## 影響範圍
- `src/components/daily-almanac-widget.tsx`
- `src/routes/index.tsx`
- `src/home-layout-r46.css`
- `src/lib/site-stats.ts`
- `scripts/daily-almanac-home.test.mjs`
- `scripts/release-ledger.test.mjs`
- 首頁 `/`

## 保護範圍
本版不修改：
- 八字、紫微、七政、一掌經等排盤／推理計算
- Auth / OAuth / 登入
- 付款
- 報告生成內容與歷史報告
- Supabase schema、使用者資料與權限
- 專門分析路由的內部版式
- Vercel 專案或 production routing

## 回滾
回滾 r46 首頁版式提交即可恢復 r45 的功能型今日黃曆與舊首頁間距；不需要資料庫 migration 或資料回滾。

## 驗證狀態
- GitHub：待本版最終提交 SHA。
- CI / build：待 exact commit 的 Production build、TypeScript 與 regression gates。
- Vercel：沿用 `stone-zhaowu-official` Git integration，不建立第二專案，不手動重複部署。
- Production `/`：待 exact r46 deployment `READY` 後驗證。
- Mobile Safari：自動 regression 需通過；沒有真機證據前仍標記為未實體視覺驗證。
