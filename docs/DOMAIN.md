# 域名與正式站

- 正式 URL 與 canonical：`https://zhao-wu.com/`
- Vercel Production project：`stone-zhaowu-official`（唯一正式主機）
- `zhao-wu.com` 已綁定專案，Vercel DNS 與自動 TLS 已驗證；`www.zhao-wu.com` 使用 HTTP 308 跳轉至主域名。
- `stone-zhaowu-official.vercel.app` 保留為同一 Vercel 專案的相容入口，不列為 canonical。
- 大陸訪客端 Supabase 請求須經本網站同源 `/sb/*`；`src/lib/supabase-config.ts` 必須把正式主域名列入代理主機白名單。
- 新增正式網域時，先完成 Vercel domain、DNS 與 TLS 驗證，再更新代理白名單、canonical／Open Graph／Twitter metadata、robots、sitemap、llms 摘要與測試。保留既有入口的相容性。
- 自訂網域可改善入口可達性，但不保證所有中國大陸網路服務商都能連線。
