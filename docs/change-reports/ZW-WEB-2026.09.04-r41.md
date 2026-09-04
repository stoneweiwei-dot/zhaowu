# 昭梧更新報告｜ZW-WEB-2026.09.04-r41

## 本次改動

- 主畫面圖示改回站主提供的原金蓮朱砂點圖，不再另做加粗或裁切版。
- Loading 改用站主提供的梧桐雙蓮開花原片與對應宋畫靜幀，畫面構圖與原素材一致。
- 不攸八字引擎、登入、付款或 Supabase schema。

## 為什麼改

- 上一版自行加工後，主畫面 logo 與 loading 都和站主發出的原圖原片不一致。

## 影響範圍

- `src/components/intro-gate.tsx`
- `src/intro-extra.css`
- `scripts/write-intro-media.mjs` / `scripts/write-home-icons.mjs`
- `public/intro/loading-owner-r41.*`
- home-screen icons

## 回滾

- 還原 `loading-owner-r40` 與原 `scripts/home-icons` 圖示。
