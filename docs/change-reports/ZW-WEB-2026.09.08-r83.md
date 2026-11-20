# 昭梧更新報告｜ZW-WEB-2026.09.08-r83

## 本次改動

恢復昭梧客戶登入頁的 X 登入入口，使登入方式重新符合目前產品契約：Google、Apple、X、Email＋密碼。

同時更新登入 regression contract，移除舊有「禁止 X」的過期測試，改為明確要求 Google、Apple、X 與 Email 四種入口都存在。

## 為什麼改

實際稽核發現 `src/lib/supabase-rest.ts` 底層早已支援 `twitter` OAuth provider，但 `src/routes/login.tsx` 沒有顯示 X 按鈕，而且既有 regression test 反而把「沒有 X」鎖成正確行為。這與站主目前明確要求的登入契約衝突。

## 影響範圍

- `/login`
- OAuth 登入入口 UI
- `scripts/customer-surface-v3.test.mjs`
- 三語登入文案：繁中／簡中／英文
- 公開 release fallback 更新為 r83

## 保護範圍

本次沒有修改：

- Supabase schema、權限、資料或環境變數
- Google／Apple OAuth callback 邏輯
- Email＋密碼註冊／登入流程
- 八字、紫微、七政、一掌經或其他命理計算
- 付款、報告資料、Owner 權限

## 回滾

如需回滾，恢復 r82 的 `src/routes/login.tsx`、`scripts/customer-surface-v3.test.mjs` 與 `src/lib/site-stats.ts` 即可；不得因此改動其他登入方式、Supabase schema 或使用者資料。

## 驗證狀態

- Source：X 按鈕已接到既有 `startOAuth("twitter")` 路徑。
- Deploy Gate／Engine Suite／iPhone Safari／Production：以 r83 最終 commit 的 CI 與 Vercel Production 驗證結果為準。
- Supabase X provider Dashboard 啟用狀態：未獨立驗證；本次沒有獲授權修改 Supabase 設定或資料。
