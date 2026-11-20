# 昭梧更新報告｜ZW-WEB-2026.09.10-r100

## 本次改動
- 將首頁既有「每日穿衣 · 五行色彩」模組套用本次確認的宋式美工：亮宣紙、松綠／朱紅／赭金／水藍五行色、低飽和山水紋樣、宋體標題與金色細線層級。
- 五個狀態卡改為「元素畫意圓章 + 狀態名稱 + 五行」的視覺結構；木用松樹、火用日火意象、土用山岳、金用菱金紋、水用水紋，均直接沿用既有 Brand UI Kit SVG，不新增外部素材。
- iPhone 寬度下改為卡片橫向滑動，避免五欄擠壓造成字小；選中狀態有清楚的元素色邊框、圓章內圈與宋式主提示面板。
- 日／夜模式均提供對應紙面層次；夜間維持深松綠透明紙面，不改成純黑。
- 保留既有互動與內容邏輯：由使用者選「今天需要的狀態」，不虛構「今日命理推薦」；並保留「日常色彩象意不等同個人命局喜忌」提示。
- 同步把公開版本 fallback 與 release-ledger 驗收目標由已落後的 r98 對齊到 r100。

## 為什麼改
- 站主要求把已確認的「五行穿衣狀態指南」宋式美工排版真正運用到昭梧網站，而非只交付靜態海報／UI 示意圖。
- 首頁本身已存在 FiveElementWardrobe，故採最小安全變更：不新增第二套功能、不改命理計算，只重做該模組的視覺層級與手機排版。

## 影響範圍
- 首頁 `#five-element-wardrobe` 視覺、五狀態卡、選中提示面板、手機橫向滑動及夜間樣式。
- 新增 `src/five-element-wardrobe-r100.css`，並在 `src/main.tsx` 最後載入，避免污染其他頁面。
- 更新 `src/lib/site-stats.ts` 與 release-ledger 驗收版本。
- 不修改八字／R6、日曆計算、登入、付款、Supabase schema、報告生成、既有五行色映射或其他首頁模組。

## 回滾
- 移除 `src/main.tsx` 的 `five-element-wardrobe-r100.css` import 並刪除該樣式檔，即可恢復 r99 的原模組外觀；無資料庫 migration。

## 驗證
- `npm run test:deploy` 必須通過。
- `npm run build` 必須通過。
- `npm run test:iphone-safari` 必須通過，並確認 390 / 430 寬度無頁面水平溢出。
- Vercel Production 必須為 READY 且 production githubCommitSha 對應本次 main 提交後，才可標記 VERIFIED COMPLETE。
