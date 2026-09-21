# 昭梧更新報告｜ZW-WEB-2026.09.22-r172

## 本次改動

- 唯一正式站的 canonical、Open Graph 與 Twitter metadata 統一回到 Vercel Production。
- 將歷史全域 CSS import 收束到單一 compatibility bundle，保持既有順序與 cascade，不重做視覺。
- 補齊 r172 的正式 release ledger，對應已上線 Production SHA `564dc67a7ca0a48931168912988b9716be94b935`。

## 為什麼改

避免正式 HTML 繼續把搜尋與分享來源指向已歸檔的 Netlify，同時降低歷史 CSS 入口分散造成的維護風險。

## 影響範圍

- `index.html`
- `src/main.tsx`
- `src/legacy-visual-compat.css`
- canonical / OG / Twitter metadata
- release ledger

## 受保護範圍

不修改命理 deterministic calculation truth、報告規則、生辰流程、登入、付款、Supabase schema 或正式站域名策略。

## 驗證狀態

- Production SHA：`564dc67a7ca0a48931168912988b9716be94b935`
- Vercel deployment：`dpl_CMHeN5kEYGGJzzzSz3azsXjF4BTb`
- Vercel state：READY
- Target：Production
- canonical / OG：已驗證指向 Vercel 正式站

## 回滾

可回滾 PR #418；若只需回復 CSS 入口，恢復 `src/main.tsx` 的歷史 import 即可。metadata 回滾時不得重新把 Netlify 設為正式 canonical。
