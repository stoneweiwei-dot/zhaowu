# 昭梧更新報告｜ZW-WEB-2026.09.22-r176

## 本次改動

- Vercel Git deployment 改成 **main-only**：`main=true`，`*=false`。
- 非 main 的工具／修復／文件 branch 不再建立 Vercel Preview。
- 新增 `ignoreCommand`：只有 docs、Markdown 或 GitHub workflow 的變更不消耗 Production build。
- 同一批正式發布包含 r175 IntroGate 修復：首訪完成後，同一瀏覽器 refresh／remount 不再重播 Loading。

## 為什麼改

過去為節省免費額度把 Git deployment 全關，造成每次正式發布都要先打開、部署、再關閉，且關閉用的後續 commit 又讓 main SHA 超前 Production。r176 改為長期 main-only policy：開發與文件變更不部署，只有通過 GitHub CI 後合併到 main 的正式 batch 才進 Production。

## 影響範圍

- Vercel Git deployment policy。
- Production release metadata。
- r175 IntroGate 首訪／回訪行為隨本批一併發布。

## 受保護範圍

- 不新增第二個 Production 專案。
- 不使用 Netlify／Floot／Dropbox 作訪客 runtime。
- 不改命理計算核心。
- 不改 Auth／Payment／Supabase schema。
- 不刪 Supabase Storage 資產。

## 驗證狀態

- PR 合併前必須通過 Deploy gate、Engine suite、iPhone Safari。
- 合併後只接受現有 Vercel `stone-zhaowu-official` 的 main Production。
- 必須再次確認 Production SHA = main SHA、首頁可載入、IntroGate 首訪／回訪符合契約。

## 回滾

若 main-only Git policy 造成正式發布異常，可把 `git.deploymentEnabled` 回到全關閉並移除 `ignoreCommand`；不影響命理核心、資料庫或使用者資料。
