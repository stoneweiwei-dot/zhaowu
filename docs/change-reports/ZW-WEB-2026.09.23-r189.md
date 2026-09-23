# 昭梧更新報告｜ZW-WEB-2026.09.23-r189

## 本次改動

- 把 `ZW-PAID-ART-REPORT-2.0` 接入網站現行完整報告，不再只停留在風格文件。
- 直接答案與補充重點之後新增一次「一盤一景」：專屬題名、統一場景、天地／場域／主體／出口、力量與代價、單一現實行動及可折疊證據映射。
- `summary / body` 兩個保存區塊不變；文字匯出同步包含同一份敘事，不恢復九頁、十五頁或多 session。
- 時辰未知時明確降級未來出口；English 分支不混入中文術語或章名。
- Supabase 重新完成全引用核對，凍結 39 個零引用候選的精確 manifest；刪除請求被組織級 402 在執行前拒絕，實際刪除數為 0，臨時權限已撤銷，一次性 executor 已重新退休。

## 為什麼改

現行完整報告已能先給直接答案，但參考報告中最有價值的「一人一題名、一盤一場景、能力與代價同時成立」還沒有成為 runtime。這一版把它收進同一份連續報告，同時保留現行 answer-first、證據可追溯與圖片不阻塞文字的邊界。

Supabase 問題則必須區分「已找到可刪物件」與「已完成實體刪除」。本次已把候選核到 exact manifest，並實際走過 Edge Function 與 Storage API；兩者都由 Supabase 組織級 quota restriction 回 402，因此不得冒充清理成功。

## 影響範圍

- 完整報告 runtime、文字匯出與 iPhone 閱讀層。
- 付費報告風格契約、FOCUSED-REPORT、Instruction Registry、CURRENT-STATE。
- Supabase Storage 清理實況與一次性 executor 狀態。

## 受保護範圍

- 不改四柱、節氣、真太陽時、藏干、十神、格局、喜用或歲運 calculation truth。
- 不改 `summary / body` 持久化主契約，不新增第二份報告。
- 不把題名、瑞獸或畫面象徵寫成事實。
- 不刪客戶報告、仍被 metadata 引用的資產、4 個 cross-bucket backgrounds 或 rollback 必要原件。
- 不 SQL DELETE `storage.objects`，不擅自升級 Supabase 或解除消費上限。

## 驗證狀態

- Paid style、personal narrative、focused report、full report、final reading 定向測試通過。
- 合併後全量 Engine 733／733、Deploy gate 212／212、TypeScript 與 Vite production build 通過；本機 WebKit iPhone Safari 45／45 通過，遠端 CI 以 main push 後的實際結果為準。
- Production 報告必須維持：直接答案在前、一盤一景只出現一次、證據預設收合、手機無橫向 overflow。
- Production SHA 必須等於 current main；本批只觸發一次正式部署。
- Supabase 仍屬 blocked：限制解除後重跑 live audit，只有 39／160,741,199 bytes／manifest hash 完全一致才可用 Storage API remove，再復算全桶實體容量。

## 回滾

若新敘事造成報告回歸，只回滾 `personal-narrative`、`focused-report`、`paid-report-pages` 與對應 canonical CSS；不得回滾 answer-first、`summary / body` 或 calculation truth。Supabase v7 cleanup executor 不得恢復。
