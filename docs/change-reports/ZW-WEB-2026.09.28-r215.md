# 昭梧更新報告｜ZW-WEB-2026.09.28-r215

## 本次改動

- 修復大檔（>6MB）續傳上傳（TUS resumable，涵蓋登入影片與圖庫圖片）在 Supabase Storage 回傳 `403 new row violates row-level security policy` 的問題。
- `src/lib/owner-data-client.ts`：`authorization` 標頭改帶有效 Supabase JWT（此處為 anon key `SUPABASE_KEY`），signed-upload token 只放在既有的 `x-signature` 標頭。
- 同步更新 `scripts/r181-storage-freeze.test.mjs`、`scripts/r162-production-closeout.test.mjs`、`scripts/release-ledger.test.mjs` 與 `lib/zhaowu-verification.js` 的對應斷言與版本號。

## 為什麼改

r194 導入 6MB 以上檔案走 TUS resumable 上傳後，`authorization` 標頭被設成 `Bearer ${signedUploadToken}`——但 Supabase Storage 的 resumable 端點以 `authorization` 驗證呼叫方身分（需要合法 JWT），並以 `x-signature` 驗證這次簽名上傳授權的是哪個物件／路徑。signed-upload token 不是 JWT，放進 `authorization` 會被 RLS 驗證直接拒絕，導致站主上傳登入影片或圖庫大圖時全部失敗。修法是把 anon key（合法 JWT）放回 `authorization`，token 維持在 `x-signature`。

此問題與修法方向先前已在 PR #499（`fix/r213-tus-upload-auth-header`）驗證過，三項 CI（Deploy gate、Engine suite、iPhone Safari）皆綠；因主分支同時間已用掉 r213／r214 兩個版號做另一件事（`/api/owner-music` 讀寫拆分），該分支與目前 main 產生版號衝突而未能合併。本次在最新 main 上重新套用同一段程式修正，版號順延為 r215，內容與原 PR 的技術修法一致。

## 影響範圍

- 站主後台「登入動畫管理」與「圖庫管理」對 >6MB 檔案的上傳流程。
- `scripts/r181-storage-freeze.test.mjs` 對授權標頭內容的回歸斷言。
- 公開頁尾版本號與 `/release.json`。

## 受保護範圍

- 不改簽名上傳票證（`uploadTicket`）簽發、`signedUrl` PUT 小檔路徑（≤6MB）、Storage bucket 權限、RLS policy 本身。
- 不改 Supabase schema、Auth、Payment。
- 不改命理 deterministic calculation、R6.2.2、報告邏輯。
- 不改 r213／r214 已完成的 `/api/owner-music` 讀寫拆分。

## 驗證狀態

- 本地：`node --test` 對本次修改之測試檔（`r181-storage-freeze`、`r162-production-closeout`、`release-ledger`）語法與斷言已核對一致；此沙盒的 `npm ci` 因 registry 網路白名單阻擋（`registry.npmjs.org` 403 `host_not_allowed`）未能安裝依賴以實際執行 `node --test`，此為本次修復在本沙盒內唯一未完成的本地驗證項，需靠 GitHub Actions（Deploy gate / Engine suite）與 Vercel 正式 build 補上。
- 合併後必須確認：GitHub Actions 三項 CI 全綠、Vercel Production SHA 等於本次 commit、`/release.json` 顯示 r215。
- 正式環境驗證：需站主實際上傳一個 >6MB 的登入影片或圖庫圖片，確認不再出現 403 RLS 錯誤。
- Production 驗證完成後才寫入 Supabase `release_history` r215。

## 回滾

回滾本次改動即可恢復 r214 行為（大檔續傳上傳仍會 403，非資料遺失風險）；不涉及資料庫 migration 或 Storage 內容變更。
