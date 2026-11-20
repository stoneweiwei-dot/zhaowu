# 昭梧更新報告｜ZW-WEB-2026.09.11-r108

## 本次改動
- 修復 r107 靜態殼已改為繁體、但 `release-ledger` 仍要求簡體而造成的 Production build gate 失敗；驗收契約現在與 `index.html`、PWA manifest 的繁體預設一致。
- Tea Guardian 固定茶仙圖改為直接使用隨應用部署的 `/public/tea-guardians/*.webp`，不再於每張結果卡先查 `gallery_assets`、再切到 Supabase Storage 公開圖。
- Tea Guardian iPhone Safari 測試收緊：要求結果圖為同源 `/tea-guardians/*.webp`，並要求不產生 Supabase `gallery_assets`／公開 Storage 圖片請求；不再把 Supabase 402 當成正常例外。
- 為 `/tea-guardians/(.*)` 加入一日瀏覽器快取與 stale-while-revalidate，固定圖優先走 Vercel 靜態交付。
- Release fallback 推進至 `ZW-WEB-2026.09.11-r108` / 累計更新 108。

## 為什麼改
- r107 已把靜態 HTML 與 manifest 改成繁體，但舊 release-ledger 測試仍鎖定 `zh-Hans`，導致最新 `main` 的 Vercel Production build 在測試階段失敗；Production 因此仍停在 r106，與 `main` 不一致。
- Tea Guardian 使用的是固定、已隨 repo 發布的 WebP 茶圖。繼續為固定圖查詢 Supabase DB/Storage 只會增加公開流量、cached egress 與配額耗用，且在配額用盡時產生 402。這類固定美工素材應由 Vercel 同源靜態交付。
- Gallery 後台與動態資產能力仍需保留，因此本次只切斷 Tea Guardian 固定 catalog 的公開 runtime override，不刪除 Gallery 管理 API。

## 影響範圍
- `src/components/tea-gallery-image.tsx`
- `e2e/tea-guardian.iphone-safari.spec.ts`
- `vercel.json`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- 本變更報告

## 保護範圍
- 不修改八字排盤、R6.2.1 主判、正式取用／喜用、auth、payment、Supabase schema、完整報告 `summary/body` 契約或使用者資料。
- 不刪除 `gallery_assets`、Storage bucket、Owner Gallery 上傳／管理能力；其他真正動態圖庫沿用原路徑。
- 不把 CI 的 iPhone WebKit 說成實體 iPhone；實機最終驗收仍是獨立待辦。
- 不在本批混入正式取用／喜用的高風險命理引擎改動。

## 回滾
- 還原 `TeaGalleryImage` 的 Gallery lookup 即可恢復舊的 Supabase override 行為。
- 移除 `/tea-guardians/(.*)` Cache-Control header 即可回復預設 Vercel 靜態快取策略。
- 將 release fallback／release-ledger test 還原到前一個已驗證版本。
- 本次沒有資料庫 migration，也不需要資料回滾。

## 驗證
- 合併前必須通過 Production CI 的 Deploy gate、Engine suite、iPhone Safari。
- Tea Guardian Safari 驗收必須證明：結果圖可載入、同源、路徑為 `/tea-guardians/*.webp`、無全頁橫向溢出、無 Supabase Gallery/Storage 請求、無 console error。
- 合併後必須確認 Vercel Production `READY` 且 `githubCommitSha == main HEAD`。
- 正式站至少驗證 `/` 與 `/tea-guardian` 可進入；Tea Guardian 完成測驗後結果圖載入正常。
- Production 確認後才寫入 Supabase `public.release_history` 的 r108 紀錄。
