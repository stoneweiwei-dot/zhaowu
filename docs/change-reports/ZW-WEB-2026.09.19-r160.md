# 昭梧更新報告｜ZW-WEB-2026.09.19-r160

## 本次改動

- 首頁測驗區改名為「昭梧 · 心境小測」（英文 `ZHAOWU · SELF DISCOVERY`），預設只顯示單一標題入口。
- 使用者點開入口後才載入既有測驗卡與五行香氣譜；題目、計分、歷史與路由不變。
- 公開吉象圖鑑移除全部人像型 report visuals，只保留八個無人物祥紋。
- Owner 圖庫分組與原件管理不變；客戶公開 registry 不再自動承接其中的人像型 report visuals。

## 為什麼改

首頁把全部測驗直接攤開，造成頁面冗長；同時站主的 iPhone 實際截圖確認舊人像母圖存在明顯面部重影。兩者都屬客戶可見的呈現問題，需從 active display path 移除，而非只用 CSS 掩蓋。

## 影響範圍

- 首頁測驗入口與展開狀態。
- `/auspicious-atlas` 與首頁吉象圖鑑候選。
- 命詮圖 Gallery-direct 候選。
- 客戶公開 registry 與 Gallery-direct 候選。

## 受保護範圍

- 不刪除或覆寫舊圖片、Supabase Storage 原件與 metadata。
- 不改任何測驗題目、計分、歷史紀錄或 route。
- 不改八字／紫微／D60／七政／一掌等計算。
- 不改報告文字、認證、付款、音樂、Supabase schema 或使用者資料。

## 回滾

回滾本次單一提交即可恢復 r159 的測驗展開方式與舊視覺 registry；沒有資料庫 migration 或不可逆圖片刪除。

## 驗證狀態

- Source regression：668 項通過。
- Build／TypeScript：通過。
- Netlify Production：待部署後核對。
- iPhone Safari：本機 WebKit 缺失；待 Production 手機寬度瀏覽器檢查補充。
