# 昭梧更新報告｜ZW-WEB-2026.09.06-r61

日期：2026-09-06 AEST

## 本次改動

- 將連結預覽卡 `public/og.jpg` 換成站主提供的雙蓮金殿長卷裁切，固定為 1200×630 JPEG。
- 在 `index.html` 補上 `og:image`、`og:image:width`／`height`／`type`、以及 `twitter:card=summary_large_image`，讓分享連結使用這張預覽卡。
- 以 `scripts/write-og-preview.mjs` 在 build 時從 base64 payload 重建 `public/og.jpg`。
- 不改 X 動態／帳號橫幅，也不新增第二張社群封面。

## 為什麼改

站主指定連結預覽要對上這張雙蓮金殿圖。舊 `og.jpg` 是 1008×566 山水，而且頁面沒有 `og:image`，分享時平台抓不到正確卡片。r61 只改預覽卡與 meta，不改產品流程。

## 影響範圍

- `public/og.jpg`
- `index.html`
- `scripts/og-preview.test.mjs`
- `scripts/write-og-preview.mjs`
- `scripts/og-preview.jpg.b64`
- `package.json` build hook
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- `docs/change-reports/ZW-WEB-2026.09.06-r61.md`

## 保護範圍

未修改：八字／紫微／七政／一掌經計算、auth、payment、Supabase schema、報告生成、Loading gate、主畫面圖標、背景音樂、X 帳號橫幅資產。

## 回滾

回滾本 r61 commit 即可恢復舊山水 `og.jpg` 與無 Open Graph meta 的 `index.html`。不需要資料庫回滾。

## 驗證狀態

- `public/og.jpg` 必須為 JPEG 1200×630。
- Production `/og.jpg` 必須 HTTP 200、`image/jpeg`。
- Production `/` HTML 必須含 `og:image` 指向正式站 `/og.jpg`。
- 真機／各平台快取刷新標為 `NOT PHYSICALLY VERIFIED`。
