# 昭梧更新報告｜ZW-WEB-2026.09.13-r119

## 本次改動
取消普通用戶登入與註冊入口；`/login` 改為站主專用 Email＋密碼入口。AuthProvider 僅接受 `profiles.is_owner=true` 的 session，既有非站主 session 會清除。Header 保留唯一站主登入入口，`/account` 未登入狀態也只顯示站主後台入口。

## 為什麼改
站主 2026-09-13 明確授權：取消所有用戶登入選項，只保留站主登入。此指令取代 r116「直接 /login 與已登入一般帳戶維持」口徑。

## 影響範圍
登入頁、前端 session 恢復、Header 站主登入入口、`/account` 未登入狀態、發布版本與 PWA cache。

## 保護範圍
不改 Supabase schema、RLS、資料或環境變數；不改付款、報告、命理計算。保留站主 `is_owner` 權限與後台能力。

## 驗證
需通過 Deploy gate、engine suite、build/typecheck，以及 Production `/`、`/login`、`/account` 與 iPhone Safari 相關驗收。

## 回滾
回滾 r119 會恢復普通會員登入／註冊與既有非 Owner session 接受行為；除非站主撤銷本指令，否則不應回滾。
