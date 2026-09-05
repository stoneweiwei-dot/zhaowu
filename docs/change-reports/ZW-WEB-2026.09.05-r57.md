# 昭梧更新報告｜ZW-WEB-2026.09.05-r57

日期：2026-09-05 AEST

## 本次改動

- 修正 r56 後站主仍看不到「背景音樂管理」入口的實際可見性問題。
- 保留既有 `AuthProvider` 內掛載與 `is_owner` 權限，不修改任何會員或站主身份。
- 將背景音樂管理入口直接 portal 到 `/account` 最上方站主資訊卡，改成全寬清楚可見的「背景音樂管理」區塊。
- 支援 `/account` 與 `/account/`。
- 若頁面 DOM 插槽暫時未建立，提供高層級固定入口備援，避免 iPhone safe-area、底部浮層或其他固定元件遮蔽。
- 管理對話框提高至 z-[100]，保留上傳、本地 AAC-LC / MP3 轉碼、Supabase Storage、切換與刪除流程。

## 為什麼改

r56 解決了 React Auth Context 邊界錯誤，但管理入口仍是一個獨立的右下角 fixed 小按鈕。站主真實 iPhone 回報仍不可見，因此不能把「元件有 render」等同「使用者看得到」。Supabase 檢查確認 SDW 站主 profile 已正確為 `is_owner=true`，而另一位最新登入會員仍是非 owner；本次禁止用錯誤方式把一般會員升權。故根因收斂到前端入口呈現層，而不是 owner 權限資料。

## 影響範圍

- `src/components/owner-background-music-manager.tsx`
- `scripts/background-music.test.mjs`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- `docs/change-reports/ZW-WEB-2026.09.05-r57.md`

未修改首頁 r55 視覺、一般會員權限、Supabase schema、音樂資料列、命理計算、登入、報告、付款或其他路由。

## 驗證要求

- deterministic / contract tests 必須 PASS。
- TypeScript 必須 PASS。
- Production build 必須 PASS。
- iPhone Safari regression 必須 PASS。
- Vercel Production `githubCommitSha` 必須等於 merge 後 `main` HEAD。
- `/`、`/login`、`/account` 必須 PASS。
- 真實站主 iPhone 的最終可見性仍以 Stone 實際看到為準；未取得該確認前不得聲稱已做 physical visual verification。

## 回滾

如 r57 造成未知前端回歸，只回滾本次入口呈現改動；不得回滾 r52 可播放音樂資產、r56 AuthProvider 修正或任何既有站主權限資料。
