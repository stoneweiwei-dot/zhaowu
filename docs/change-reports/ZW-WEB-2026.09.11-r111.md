# 昭梧更新報告｜ZW-WEB-2026.09.11-r111

## 本次改動

- 公開吉象圖鑑加入真正的縮圖層：`report-visuals` 網格優先讀 `/report-visuals/thumb/*.webp`，點開才進入 `/report-visuals/full/*.webp`。
- `PublicAtlasAsset` 增加可選 `thumbnailUrl`，保留沒有縮圖的 ornaments 自動回退完整 WebP。
- Vercel 為 `/report-visuals/*`、`/ornaments/*`、`/gallery/loading/*` 加入 `public, max-age=86400, stale-while-revalidate=604800`；HTML、manifest、service worker 仍保持 no-store/no-cache。
- 重新盤點 Supabase Storage：`zhaowu-backgrounds` 291 個物件約 598.19 MB；其中 PNG 196 個約 552.38 MB。`zhaowu-audio` 仍有 4 個 WAV 約 30.28 MB。
- 核對 `background_assets` 後確認仍存在多筆 `enabled=true` 的歷史 daily-rotation metadata，因此本次不做未驗證的物理刪除。
- `docs/GALLERY.md` 改寫為「Supabase 管理源 + Vercel 同源公開交付」的現行混合架構，移除「背景庫已清空」等與現況衝突的敘述。

## 為什麼改

公開圖鑑已經在 r111 前置工作中切到 same-origin WebP，但列表仍直接讀 full 圖，而且新靜態目錄沒有專用 Cache-Control。這會浪費手機流量與重複下載。Supabase 歷史背景與 WAV 同時佔用大量 Storage，但資料庫仍保留啟用 metadata，不能只因前台不再輪播就直接刪掉原檔。

本次先完成無破壞性的高收益項目：縮圖讀取、瀏覽器快取、真實資產盤點與清理邊界鎖定。

## 影響範圍

客戶端：

- `/auspicious-atlas` 與首頁吉象預覽載入更輕的縮圖（有縮圖時）。
- 點擊圖片仍打開原本的完整 same-origin WebP，功能不變。
- 不增加 Supabase 公開 Gallery runtime request。

基礎設施：

- 公開視覺靜態檔可被瀏覽器/邊緣節點重用。
- HTML/app shell 仍保持短生命週期，避免新版部署後客戶卡舊頁。

Supabase：

- 本次只讀盤點，不刪除 Storage 物件，不修改 schema。
- `zhaowu-report-images` 完全不動，保持私有報告圖用途。
- WAV 與歷史背景等待引用核對、轉檔/遷移完成後才進入物理清理階段。

## 驗證

發布前應通過：

1. `npm run test:deploy`
2. `npm run build`
3. iPhone Safari `/auspicious-atlas` smoke/e2e：無橫向溢出、無 Supabase gallery runtime traffic、圖片可正常載入。
4. Vercel Production 狀態 READY，`githubCommitSha` 必須等於合併後 `main` HEAD。
5. 線上檢查 `/report-visuals/thumb/*.webp` 及 `/report-visuals/full/*.webp` 均為 same-origin 且可讀。

## 回滾

如縮圖路徑出現漏檔，可將 `src/components/auspicious-gallery-section.tsx` 的 `src={asset.thumbnailUrl ?? asset.url}` 回退為 `src={asset.url}`；完整圖 URL 未改動。

如快取行為不符合預期，可只回退 `vercel.json` 新增的三條靜態 headers，不影響 Gallery、Auth、命理引擎、報告與 Supabase schema。

本次沒有刪除 Supabase 物件，因此不需要 Storage 資料恢復。
