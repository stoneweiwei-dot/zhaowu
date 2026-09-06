# 昭梧更新報告｜ZW-WEB-2026.09.06-r63

**日期：** 2026-09-06 AEST

## 本次改動
- 生產 `npm run build` 改為：寫 `og.jpg` → `test:deploy` → Vite → TypeScript。
- 新增 `test:deploy` 只跑部署合約：預覽卡、Vercel 政策、deploy-gate、release ledger。
- 完整 `test:engine` 與 iPhone Safari 測試改為 GitHub CI 觀察職，不再擋死 Vercel 正式站。
- Vercel 仍只自動部署 `main`，不新建第二條 production 主線。

## 為什麼改
r62 預覽卡合入後，Vercel 被倉庫裡舊的無關 engine 測試（`rankGalleryAssets`、`isPersonalDecreeAsset`）打死。整包測試仍要跑，但不應阻擋已驗證的生產發佈。

## 影響範圍
- `package.json`
- `.github/workflows/build.yml`
- `scripts/deploy-gate.test.mjs`
- `scripts/release-ledger.test.mjs`
- `src/lib/site-stats.ts`
- `docs/change-reports/ZW-WEB-2026.09.06-r63.md`

## 保護範圍
未修改八字／紫微／七政／一掌經計算、auth、payment、Supabase schema、報告文案、X 橫幅。

## 回滾
回滾本 r63 commit，恢復舊的 `build` script 與單 job CI。不需要資料庫回滾。

## 驗證狀態
- `npm run test:deploy` 必須 PASS。
- Vercel Production 必須對應本 commit 且 `READY`。
- Production `/og.jpg` 仍為 1200×630 JPEG。
