# 昭梧更新報告｜ZW-WEB-2026.09.02-r35

## 本次改動

- 主畫面圖示改為同一金蓮朱砂點的收緊高對比版本，並用 `apple-touch-icon-r35.png` 打破 iPhone 圖示快取。
- Loading 改用站主提供的宋畫蓮塘開花長卷（雙蕾開成一朵金心蓮），靜幀用盛開單蓮；沒有百分比與進度條，三秒內硬退出，可點跳過。
- 不改八字引擎、登入、付款或 Supabase schema。

## 為什麼改

- 舊圖示金線過細、四周空白太多，加到主畫面 60px 後像糊掉的小圖。
- 舊 loading 仍停在百分比，且不是這次指定的開花長卷與彼岸花蓮塘素材。

## 影響範圍

- `src/components/intro-gate.tsx`
- `src/intro-extra.css`
- `index.html` / `public/manifest.webmanifest` / `public/sw.js`
- `public/intro/dawn-lotus-r35.*`
- home-screen icons

## 回滾

- 還原本提交前的 intro 路徑 `dawn-lotus-r34` 或 `wutong-owner-r29`，以及 `apple-touch-icon-r34.png`。
