# 昭梧更新報告｜ZW-WEB-2026.09.27-r207

**發佈日期:** 2026-09-27 23:20 UTC+10
**累計更新:** 206

---

## 本次改動

### 修復：登入影片／圖庫大檔上傳 403 RLS 失敗

`src/lib/owner-data-client.ts` 中 `uploadOwnerSignedFile` 對於超過 6MB 的檔案（登入影片、圖庫素材等）改走 Supabase Storage 的 TUS resumable 續傳協定。此路徑先前對 Supabase Storage 的授權標頭配置錯誤：

- **錯誤**：`authorization: Bearer <signed-upload-token>`（把一次性簽名 token 當作一般 JWT 放進 authorization）
- **正確**：`authorization: Bearer <anon key>`（authorization 必須帶有效 Supabase JWT；此處無使用者 session，以 anon key 頂替）＋`x-signature: <signed-upload-token>`（簽名 token 的正確承載位置，授權該次上傳所對應的特定物件路徑）

Storage API 對 `authorization` 的值會嘗試以 JWT 驗證身份以套用 RLS，簽名 token 本身不是通用 JWT，因而每次都被判定為未授權寫入，回傳「new row violates row-level security policy」403。此問題此前已有一次修復嘗試（PR #475，2026-09-26 合併），但該次修復方向本身有誤（把 token 放進 authorization 而非 x-signature），未解決問題。本次依 Supabase 官方文件重新核對雙欄位的正確用途後修正。

### 未採納：夜間模式全站色板覆寫

本次原計畫一併推進排版統一化（CSS 變數化行高/間距、夜間色板完整定義），但在合併前發現：
- `ad21e0a`（今日稍早）已明確撤回過一次「`html[data-zw-theme="night"]` 根層級覆寫 `--zw-ink`/`--zw-ink-soft`/`--zw-muted`」的嘗試，原因是報告紙面卡片（如 `.zhaowu-result-flow`）依設計在夜間模式仍維持淺底深墨，根層級覆寫會使其變成淺字疊淺底、致盲。
- 本次一度在另一分支（`release/r207`，未合併）重新引入了同類全站根層級色板覆寫（改用不同色碼），雖未被 CI 的字面比對規則攔下（測試僅比對舊色碼字串），但仍屬同一類風險：一次覆寫 13 個色彩變數，波及全站所有引用這些變數的元件，且未逐一驗證每個既有夜間 scoped 覆寫是否會被此舉覆蓋或疊加衝突。
- 該分支與其色板改動已捨棄，不合併。行高/間距的 CSS 變數化（不涉及顏色）評估為安全但需要更完整的視覺回歸驗證，留待下一輪單獨處理，本次不與色彩改動混在一起送出。

---

## 為什麼改

站主回報：登入動畫管理後台上傳新的登入影片時，於「上傳登入影片」步驟卡在 `POST .../storage/v1/upload/resumable` 回傳 403，錯誤訊息為 `new row violates row-level security policy`，導致新影片無法上傳，站主也因此懷疑先前已存在的登入影片一併消失（實際上內建蓮開／飛升影片仍在靜態目錄中，未被刪除，僅新上傳流程本身故障）。

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
- ✅ 本次未觸碰 `.zhaowu-result-flow` 等紙面卡片的顏色定義，合約維持不變
- ✅ 未重新引入任何 `html[data-zw-theme="night"]` 根層級色彩變數覆寫

### r206 — 命書報告寬度限制
- ✅ `.zhaowu-unified-birth-report { max-width: 560px; }` 保持有效（承接自 r206/ad21e0a，未變動）

---

## 驗證狀態

✅ **邏輯核對**
- 依 Supabase 官方 resumable-uploads 文件核對 TUS 標頭欄位用途（`authorization` = 有效 JWT／`x-signature` = 簽名 token）
- 確認舊值（PR #475 的修法）把兩者用途對調，為本次 403 的根本原因

✅ **測試覆蓋**
- `scripts/release-ledger.test.mjs` — 版本号匹配
- `scripts/r162-production-closeout.test.mjs` — 資料庫合約保持

⚠️ **待人工驗證**
- 本沙箱環境無法連線 Supabase Storage 端點，無法在此直接重現並確認 403 已消失；需站主於正式環境實際上傳一個 >6MB 的 MP4/WebM 檔案驗證成功後，方可視為 Verified

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
