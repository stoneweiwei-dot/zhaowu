# 昭梧更新報告｜ZW-WEB-2026.09.06-r58

日期：2026-09-06 AEST

## 本次改動

- 將已完成的十天干與十二月令正式視覺母圖接入現有「命之書」報告系統。
- 前端不再讀取舊的本地 day/month sprite 路徑，改讀 Supabase `zhaowu-gallery/report-visuals/r57/` 已驗證存在的 6 組壓縮 WebP sprite。
- 十天干維持既有 deterministic visualKey 映射，共 10 個日主命象；十二月令維持既有 visualKey 映射，共 12 個節令畫面。
- 保留現有 sprite 裁切機制、9:16 顯示、lazy loading 與 `/wallpaper-song.jpg` 失敗備援；圖片失敗不影響報告文字。
- 大運／流年五行母圖暫沿用已驗證的本地 `luck-0.webp`，本次不混入未驗證新資產。
- 新增回歸測試，鎖定 Supabase CDN 路徑、10+12 數量、lazy loading 與 fail-open fallback。

## 為什麼改

十天干與十二月令母圖已經完成並匯入 Supabase，但 Production 前端仍指向舊的本地 `report-visuals/groups/day-*` 與 `month-*` 路徑。這會造成「資產已存在、網站卻沒有真正使用」的斷鏈。r58 只收口這個資產來源問題，不改排盤、判斷或報告契約。

## 影響範圍

- `src/lib/report/report-visual-assets.ts`
- `scripts/report-visual-cdn.test.mjs`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- `docs/change-reports/ZW-WEB-2026.09.06-r58.md`
- Supabase 既有物件：`zhaowu-gallery/report-visuals/r57/day-0.webp`、`day-1.webp`、`month-0.webp` 至 `month-3.webp`

保護範圍：不修改八字計算、月令邊界、喜用判斷、格局病藥邏輯、登入、站主權限、付款、報告文字順序、Supabase schema、既有使用者資料或 Production routing。

## 驗證要求

- `npm run test:engine` 必須 PASS。
- `npm run build` / TypeScript 必須 PASS。
- Vercel Preview 必須使用本次 exact SHA 並達到 READY。
- 合併後 Production `githubCommitSha` 必須等於 `main` HEAD。
- Production `/` 與報告相關靜態資產必須可讀。
- Supabase 6 個 WebP 物件必須仍可公開讀取。
- iPhone Safari 上圖片失敗時不得阻塞文字或造成白屏。

## 回滾

若新 CDN 圖片來源造成跨域、載入或行動端顯示異常，只需將 `report-visual-assets.ts` 的 day/month `src` 回退到上一版已驗證本地 sprite；不得回滾 Supabase 資產、排盤引擎、報告內容或其他無關功能。
