# 域名與正式站

## 當前唯一真相

- 源碼：GitHub `stoneweiwei-dot/zhaowu` → `main`
- 唯一 Production：Vercel `stone-zhaowu-official`
- 正式 URL：`https://stone-zhaowu-official.vercel.app/`
- Canonical／Open Graph／Twitter 分享來源：同上
- Netlify `archive-stone-zhaowu-official`：archive／compatibility only；自動 build 必須保持停用，不是 Production。

## DNS 規則

目前本項目沒有自定義域名。站主若日後另行指定域名，才依下列步驟新增：在 Vercel `stone-zhaowu-official` 完成 custom domain、DNS 與 TLS 驗證，並由站主提供 DNS 權限。

## 禁止事項

- 不把 Netlify、AppDeploy、Cloudflare 或任何 preview URL 當 Production。
- 不建立第二個 Vercel production project。
- 不把舊 Netlify canonical 寫回 HTML、OAuth callback、分享 metadata 或文件。
- 不在文件寫死 deployment ID；驗收時即時核對 `main` SHA 與 Vercel Production SHA。

項目總狀態以 [CURRENT-STATE.md](./CURRENT-STATE.md) 為準。
