# 昭梧更新報告｜ZW-WEB-2026.09.23-r179

## 本次改動

- 從 `src/routes/__root.tsx` 移除全站 `IntroGate` 掛載。
- 首頁、重新整理、回訪、完整報告與其他一般路由不再播放 opening／loading 動畫。
- `/login` 的 `LoginStageBackdrop` 保留，成為唯一 active 登入動畫入口；影片／圖片 fallback 與手勢開聲控制保持。
- iPhone Safari 與 Node contract 改為驗證「首頁沒有 IntroGate、登入頁有登入動畫」。
- CURRENT-STATE、Instruction Registry 與 release metadata 同步到 r179。

## 為什麼改

站主明確要求：登入動畫只能出現在登入頁，除此之外任何時間都不要再出現。r175 的全站首訪 IntroGate 與這個新要求衝突，因此依最新指令只撤掉 active route tree 掛載，不破壞登入頁本身的動畫能力。

## 影響範圍

- `src/routes/__root.tsx`
- `src/routes/login.tsx`（保留既有登入動畫，不改登入邏輯）
- `scripts/intro-loading.test.mjs`
- `scripts/r168-intro-sound-control.test.mjs`
- `scripts/r161-home-clarity-auth-audio.test.mjs`
- `e2e/loading-gate.iphone-safari.spec.ts`
- CURRENT-STATE／Instruction Registry／release metadata。

## 受保護範圍

- 不改站主 cookie、owner login API 或 session restore。
- 不改命理計算、報告、付款、Supabase schema、Storage 或使用者資料。
- 舊 IntroGate 元件、policy 與媒體檔保留作歷史／回歸素材，但不再進入公開 runtime。
- 不新增任何外部 runtime 依賴。

## 成本與配額

- 純 route 掛載、QA 與文件調整；無新增 Storage、資料庫、第三方 API 或付費服務。
- 分支不應作正式 Production；通過 CI 後合併 main，使用單一 Production release。

## 驗證狀態

- 合併前：Deploy gate、Engine suite、iPhone Safari 必須全部通過。
- 合併後：Vercel Production SHA 必須等於 main SHA。
- Production 驗證：首頁 200；正式 bundle 的 active route tree 不含 IntroGate；登入 route bundle 仍含 LoginStageBackdrop／登入動畫資產與聲音控制。

## 回滾

如登入頁動畫因本次 route 調整異常，可只回滾 `__root.tsx` 的掛載範圍與對應 QA；登入 API、cookie 與資料層不需回滾。
