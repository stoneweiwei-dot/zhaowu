# 昭梧更新報告｜ZW-WEB-2026.09.18-r145

## 本次改動

- 恢復首頁 Header 右上方可見的「站主登入」入口。
- 該入口只連到既有 `/login` 站主登入頁，不恢復一般使用者帳號登入或註冊。
- 一般訪客仍維持 guest-first／裝置本地流程，不需要登入即可填寫出生資料與使用免費分析。
- 站主登入後原有 `/account`、`/gallery` 與登出控制維持不變。
- 新增契約測試，避免日後再次把站主入口從公開 Header 誤刪。

## 為什麼改

r144 將一般使用者登入入口移除時，公開 Header 也失去了站主可見入口。站主帳號與獨立登入路徑本身仍存在，但主站沒有可發現的入口，造成實際操作不便。本版只恢復站主入口，不重新引入會員登入。

## 影響範圍

- 公開主站 Header 的未登入狀態。
- `/login` 的可發現性。
- guest-first 登入邊界的回歸測試。
- 公開 release metadata。

## 受保護範圍

- 不修改站主密鑰、Hash、環境變數或任何登入憑證。
- 不把站主密鑰寫進 GitHub、前端 bundle 或 localStorage。
- 不修改 `/api/owner-login`、HttpOnly Cookie、安全比較或 Owner Console 權限。
- 不恢復一般使用者登入／註冊。
- 不修改命理引擎、D60、報告內容、付款或 Supabase schema。

## 驗證狀態

- 站主入口使用獨立 `zhaowu-header-owner-login` class，避開 r144 對舊一般登入 CTA 的隱藏規則。
- CI 必須通過 Deploy gate、Engine suite 與 iPhone Safari 後才可視為可合併。
- 合併後仍需核對 Vercel Production exact SHA 與首頁實際可見入口。

## 回滾

回滾本版 SiteShell 的未登入 owner link、r145 release metadata、契約測試與本報告即可；不需要變更任何站主帳號、Cookie 或後端資料。
