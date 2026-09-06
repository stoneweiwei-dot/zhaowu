# 昭梧更新報告｜ZW-WEB-2026.09.06-r61

日期：2026-09-06 AEST

## 本次改動

- 完成「運之書／大運流年」最後一個仍在使用舊占位圖的視覺路徑。
- 不重新生成任何圖片；直接重用 r58 已驗證、已上 Supabase CDN 的十天干正式母圖作為五行運勢意象來源。
- 木使用甲木母圖、火使用丙火母圖、土使用戊土母圖、金使用辛金母圖、水使用壬水母圖。
- 保留原有五行判定：只依既有干支首個天干映射木火土金水；視覺圖不參與命理計算。
- 保留 lazy loading、9:16 sprite 裁切與 `/wallpaper-song.jpg` fail-open 回退。

## 為什麼改

r58 已完成十天干與十二月令正式母圖接入，但 `LUCK_ASSETS` 仍指向 repo 內約數 KB 的舊 `luck-0.webp` 占位 sprite。站主已明確要求不得重複生成已做過的圖，因此本次只修正資產接線，把運之書改用現有正式母圖，完成同一套美工系統的收口。

## 影響範圍

- `src/lib/report/report-visual-assets.ts`
- `scripts/report-visual-cdn.test.mjs`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`

## 保護範圍

- 不改八字、月令、喜用、格局、病藥、大運起運、流年或任何命理計算。
- 不改報告文字、直接答案排序、登入、付款、Supabase schema、使用者資料或路由。
- 不生成新圖、不新增第二套視覺庫。

## 驗證要求

- 全量 tests / TypeScript / production build 必須 PASS。
- Preview 必須 READY 後才可 merge。
- Production `githubCommitSha` 必須等於 merge 後 main HEAD。
- 正式首頁與報告 shell 必須可載入；Supabase 六個 r57 sprite 必須仍可用。
- 真實 iPhone 上每一個命盤組合的逐張肉眼視覺仍屬實機 QA，不得以自動化取代。

## 回滾

若 r61 造成運之書圖像裁切或載入回歸，只回滾 `LUCK_ASSETS` 的五個映射與對應測試；不得回滾 r58 的十天干／十二月令正式 CDN 母圖，也不得觸碰命理計算層。
