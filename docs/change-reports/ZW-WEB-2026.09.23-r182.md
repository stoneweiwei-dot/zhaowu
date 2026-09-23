# 昭梧更新報告｜ZW-WEB-2026.09.23-r182

## 本次改動

- 只調整 `/login` 站主登入視覺；公開首頁、報告與其他 route 不新增動畫。
- 登入頁改為全屏動態主視覺，讓影片本身成為主畫面；登入表單退到底部輕量半透明紙感層。
- 手機優先降低卡片厚重感：品牌標記縮小、標題與欄位收斂、登入按鈕維持 50px 高度、safe-area 保留。
- 背景加入極慢幅度漂移與底部漸層保護，可讀性不再靠大面積不透明卡片。
- 夜模式提供獨立深色紙感層；`prefers-reduced-motion` 會停用漂移與入場動畫。
- 保留既有 LoginStageBackdrop、站主密碼、owner cookie、聲音開關與影片 fallback。

## 為什麼改

目前登入頁的置中米色卡片面積較大，會直接壓住動態素材的主體，視覺容易像一般後台登入框。這次把動態素材提升為真正的舞台，登入操作只佔據下方必要區域，讓畫面更沉浸但不犧牲可讀性。

## 影響範圍

- `src/routes/login.tsx`
- `src/zhaowu-design-system.css`
- release ledger 與登入視覺回歸測試。

## 受保護範圍

- 不改 owner auth API、cookie、session restore、密碼規則。
- 不改八字／報告／付款／Supabase schema。
- 不恢復公開 Email／OAuth／註冊入口。
- 不恢復全站 IntroGate；動畫仍只屬於 `/login`。
- 不解除 r181 Supabase Storage 寫入凍結，因此本次不把新影片寫入超額 Storage。
- 不新增外部訪客 runtime 依賴。

## 驗證狀態

- PR 必須通過 Deploy gate、Engine suite 與 iPhone Safari。
- 視覺驗收需確認 390px iPhone 寬度無橫向 overflow，登入欄位 >=16px、主要操作 >=44px。
- 合併後正式完成仍要求 Vercel Production SHA = current main SHA，並實際檢查 `/login`。

## 回滾

如新版登入層造成可讀性或手機鍵盤問題，只回滾 r182 的登入 scoped CSS 與 footer markup；不需回滾 auth、Storage policy 或其他產品流程。
