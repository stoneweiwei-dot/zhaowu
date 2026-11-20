# 昭梧更新報告｜ZW-WEB-2026.09.06-r64

## 本次改動

- Header 品牌從紅底「昭梧」印章換成現行蓮花標記 `/icons/zhaowu-lotus-192.png`。
- 首頁試卷、導覽、語言切換、登入按鈕的排版不動。
- 站主執行令寫入技能置頂：先分析，能改就改，不再追問限制。

## 為什麼改

站主明確指出 logo 沒換、排版不要動，並要求以後不要再把協議變成追問。

## 影響範圍

- `src/components/brand-seal.tsx`
- 版本帳本與更新報告
- 客戶可見 header 品牌

## 保護範圍

- 不改 auth / payment / 排盤核心 / Supabase schema
- 不改首頁試卷結構與 OG 預覽卡
- 仍只部署 `main`

## 回滾

將 `BrandSeal` 回復為紅印章文字版，並將帳本退回上一版。
