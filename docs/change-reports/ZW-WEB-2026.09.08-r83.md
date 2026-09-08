# ZW-WEB-2026.09.08-r83

## 變更

恢復昭梧客戶登入頁的 X 登入入口，使登入方式重新符合目前產品契約：Google、Apple、X、Email＋密碼。

同時更新 `scripts/customer-surface-v3.test.mjs`，移除舊有「禁止 X」的過期測試，改為明確要求 Google、Apple、X 與 Email 四種入口都存在。

## 原因

實際稽核發現 `src/lib/supabase-rest.ts` 底層早已支援 `twitter` OAuth provider，但 `src/routes/login.tsx` 沒有顯示 X 按鈕，而且既有 regression test 反而把「沒有 X」鎖成正確行為。這與站主目前明確要求的登入契約衝突。

## 影響範圍

- `/login`
- OAuth 登入入口 UI
- 登入 regression contract test
- 三語登入文案：繁中／簡中／英文

## 保護範圍

本次沒有修改：

- Supabase schema、權限、資料或環境變數
- Google／Apple OAuth callback 邏輯
- Email＋密碼註冊／登入流程
- 八字、紫微、七政、一掌經或其他命理計算
- 付款、報告資料、Owner 權限

## 回滾

如 X OAuth provider 在外部 Supabase Dashboard 尚未啟用，可回滾本 release 的登入 UI 與測試 commit；不得因此改動其他登入方式或資料庫設定。

## 驗證狀態

- Source：X 按鈕已接到既有 `startOAuth("twitter")` 路徑。
- Deploy Gate：待 r83 最終 commit 驗證。
- Engine Suite：待 r83 最終 commit 驗證。
- iPhone Safari：待 r83 最終 commit 驗證。
- Production：待 r83 最終 commit 與 Vercel Production SHA 對齊後驗證。
- Supabase X provider Dashboard 啟用狀態：未驗證；本次沒有獲授權修改 Supabase 設定或資料。
