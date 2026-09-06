# 昭梧更新報告｜ZW-WEB-2026.09.06-r62

**日期：** 2026-09-06 AEST

## 本次改動
- 將連結預覽卡 `public/og.jpg` 換成站主提供的雙蓮金殿長卷裁切，固定為 1200×630 JPEG。
- 在 `index.html` 補上 `og:image`、`og:image:width`／`height`／`type`、以及 `twitter:card=summary_large_image`。
- 以 `scripts/write-og-preview.mjs` 在 build 時重建 `public/og.jpg`。
- 不改 X 動態／帳號橫幅。

## 為什麼改
站主指定連結預覽要對上雙蓮金殿圖。舊 `og.jpg` 是 1008×566 山水，且頁面沒有 `og:image`。r61 運勢美工帳本已合入 main，本次只補預覽卡。

## 影響範圍
- `public/og.jpg`
- `index.html`
- `scripts/og-preview.test.mjs`
- `scripts/write-og-preview.mjs`
- `package.json` build hook

## 保護範圍
未修改八字／紫微／七政／一掌經計算、auth、payment、Supabase schema、報告生成、X 帳號橫幅資產。

## 回滾
回滾本 r62 commit 即可。不需要資料庫回滾。

## 驗證狀態
- `public/og.jpg` 必須為 JPEG 1200×630。
- Production `/og.jpg` 必須 HTTP 200、`image/jpeg`。
- Production `/` HTML 必須含 `og:image` 指向正式站 `/og.jpg`。
