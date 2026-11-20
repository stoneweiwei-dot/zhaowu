# 昭梧更新報告｜ZW-WEB-2026.09.23-r180

## 本次改動

- Vercel Git 自動部署規則由 `"*": false` 改為 `"**": false`，同時保留 `"main": true`，完整覆蓋 `fix/*`、`content/*` 等含 slash 的分支名。
- `ignoreCommand` 增加第二道硬擋：只要 `VERCEL_GIT_COMMIT_REF != main` 就直接跳過 build。
- PR 驗收只走 GitHub Deploy gate、Engine suite、iPhone Safari；非 main 不再建立可執行 Preview build。
- r180 分支連續多個 commit 後，Vercel deployment 列表沒有新增該分支 deployment，護欄已在合併前實測生效。

## 為什麼改

r179 修正期間雖然 `vercel.json` 寫了 `"*": false`，但 `fix/r179-login-animation-only` 仍產生 Preview。Vercel 的 branch 規則使用 minimatch，原規則沒有可靠覆蓋帶 slash 的 branch。r180 改用 globstar 並加 Git ref ignore guard，避免再浪費免費部署額度。

## 不改

- 不改網站產品功能、登入、命理計算、報告、付款、Supabase schema 或使用者資料。
- 不新增第三方 runtime 或付費服務。
- Production 仍只有 `stone-zhaowu-official`，來源仍只有 GitHub `main`。


## 影響範圍

- `vercel.json` 的 Git deployment rule 與 ignored-build guard。
- 對應 Vercel policy／deploy gate regression tests。
- CURRENT-STATE、Instruction Registry、release metadata 與本次 change report。

## 受保護範圍

- 不改產品功能、登入、命理計算、報告、付款、Supabase schema 或使用者資料。
- 不改正式網域與唯一 Production 專案。
- 不直接 SQL 刪除 Storage metadata。

## 驗證狀態

- 分支 commit 已證明不再產生 Vercel Preview deployment。
- 合併前仍以 Deploy gate、Engine suite、iPhone Safari 全綠為必要條件。
- 合併後必須確認 Production READY 且 Production SHA = main SHA。

## 回滾

如 Vercel 不接受新 glob／ignore guard，可單獨回滾 `vercel.json` 與對應 policy tests；網站 runtime、資料與命理核心均不需要回滾。

## Supabase Storage 審計（唯讀）

目前 Storage 共 588 objects，約 1,140.73 MB：
- zhaowu-backgrounds 291 / 598.19 MB
- zhaowu-gallery 249 / 353.62 MB
- zhaowu-report-images 33 / 110.90 MB
- zhaowu-audio 15 / 78.02 MB

已再次核對到 43 個「沒有 metadata reference、且排除 brand/」候選，正好對應先前核定清單：
- audio 14
- background 4
- gallery 2
- report-images 23
合計可回收約 167.82 MB，理論上可降到約 972.91 MB。

本次沒有用 SQL 直接刪 `storage.objects`；刪除必須走 Supabase Storage API／Dashboard，避免資料列與實體物件不同步。
