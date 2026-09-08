# 昭梧更新報告｜ZW-WEB-2026.09.09-r89

## 本次改動
- 恢復站主先前確認的登入頁視覺基準：宋式山水背景、米色宣紙、半透明內容面板、細金邊與朱紅主按鈕。
- 在登入面板重新顯示昭梧正式 BrandSeal 與「昭梧 / ZHAOWU」品牌識別，不再只剩通用帳戶標題。
- 保留 Google、Apple、X、Email + 密碼四種既有登入方式與原本 Supabase Auth 呼叫，未更改登入權限或 OAuth callback。
- 新增只作用於 `.zhaowu-login-shell` 的 r89 視覺覆寫，避免舊 v41 純宣紙／青玉主按鈕規則再次覆蓋登入定稿；其他頁面繼續由現行 canonical design system 管理。
- 新增 UI contract，鎖定正式 Logo、`/wallpaper-song.jpg`、四種登入路徑與手機 Safari 安全的 `background-attachment: scroll`。
- 公開版本號更新至 r89。

## 為什麼改
- 目前程式仍有後期 v41 登入規則，明確把登入頁改成純宣紙背景、不透明面板與青玉綠主按鈕，與站主已確認的宋式山水登入版式衝突。
- 本次依最新站主要求恢復既有定稿，而不是另做一套新登入設計。

## 影響範圍
- `src/routes/login.tsx`
- `src/login-approved-r89.css`
- `src/main.tsx`
- `src/lib/site-stats.ts`
- `scripts/sto17-ui-contract.test.mjs`
- `scripts/release-ledger.test.mjs`
- `docs/change-reports/ZW-WEB-2026.09.09-r89.md`
- 使用既有 `public/wallpaper-song.jpg` 與 BrandSeal，不新增圖片資產。
- 不修改 Supabase schema、資料表、Auth provider 設定、權限、OAuth callback、付款、報告、命理引擎、D60 計算或生命靈數邏輯。

## 回滾
- 回滾本次單一提交即可恢復 r88；不涉及資料庫 schema rollback。
- 若已寫入 `release_history` 的 r89 紀錄，可在回滾正式站時同步移除該單筆版本紀錄。

## 驗證要求
- GitHub build / TypeScript / deploy gate 必須通過。
- iPhone Safari gate 必須通過。
- Vercel Production 必須為本提交 SHA 且狀態 `READY`。
- 正式 `/login` 與 `/wallpaper-song.jpg` 必須可讀；Production runtime errors 不得出現新增錯誤。
