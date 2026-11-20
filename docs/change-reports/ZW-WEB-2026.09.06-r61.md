# 昭梧更新報告｜ZW-WEB-2026.09.06-r61

日期：2026-09-06 AEST

## 本次改動

- 完成「運之書」最後五張缺失正式背景：木、火、土、金、水。
- 五行背景沿用昭梧舊宣紙宋系圖譜語言，以既有十天干正式母圖做元素級重新構成，不再使用 6 KB 級占位 sprite。
- 新五行 sprite 已上傳 Supabase Storage：`zhaowu-gallery/report-visuals/r59/luck-0.webp`。
- 前端 `report-visual-assets.ts` 改由 Supabase CDN 讀取該正式五行 sprite。
- 保留 lazy loading、圖片失敗宣紙 fallback、既有天干/月令母圖與完整報告順序。

## 為什麼改

十天干與十二月令已在 r58 使用正式母圖，但運之書仍指向 repository 內早期占位 `luck-0.webp`。站主要求美工系統必須一項完成後才進下一項，並把所有尚未生成的背景補齊，因此本 release 只收口這一個剩餘圖像缺口，不擴大到其他產品邏輯。

## 影響範圍

- `src/lib/report/report-visual-assets.ts`
- `scripts/report-visual-cdn.test.mjs`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- Supabase Storage `zhaowu-gallery/report-visuals/r59/luck-0.webp`

保護範圍：不修改八字計算、月令邊界、格局病藥、喜用判定、大運計算、報告文字、登入、付款、Supabase schema、用戶資料或路由。

## 回滾

把 `LUCK_ASSETS` 恢復舊本地 sprite 路徑並回退本 release commit；Supabase 新圖可保留作資產歷史，不需刪除資料表或 migration。

## 驗證要求

- deterministic tests / release ledger / report visual CDN tests PASS。
- TypeScript / Vite production build PASS。
- Vercel Production `githubCommitSha` 必須等於 merge 後 main HEAD。
- Production `/` PASS，並確認五行 CDN sprite URL HTTP 200。
- 真實 iPhone 報告頁視覺仍以站主實機查看為最終肉眼確認。
