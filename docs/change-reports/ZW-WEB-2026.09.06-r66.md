# 昭梧更新報告｜ZW-WEB-2026.09.06-r66

日期：2026-09-06 AEST

## 本次改動

- 頂欄品牌標記從舊的金線紅點蓮花圖，換成站主提供的青綠金蓮花正標（含紅色「昭梧」印）。
- 新標記由 prebuild 寫入 `/icons/zhaowu-official-mark.jpg`，`BrandSeal` 改讀這條路徑。
- 排版、頂欄結構、文案位置不動。

## 為什麼改

上一次只是把紅印章換成個舊 PWA 金線蓮花，並不是站主發來的正式品牌。本次只換標記圖檔本身。

## 影響範圍

- `src/components/brand-seal.tsx`
- `scripts/write-official-mark.mjs`
- `package.json` prebuild
- 公開版本資訊與 release ledger

保護範圍：不修改八字計算、月令邊界、喜忌判定、大運、報告正文、登入、付款、Supabase schema、Production 路由、首頁版式。

## 回滾

回退本次 commit，`BrandSeal` 便回到 `/icons/zhaowu-lotus-192.png`。無資料庫 migration。

## 驗證要求

- deploy-gate / build 必須 PASS。
- 正式站跳過開場後，頂欄左上角必須是青綠金蓮花正標，不是舊金線紅點圖。
- Vercel Production `githubCommitSha` 必須等於合併後 main HEAD。
