# 昭梧更新報告｜ZW-WEB-2026.09.23-r183

## 本次改動

- 只調整 `/login` 站主登入視覺；首頁、報告與其他 route 不新增動畫。
- 登入頁改為全屏動態主視覺，登入操作退到底部半透明紙感層，減少舊版置中卡片對影片主體的遮擋。
- 手機優先：表單控制保持 16px 以上、主按鈕 50px、聲音控制 44px，並保留 safe-area。
- 背景加入極慢幅度漂移與底部漸層，讓畫面更有呼吸感但不靠強烈粒子、霓虹或額外特效。
- 夜模式使用獨立深色紙感層；`prefers-reduced-motion` 會停用背景漂移與登入層入場動畫。
- 將兩行底部簽名／返回首頁整理為一個安靜的 footer，降低後台表單感。

## 為什麼改

原登入頁的置中米色卡片面積較大，動態素材被壓在背景，視覺更像一般管理後台。新版讓影片本身成為舞台，登入只是下方必要操作層，提升沉浸感與層次，同時保留可讀性。

## 影響範圍

- `src/routes/login.tsx`
- `src/zhaowu-design-system.css`
- release ledger 與登入視覺回歸測試。

## 受保護範圍

- 不改 owner auth API、cookie、session restore、密碼規則。
- 不改八字／報告／付款／Supabase schema。
- 不恢復公開 Email／OAuth／註冊入口。
- 不恢復全站 IntroGate；動畫仍只屬於 `/login`。
- 不解除 r181 Supabase Storage 寫入凍結。
- r182 修仙命格靈測與本機 9:16 命測圖保持不變。
- 不新增外部訪客 runtime 必要依賴。

## 驗證狀態

- PR 必須通過 Deploy gate、Engine suite 與 iPhone Safari。
- iPhone 驗收需確認無橫向 overflow、表單不觸發 Safari auto-zoom、主要操作不低於 44px。
- 合併後仍需 Vercel Production SHA = current main，並實際檢查正式 `/login`。

## 回滾

若新版登入層造成手機鍵盤、可讀性或視覺遮擋問題，只回滾 r183 scoped CSS 與 footer markup；不需回滾 auth、Storage policy、r182 趣味測驗或其他產品流程。
