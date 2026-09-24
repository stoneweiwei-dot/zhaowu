# 昭梧更新報告｜ZW-WEB-2026.09.24-r201

## 本次改動

- 移除 `lib/owner-music-git.js` 對 `isomorphic-git` core 與 `ssh2` 的頂層靜態 import。
- `isomorphic-git` core、Node HTTP adapter、`ssh2` 全部改為站主寫入時才動態載入。
- 公開 `/api/owner-music` GET 僅讀 raw manifest，不評估 Git／SSH 寫入 runtime。
- r199 的後台減法與 r200 的寫入邊界規則保持。

## 為什麼改

r200 Production READY 後，對正式 `/api/owner-music` 的真實 GET 仍在同一新 deployment 產生 DEP0169。這證明單獨延遲 Node HTTP adapter 仍不足；頂層載入的 Git core／SSH 寫入依賴也必須完全移出公開 GET 初始化鏈。

## 影響範圍

- `lib/owner-music-git.js` 依賴載入策略。
- r201 release ledger、更新頁與 source contracts。

## 受保護範圍

- 不改 raw manifest 格式、owner-music branch、SSH push 行為、曲目檔案。
- 不改 Owner Cookie、同源檢查、付款、Supabase schema／Storage。
- 不改排盤、命理分析、文章或完整報告。

## 驗證狀態

- 合併前 Deploy gate、Engine suite、iPhone Safari 必須 PASS。
- 合併後 Production 必須 READY，release.json exact SHA。
- 真實 `/api/owner-music` GET 必須 200 且回傳有效歌單。
- 只有新 Production 上線後的 runtime-error 時間窗中 DEP0169 = 0，才可標完成。

## 回滾

回滾 r201 會恢復 Git／SSH write runtimes 的頂層載入；無資料 migration 或 Storage 刪除。
