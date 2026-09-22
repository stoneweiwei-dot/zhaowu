# 昭梧更新報告｜ZW-WEB-2026.09.22-r176

## 本次改動

- Vercel Git deployment 改為 main-only。
- `main` 明確允許自動 Production deployment。
- `*` 其他分支一律禁止自動 deployment，因此 PR／fix／docs 分支不再建立 Preview。
- 保留 r175 IntroGate 首次播放後回訪跳過修復，以及 r174 Supabase fail-open。
- `CURRENT-STATE.md` 不再硬寫固定 main／Production SHA；每次驗收必須即時查 GitHub 與 Vercel。

## 為什麼改

先前為節省免費配額把所有 Git deployment 全關，造成 main 更新後 Production 常停在舊 SHA；之後又必須人工進 Vercel 觸發，反覆形成「代碼已修、正式站沒上」的狀態。

本版改為只有正式 main merge 能建立 Production，所有開發分支零自動部署。這保留零 Preview 的成本控制，同時移除人工 Dashboard 依賴。

## 影響範圍

- Vercel Git deployment policy。
- Production release 流程。
- Release metadata 與 CURRENT governance。

## 受保護範圍

- 不改八字／紫微／西占等計算核心。
- 不改 owner Auth。
- 不改 Payment。
- 不改 Supabase schema／RLS／Storage 物件。
- 不新增 Vercel project、Netlify Production 或其他 runtime SaaS。
- 不重新開啟非 main branch Preview。

## 驗證狀態

- PR 必須通過 Deploy gate、Engine suite、iPhone Safari CI。
- 合併後只允許現有 Vercel `stone-zhaowu-official` 建立一次 Production deployment。
- 必須確認 Production READY 且 Git SHA = 當下 main SHA。
- 真 iPhone Safari 最終驗收仍是 STO-5／STO-20 Done 的必要條件。

## 回滾

如 main-only branch matching 不符合預期，可把 `git.deploymentEnabled` 回到 `false`；不得改用平行 Production 或付費外掛作為回滾方案。
