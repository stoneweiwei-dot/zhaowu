# 昭梧更新報告｜ZW-WEB-2026.09.24-r200

## 本次改動

- `isomorphic-git/http/node` 從 `lib/owner-music-git.js` 頂層靜態載入移除。
- 只有站主執行新增、改名、啟用或刪除音樂而進入 `withRepo()` 時，才動態載入 Node Git HTTP adapter。
- 公開 `/api/owner-music` GET 只讀 raw manifest，不再評估該 adapter。
- r199 的音樂後台減法、批量工具列規則與所有 Owner 權限保持不變。

## 為什麼改

r199 合併與 Production READY 後，真實呼叫 `/api/owner-music` 仍在新 deployment 產生 Node DEP0169 `url.parse()` 警告。這證明僅移除 `git.getRemoteInfo()` 不足；頂層靜態 import 本身仍會評估舊 HTTP stack。r200 將依賴載入移到只有站主寫入才會走的路徑。

## 影響範圍

- `lib/owner-music-git.js` 的依賴載入時機。
- r200 release ledger／updates／CURRENT source contract。

## 受保護範圍

- 不改音樂 manifest 格式、owner-music branch、SSH push、曲目檔案或公開播放器。
- 不改 Owner Cookie、Auth、payment、Supabase schema／Storage。
- 不改排盤、命理分析、報告與文章內容。

## 驗證狀態

- 合併前 Deploy gate、Engine suite、iPhone Safari 必須 PASS。
- 合併後 Production 必須 READY 且 release.json exact SHA。
- 正式 `/api/owner-music` 必須 200 並回傳有效歌單。
- 真實 GET 後，以只涵蓋 r200 deployment 的新時間窗查 Vercel runtime errors；只有無新 DEP0169 才算此問題完成。

## 回滾

回滾 r200 只會恢復頂層 HTTP adapter import；沒有資料 migration 或 Storage 刪除。
