# 昭梧更新報告｜ZW-WEB-2026.09.13-r127

## 本次改動
站主登入完全脫離 Supabase Auth。新增 Vercel Serverless `/api/owner-login`、`/api/owner-session`、`/api/owner-logout`；成功登入後使用 HttpOnly + Secure + SameSite=Strict Owner Cookie。登入頁只保留站主密碼，不再要求 Email，也不呼叫 Supabase Auth。

## 為什麼改
此版本明確取代 r126「站主登入仍走 Supabase Auth」的登入依賴。

Supabase 目前可出現 402 egress quota／spend cap，原本會連站主入口一起封死。站主已明確要求：即使 Supabase Auth 不可用，也必須能進入 Owner Console。

## 影響範圍
`/login`、全站 AuthProvider、Header 登出、`/account` 站主身份 gate、PWA cache 與發布版本。普通訪客與免費分析不受影響。

## 安全邊界
repo 只保存高熵站主密碼的 SHA-256 verifier，不保存明碼。真正站主密碼只由站主持有，登入後只存在 HttpOnly/Secure Cookie；前端 JavaScript 無法讀取。未修改 Supabase schema、RLS、資料或權限。

## Supabase 資料狀態
本次只解除「站主登入」對 Supabase Auth 的依賴。報告、圖庫、背景等資料面板仍依賴 Supabase；目前 402 egress quota 未解除前，Owner Console 會明確標示資料服務暫停。

## 驗證
Deploy gate、engine suite、build/typecheck、Production SHA 對齊，以及正式站未登入／錯誤密碼／正確站主密碼／登出流程。

## 回滾
回滾 r127 會恢復 Supabase Auth 作為站主登入依賴；除非站主撤銷本指令，否則不應回滾。
