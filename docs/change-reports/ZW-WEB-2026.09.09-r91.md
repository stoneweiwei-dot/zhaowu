# 昭梧更新報告｜ZW-WEB-2026.09.09-r91

## 本次改動
- 登入頁移除 Google、Apple、X 三個第三方 OAuth 按鈕與相關前台文案。
- 客戶登入畫面只保留 Email＋密碼表單；原有 Email 註冊／登入流程不改資料結構。
- 保留既有 OAuth callback capture 作為舊流程相容性，避免已在外部登入流程中的舊 session 被卡住，但不再向客戶提供任何第三方登入入口。
- 更新登入 regression contract，明確禁止 login route 再出現 `onOAuth`、`startOAuth`、provider 按鈕或 OAuth 文案。
- 公開版本更新至 r91。

## 為什麼改
- 站主最新明確要求登入畫面取消 X、Google 等第三方登入，只讓使用者填寫自己的 Email＋密碼。
- 這條新指令取代 r83 恢復 X 登入以及 CURRENT-STATE 中「Google、Apple、X、Email＋密碼」的舊前台登入契約。
- 為避免為了移除 UI 而破壞正在進行的舊 OAuth redirect，底層 callback 相容處理保留，但不再屬於客戶可選登入方式。

## 影響範圍
- `src/routes/login.tsx`
- `scripts/customer-surface-v3.test.mjs`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- `docs/CURRENT-STATE.md`
- `docs/change-reports/ZW-WEB-2026.09.09-r91.md`
- 不修改 Supabase schema、RLS、帳號資料、密碼資料、Email 驗證設定、Owner 權限、命理引擎、付款或報告資料。

## 保護範圍
- 已存在的 Email＋密碼登入與 Email 註冊仍使用原 Supabase Auth 流程。
- 不刪除底層 OAuth provider type 或歷史 callback 支援，避免影響舊 session 相容性；只是從前台 active path 移除第三方入口。

## 回滾
- 回滾 r91 即可恢復 r90 的第三方 OAuth 按鈕；不涉及資料庫 schema rollback。

## 驗證狀態
- Source：待最終 commit 確認。
- Deploy Gate：待最終 commit 驗證。
- Engine Suite：待最終 commit 驗證。
- iPhone Safari：待最終 commit 驗證。
- Production：待最終 commit 與 Vercel Production SHA 對齊後驗證。
