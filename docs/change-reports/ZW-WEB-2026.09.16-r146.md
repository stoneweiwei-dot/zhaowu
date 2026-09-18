# 昭梧更新報告｜ZW-WEB-2026.09.16-r146

## 本次改動

- 新增站主資料橋接：既有 `__Host-zhaowu_owner_session` HttpOnly cookie 先由 Vercel `/api/owner-data` 驗證，再由該 server API 呼叫 Supabase `zhaowu-owner-data` server function。
- `/account` 與 `/gallery` 在站主 cookie 已成立時取得一個不含任何 Supabase 憑證的 sentinel session；資料模組看到 sentinel 後改走 server bridge，不再要求瀏覽器 Supabase Auth session。
- 站主報告讀取／刪除、首頁背景管理、圖庫管理與命誥圖查看／Gallery-direct 生成均有 server-side Supabase 路徑。
- 背景與圖庫上傳改由 Supabase server function 簽發短效 signed upload URL；檔案直接傳 Storage，service-role key 不進瀏覽器，也不經 Vercel Function 承載大檔案。
- 新增 r146 deploy contract，鎖住 owner-cookie、same-origin、雙重 owner credential 驗證與 service-role server-only 邊界。

## 為什麼改

r144 已把一般訪客恢復為手機／瀏覽器本地 guest-first，並把站主登入獨立為 HttpOnly cookie；但既有後台資料元件仍要求 Supabase Auth `access_token`，導致站主雖已登入，`/account` 仍無法讀取完整 Supabase 後台資料。r146 只補上這條 server-side 資料通道，不把會員登入帶回來。

## 影響範圍

- `api/owner-data.js`
- `src/lib/auth/use-current-user.ts` 與 owner data sentinel client
- report/background/gallery/decree 的 owner bridge modules
- `supabase/functions/zhaowu-owner-data/index.ts`
- Vercel Function 註冊、r146 release ledger 與 deploy contract

## 受保護範圍

- 子平／R6.2.1／P2 命理 runtime 不修改。
- D60、紫微、其他術數與報告推演邏輯不修改。
- 付款、Stripe、付費權限與 customer paid-report flow 不修改。
- r144 guest-first 不修改：一般訪客仍沒有公開會員登入；出生資料仍留在裝置；不使用 IP 當身份。
- owner cookie 名稱、SHA-256 驗證值、HttpOnly、Secure、SameSite=Strict 契約不修改。
- Supabase schema、RLS policy、資料表與既有 Storage 原始資料不做 DDL 或破壞性遷移。
- service-role key 只存在 Supabase server function runtime，不寫入瀏覽器 bundle、GitHub 原始碼或 Vercel client env。

## 驗證狀態

- GitHub PR CI：待 PR 建立後執行 deploy gate／engine suite／iPhone Safari。
- Supabase `zhaowu-owner-data`：需以 `verify_jwt=false` 部署，因為函式採自訂雙重 server bridge header + owner secret hash 驗證；未通過自訂驗證即 401/403。
- Vercel Production：本 PR 階段不部署；維持 r145 Production，待 CI 全綠後再決定 merge 與唯一一次 Production。
- `public.release_history`：依發布規則，僅在 r146 正式 Production 驗證成功後寫入，不在 PR 階段提前宣告上線。

## 回滾

- GitHub：revert r146 PR merge 即可恢復 r145 前端／Vercel server API 行為。
- Supabase：`zhaowu-owner-data` 是新增 server function，r145 不會呼叫它；若需要回滾，可停用／移除該函式而不影響既有資料表與 Storage。
- 不需要資料庫 schema 回滾。
