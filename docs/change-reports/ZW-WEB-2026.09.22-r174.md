# 昭梧更新報告｜ZW-WEB-2026.09.22-r174

## 本次改動

- 公開站啟動流程不再把 Supabase 可用性視為必要條件。
- 公開訪問統計加入 900ms timeout 與 5 分鐘冷卻；遇到 402／網路錯誤時直接使用 release fallback。
- Bootstrap 資料模型檢查改為 fail-open；命理核心、報告組裝與本地內容仍必須正常暖機。
- 為本次 Production recovery 暫時開啟 Vercel Git deployment；Production READY 後立即以後續 lock commit 關回。

## 為什麼改

Supabase organization 因 File Storage 超過 Free quota 被限制，Storage／Edge／公開 REST 可能回 402。昭梧的公開核心命盤與問答本來已是 client-safe deterministic runtime，不應讓可選的資料持久層拖住首頁或啟動。

## 影響範圍

- 首頁啟動與 release/status strip。
- 公開 visit stats。
- Supabase restricted 時的降級行為。
- 本輪 Vercel Production cutover。

## 受保護範圍

- 不改八字／紫微／西占等計算核心。
- 不改 Owner Auth。
- 不改 Payment。
- 不改 Supabase schema／RLS／資料內容。
- 不刪 Supabase Storage 物件。
- 不新增第二個 Production 專案。

## 驗證狀態

- Production CI：Engine suite、Deploy gate、iPhone Safari 必須全綠後才可合併。
- Production：合併後必須確認 Vercel READY 且 SHA = main。
- 自動部署：完成 Production cutover 後必須重新關閉。

## 回滾

若 r174 造成公開站回歸，可回滾至 r173 程式行為；Supabase 資料與 schema 本輪沒有變更。
