# 昭梧更新報告｜ZW-WEB-2026.09.15-r141

## 本次改動

本次只收斂登入／註冊，不改命理、報告、支付、音樂或站主權限。

### 會員登入只留 Email＋密碼
- `/login` 移除 Google、Apple、X 三組社交登入按鈕與 OAuth 啟動邏輯。
- 舊會員沿用原本已註冊的 Email＋密碼；登入不套用新註冊的 8 位密碼門檻。
- 新會員仍可 Email＋密碼註冊。若 Supabase 要求信箱驗證，畫面明確提示先完成驗證，再用同一組 Email＋密碼登入；若註冊直接回傳 session，直接進入帳戶。
- `/auth/callback` 保留，供 Email 驗證回站使用；不能因移除社交登入而刪掉。

### 站主登入維持獨立
- 站主仍走 Vercel owner cookie／owner key，不走 Supabase Auth。
- 會員永遠不因 `profiles.is_owner` 變成站主。

### 修正錯誤訊息
- 正式站實測：會員 Email 登入提交後，Supabase Auth 目前仍回 spend-cap／egress quota 限制；舊畫面卻錯寫成「站主登入暫時無法使用」。
- r141 在會員畫面改成會員專用說明，明確指出不是 Email／密碼錯誤，且站主登入走獨立路徑。
- 這個程式修正不會解除 Supabase 的實際帳務／額度限制；解除 spend cap 屬 Supabase Billing 設定，可能改變費用，不能由前端假裝修復。

## 為什麼改

站主最新明確要求會員入口不要再提供 Google／Apple／X，只保留既有 Email 帳號登入與 Email 註冊。現行 Production 仍展示三組社交登入，且會員提交 Email 登入後，把 Supabase 額度錯誤誤寫成「站主登入暫時無法使用」，與已上線的獨立站主登入架構相衝突。r141 只替換這兩個衝突部分，不重做整套認證。

## 影響範圍

- `src/routes/login.tsx`：會員 Email 登入／註冊 UI、錯誤與驗證提示。
- `scripts/r139-home-d60-auth.test.mjs`：Email-only 會員認證契約。
- `scripts/sto17-ui-contract.test.mjs`：移除舊 OAuth UI 強制契約。
- `scripts/release-ledger.test.mjs`：r141 release ledger。
- `src/lib/site-stats.ts`：公開版本升至 r141／141。
- `public/sw.js`：PWA cache 升至 `zhaowu-shell-r141`，避免手機沿用舊登入殼。

## 受保護範圍

- 不改 Supabase 使用者資料、密碼雜湊、資料表 schema、RLS、Storage。
- 不改站主 key／owner cookie／owner API。
- 不改八字、紫微、D60、西洋占星與任何命理計算。
- 不改報告生成、付費、音樂、首頁生辰或客戶資料保存。
- `/auth/callback` 保留給 Email 驗證流程使用。

## 驗收契約

- `/login` 不得出現 `Google`／`Apple`／`X` 社交登入按鈕。
- 會員登入只接受 Email＋密碼；舊密碼不因長度小於 8 被前端擋掉。
- 新註冊必須正確處理「立即 session」與「等待 Email 驗證」兩種 Supabase 回應。
- 登入全螢幕動畫、站主獨立登入與本機生辰保存行為保持不變。
- PWA cache 更新為 `zhaowu-shell-r141`，避免手機繼續看到舊登入畫面。

## 驗證狀態

- 修改已進 PR #353，等待最新 Production CI 的 Deploy gate、Engine suite、iPhone Safari 三項全部通過後才能合併。
- 合併後必須驗證 Vercel Production `/login` 實際已移除 Google／Apple／X，並核對正式站顯示新的會員額度錯誤文案。
- 即使 UI／程式驗證通過，真實會員 Auth 仍需 Supabase Auth endpoint 恢復服務後才能完成端到端登入驗證。

## 目前外部阻塞

截至 2026-09-15 11:17 AEST，Production 的會員 Auth 實際請求仍被 Supabase spend cap／egress quota 拒絕。Supabase 專案管理狀態雖顯示 `ACTIVE_HEALTHY`，但 Auth endpoint 實際仍受額度限制；兩者不是同一層狀態。要讓真實會員登入恢復，仍需解除 Supabase 的帳務／額度限制，或另行遷移會員 Auth。

## 回滾

還原本 release commits，並把 `src/lib/site-stats.ts` 與 `public/sw.js` 回到 r140。回滾會重新顯示 Google／Apple／X 與舊的錯誤文案，不建議。
