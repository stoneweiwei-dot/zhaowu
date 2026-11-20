# 昭梧更新報告｜ZW-WEB-2026.09.05-r55

日期：2026-09-05 AEST

## 本次改動

- 保留首頁既有資訊結構與功能順序，不新增入口、不改分析流程。
- 新增首頁專用 `home-background-visibility-r55.css`，載入順序放在現有 r52 視覺層之後，作為最後的首頁背景可見度鎖。
- 首頁外框由厚米白遮罩改為近透明薄宣紙，讓每天選中的單張背景真正成為主視覺。
- 今日卡、八字出生資料紙面、四門分觀、趣味測驗、吉象圖鑑與文章區改為較薄的半透明暖宣紙；輸入欄仍保留較高不透明度，避免 iPhone 小螢幕文字與輸入可讀性下降。
- 維持松綠、朱砂、暖宣紙既有色系；不新增 logo、小圖標、裝飾貼紙或多圖拼貼。
- 不使用 `background-attachment: fixed`，維持 iPhone Safari 現有移動端策略。

## 為什麼改

前台雖已有每日單張背景輪播，但舊視覺層仍把首頁外框與核心卡片疊成接近不透明的大面積米白紙，實際背景只在邊角露出。此次只調整首頁表面材質與透明度，不動資訊架構，讓背景從裝飾邊角提升為真正的頁面主視覺。

## 影響範圍

- `src/home-background-visibility-r55.css`
- `src/main.tsx`
- `scripts/home-background-visibility-r55.test.mjs`
- `src/lib/site-stats.ts`
- `docs/change-reports/ZW-WEB-2026.09.05-r55.md`

## 保護範圍

未修改：八字／紫微／七政／一掌經與其他命理計算、出生資料欄位、真太陽時、auth、account、owner 權限、payment、Supabase schema、報告生成、報告歷史、圖片生成、背景輪播選擇邏輯、登入、三語與路由。

## 回滾

回滾 r55 commit 即可恢復 r54 的首頁紙面透明度。背景資產、排程、報告、客戶資料與資料庫皆不需轉換。

## 驗證要求

- 定向 r55 視覺契約測試 PASS。
- TypeScript 與 production build PASS。
- iPhone 390–430 px 首頁可正常輸入與閱讀，不出現固定背景滾動問題。
- Vercel Production 必須對應 r55 merge commit 且為 READY。
- 正式首頁 `/` 必須可載入，並確認 production bundle 含 r55 視覺鎖。
- 最終視覺需確認：背景在首頁主畫面中明顯可見，核心文字與輸入欄仍清楚可讀。
