# 域名與正式站

## 當前唯一真相

- 源碼：GitHub `stoneweiwei-dot/zhaowu` → `main`
- 唯一 Production：Vercel `stone-zhaowu-official`
- 正式 URL：`https://stone-zhaowu-official.vercel.app/`
- Canonical／Open Graph／Twitter 分享來源：同上
- Netlify `archive-stone-zhaowu-official`：只保留歷史／相容用途，自動 build 必須保持停用，不是 production。
- `zhaowu.soul-terminal.com`：預留正式子域名；未完成 DNS 前不得取代 Vercel production URL。

## DNS 規則

主站 `soul-terminal.com` 與 `www` 繼續由原 WordPress 使用，不得改動。日後如啟用 `zhaowu.soul-terminal.com`，只新增 `zhaowu` 子域名並在 Vercel 專案內完成 custom domain、DNS 與 TLS 驗證。

## 禁止事項

- 不把 Netlify、AppDeploy、Cloudflare 或任何 preview URL 當 production。
- 不建立第二個 Vercel production project。
- 不把舊 Netlify canonical 寫回 HTML、OAuth callback、分享 metadata 或文件。
- 不在文件寫死 deployment ID；驗收時即時核對 `main` SHA 與 Vercel Production SHA。

項目總狀態以 [CURRENT-STATE.md](./CURRENT-STATE.md) 為準。
