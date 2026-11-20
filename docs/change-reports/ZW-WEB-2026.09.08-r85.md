# 昭梧更新報告｜ZW-WEB-2026.09.08-r85

## 本次改動

- 將每日黃曆移到首頁最上方，縮成安靜的摘要；完整四柱、節氣、宜忌與靈籤入口改由原生收合區按需展開。
- 將「客人資料」從四柱區拆成獨立段落；問事、客人資料、四柱命盤成為三個清楚層級，四柱命盤排列在資料下方。
- 移除問事與命盤的重複大標、巨型淡字水印、厚卡片陰影、大圓角與多餘框線，改用宋式標題、墨色正文、低飽和玉色與較充足留白。
- 將首頁導覽與語言切換縮小，首頁不再重複顯示「四柱八字」入口；背景音樂按鈕改成較輕的固定控制。
- 恢復既有、站主核定的綠金蓮花圖作為 Header Logo，不再使用後加的自繪梧桐圓章。
- 更新首頁、Logo、黃曆、手機語言控制與 release ledger 回歸契約。

## 為什麼改

原手機首頁把導覽、問事、客人資料與四柱命盤都做成厚重卡片，字級、紅綠對比、邊框、圓角與水印同時搶視線；黃曆位置過後且內容一次展開，造成首屏擁擠。Header Logo 亦不是核定品牌圖。這次依站主回饋重排資訊優先順序，讓首頁先讀日期，再問事、填客資，最後看命盤。

## 影響範圍

- 首頁 `/` 的內容順序、問事表單、客人資料、四柱預覽與每日黃曆
- 全站 Header Logo、首頁 Header 導覽與三語切換的視覺密度
- iPhone 390px／430px 響應式樣式
- PWA shell cache 名稱
- 對應 source 與 iPhone Safari 回歸測試

## 保護範圍

本次沒有修改八字、紫微、七政、一掌經、D60 或其他命理計算；沒有修改登入 provider、Supabase schema／權限／客人資料、付款、報告內容、圖片供應商、Owner 權限或既有路由行為。

## 回滾

如需回滾，恢復 r84 的首頁 route、`AnalysisForm`、`BaziChart`、`DailyAlmanacWidget`、`BrandSeal`、`daily-almanac-r69.css`、`zhaowu-design-system.css`、對應測試、service worker cache 與 `site-stats.ts`。不需修改資料庫 schema 或使用者資料。

## 驗證狀態

- Source：黃曆 DOM 位於問事表單之前；問事、客人資料與四柱命盤為三個獨立 section；命盤預覽不再輸出第二組標題；Header 使用 `/apple-touch-icon-v3.png`。
- Local：Vite production build、TypeScript 與更新後的首頁／品牌／黃曆視覺契約測試通過。
- Production：以 r85 最終 commit 的 GitHub 狀態、Vercel Production 與正式站 390px／430px 實際驗證結果為準。
- 首次正式部署：`0492876ff70770c981d3ce8c7c7390113d1d8672` → `dpl_AnUhGKp7VvYHxA6VSGPdCB5712gv` 為 READY，正式 alias SHA 一致；首頁與 `/login` 實際可讀，Logo 正常載入，黃曆收合／客資修改入口通過瀏覽器操作檢查。
- CI 跟進：首次 iPhone Safari 27／29 通過；兩個失敗項仍要求 r75 的八字背景透明度與已移除的重複英文標題。同步為 r85 的扁平八字區、獨立客資背景與新英文標題，並增加 390px／430px 的黃曆高度、段落順序、標題字級、Logo 與橫向溢出測試；沒有改動執行時程式或停用測試。最終重跑結果另記於 release ledger。
- iPhone 實機：自動瀏覽器檢查不能取代站主實機，若未由真機確認則保持「未實機驗證」。
