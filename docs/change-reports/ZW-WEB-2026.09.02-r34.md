# 昭梧更新報告｜ZW-WEB-2026.09.02-r34

## 本次改動

- 主畫面圖示改為同一金蓮朱砂點標記的加強可讀版本，並用 `apple-touch-icon-r34.png` 打破 iPhone 圖示快取。
- Loading 改用站主提供的梧桐雙蓮開花影片與單蓮靜幀，拿掉百分比與進度條，三秒內硬退出，可點跳過。
- 不改八字引擎、登入、付款或 Supabase schema。

## 為什麼改

- 舊圖示金線過細，加到主畫面後像糊掉的小圖。
- 舊 loading 仍顯示百分比，且素材不是這次指定的開花長卷。

## 影響範圍

- `src/components/intro-gate.tsx`
- `src/intro-extra.css`
- `index.html` / `public/manifest.webmanifest` / `public/sw.js`
- `public/intro/dawn-lotus-r34.*`
- home-screen icons

## 回滾

- 還原本提交前的 intro 路徑 `wutong-owner-r29` 與 `apple-touch-icon-r20.png`。
