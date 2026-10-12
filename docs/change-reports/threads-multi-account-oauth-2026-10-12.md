# Threads 多帳號官方授權

## 結果

- `/social` 與站主後台可重複執行 Threads 官方 OAuth，連接多個帳號。
- 每次發布可勾選一個或多個 Threads 帳號，並逐帳號顯示成功／失敗。
- 長效使用者令牌在 Vercel 端加密後才送往 Supabase，資料表只允許 `service_role` 存取。
- OAuth state 使用 HMAC、短效 HttpOnly SameSite=Lax cookie 與站主登入共同驗證。

## 成本與故障邊界

- 使用現有 Vercel Production、Meta Threads API 與既有 Supabase Pro，沒有新增月費平台。
- 不新增 Vercel Function，沿用 `api/owner-session.js`，維持目前 Function 數量上限。
- Meta 或 Supabase 暫時不可用時，只影響社群連接／發布，不影響公開網站與核心命盤。
- 回滾時可移除 OAuth UI 與三個 `social.threads.*` bridge action；帳號表可保留以免令牌資料被誤刪。
