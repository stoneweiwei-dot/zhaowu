# 昭梧更新報告｜ZW-WEB-2026.09.23-r185

## 本次改動

- 修正正式站 iPhone 夜間模式的實際回歸：米白／宣紙報告卡重新使用深墨正文，不再被全域亮字規則洗成幾乎看不見。
- 深松綠「依據狀態／最大現實變數」等暗色面維持月白字；日夜模式改成依承載面配色，而不是整段 result flow 一刀切。
- Supabase 清理重新核對引用後，確認 4 個先前候選 background objects 仍被 enabled `gallery_assets` 引用，禁止刪除。
- Supabase `admin-storage-cleanup-execute-once` v7 已退休成 v8 410 stub 並重新要求 JWT；Owner dry-run audit v10 補上 cross-bucket gallery reference。
- Storage 實體用量尚未下降；write freeze 維持，未完成實體刪除前不得宣稱 Supabase 已恢復。

## 為什麼改

正式站真 iPhone 截圖證明 r184 的「夜間提高文字對比」實作方向錯了：它把整個 result flow 的文字改成亮色，但部分結果卡仍是米白紙面，造成亮字疊亮底。

同時重新檢查 Supabase cleanup executor 時發現 v7 只用 `background_assets` 判斷 background 引用，漏掉 `gallery_assets` 可以指向 `zhaowu-backgrounds` 的現行資料模型；若照舊執行，可能刪到 4 個仍 enabled 的正式資產。

## 影響範圍

- iPhone／Safari 夜間結果頁與判斷備註。
- Supabase Storage cleanup 的安全邊界與 audit truth。
- Release／CURRENT-STATE 文件。

## 受保護範圍

- 不改八字、紫微、西占等 calculation truth。
- 不改 owner Auth、Payment、Supabase schema／RLS。
- 不解除 r181 Storage write freeze。
- 不刪任何仍被 metadata 引用的 Storage object。
- 本版不把「已找到候選」冒充「已完成刪除」。

## 驗證狀態

- GitHub 必須通過 Deploy gate、Engine suite、iPhone Safari／UI contract。
- 合併 main 後只建立一次 Vercel Production。
- Production 必須 READY 且 SHA = current main。
- 真 iPhone 仍需確認米白結果卡正文、最值得先做、判斷備註在夜間均可讀。
- Supabase 仍需在真正 Storage API delete 後重新量測容量；目前不屬於完成狀態。

## 回滾

若 surface-aware CSS 造成其他夜間面回歸，只回滾 r185 的結果頁色彩覆蓋；不得恢復 r184 的整體 result-flow 亮字規則。Supabase v7 cleanup executor 不得回滾啟用。
