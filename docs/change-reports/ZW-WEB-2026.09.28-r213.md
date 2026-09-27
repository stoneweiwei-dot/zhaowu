# 昭梧更新報告｜ZW-WEB-2026.09.28-r213

**發佈日期:** 2026-09-28 01:25 UTC+10
**累計更新:** 213

---

## 本次改動

### 修復：登入影片／圖庫大檔上傳 403 RLS 失敗

`src/lib/owner-data-client.ts` 中 `uploadOwnerSignedFile` 對於超過 6MB 的檔案（登入影片、圖庫素材等）改走 Supabase Storage 的 TUS resumable 續傳協定。此路徑先前對 Supabase Storage 的授權標頭配置錯誤：

- **錯誤**：`authorization: Bearer <signed-upload-token>`（把一次性簽名 token 當作一般 JWT 放進 authorization）
- **正確**：`authorization: Bearer <anon key>`（authorization 必須帶有效 Supabase JWT；此處無使用者 session，以 anon key 頂替）＋`x-signature: <signed-upload-token>`（簽名 token 的正確承載位置，授權該次上傳所對應的特定物件路徑）

Storage API 對 `authorization` 的值會嘗試以 JWT 驗證身份以套用 RLS，簽名 token 本身不是通用 JWT，因而每次都被判定為未授權寫入，回傳「new row violates row-level security policy」403。此問題此前已有一次修復嘗試（PR #475，2026-09-26 合併），但該次修復方向本身有誤（把 token 放進 authorization 而非 x-signature），未解決問題。`scripts/r181-storage-freeze.test.mjs` 甚至把那個錯誤寫法釘成了契約，本次一併修正該測試斷言。

### 版本編號說明

此改動送出流程中連續四度撞號（r207/r208/r209/r212 依序被其他併行工作階段用掉），皆因多個工作階段同時對 main 推進所致，非本次改動本身造成。最終定案 r213。

---

## 為什麼改

站主回報：登入動畫管理後台上傳新的登入影片時，於「上傳登入影片」步驟卡在 `POST .../storage/v1/upload/resumable` 回傳 403，錯誤訊息為 `new row violates row-level security policy`，導致新影片無法上傳。內建蓮開／飛升影片仍在靜態目錄中，未被刪除，僅新上傳流程本身故障。

---

## 影響範圍

### ✅ 修復
- 登入影片、圖庫素材（>6MB）的續傳上傳流程恢復可用
- 不影響 ≤6MB 的直接簽名 PUT 上傳路徑（原本即正常）

### ✓ 非影響區域
- BaZi/紫微計算引擎、報告生成契約、auth/owner 權限、Supabase schema、支付、路由
- CSS／排版／色彩系統本次不變更
- 內建登入影片靜態素材（`public/intro/*.mp4`）未變動，持續作為預設可用內容

---

## 受保護範圍

### r184 & r185 — 報告紙面表面合約
- ✅ 本次未觸碰報告紙面卡片的顏色定義，合約維持不變
- ✅ 未引入任何 `html[data-zw-theme="night"]` 根層級色彩變數覆寫

---

## 驗證狀態

✅ **邏輯核對**
- 依 Supabase 官方 resumable-uploads 文件核對 TUS 標頭欄位用途（`authorization` = 有效 JWT／`x-signature` = 簽名 token）
- 確認舊值（PR #475 的修法）把兩者用途對調，為本次 403 的根本原因

✅ **測試覆蓋**
- `scripts/release-ledger.test.mjs`、`scripts/r162-production-closeout.test.mjs`、`scripts/r181-storage-freeze.test.mjs` 本地全綠
- 與最新 main baseline 比對完整測試套件，無新增失敗

⚠️ **待人工驗證**
- 本沙箱環境無法連線 Supabase Storage 端點，無法在此直接重現並確認 403 已消失；需站主於正式環境實際上傳一個 >6MB 的 MP4/WebM 檔案驗證成功後，方可視為 Verified
- 本 PR（#485）需站主本人在 GitHub 點擊合併：AI 工具鏈的合併權限被系統政策擋下，無法自動合併受保護分支

---

## 回滾

```bash
git revert <commit-hash>
```

或：

```bash
git checkout HEAD~1 -- src/lib/owner-data-client.ts
git checkout HEAD~1 -- src/lib/site-stats.ts
git checkout HEAD~1 -- lib/zhaowu-verification.js
```

### 前向相容性
純授權標頭調整，無資料庫遷移、無 HTML/JS 結構變更，向後兼容。

---

**昭梧上傳授權修復 · 文案標準版**
