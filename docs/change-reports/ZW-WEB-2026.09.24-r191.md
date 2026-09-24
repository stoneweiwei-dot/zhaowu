# 昭梧更新報告｜ZW-WEB-2026.09.24-r191

## 本次改動

- 首頁的「今日一格」、核心生辰流程、桌面安裝提示改為三個獨立 fail-open boundary。
- 任一單一區塊 render／lifecycle 異常時，只降級該區，不再讓整個 `/` 落入 Router Error。
- 已保存生辰的 `analyzeStructure(previewChart)` 加上 fail-open；結構分析若遇邊界資料，首頁先保留可用狀態。
- r190 的完整命書 lazy mount 繼續保留。
- Supabase Storage 已完成的 39-object 清理與 Storage write freeze 不變。
- 完整報告移除「PERSONAL ANALYSIS / YOUR QUESTION / Reasoning notes / Chart basics」等 prompt／dashboard 式標題與教學型 helper copy，改成簡短成品語言。
- 「一盤一景」移除流程自述式文案，只保留命象、依據與下一步。
- 新增 R6.2.2 CURRENT GOVERNANCE MASTER：收斂證據、EVP、AI 一致性與時間層級；deterministic runtime 仍明確為 R6.2.1 + P2 + P3，不假稱重寫核心。

## 為什麼改

r190 上線後，持久瀏覽器狀態仍可重現首頁 Error，而新訪客 CI 正常。這表示問題不只是完整命書提早掛載，而是舊本機狀態或某個首頁子區塊仍可能觸發 client-side 錯誤。

r191 不再讓任何單一首頁子區塊擁有「拖垮整頁」的能力。

## 影響範圍

- 首頁錯誤隔離。
- 已保存生辰的恢復流程。
- 完整報告客戶可見文案與命象敘事。
- 命理治理／證據版本入口。
- 不新增產品功能、不新增視覺系統。

## 受保護範圍

不修改：

- 八字曆法、四柱、真太陽時、子時換日。
- 格局／旺衰／用神的正式 truth。
- r189 一盤一景的資料來源與判讀 truth；本版只做文案減法。
- deterministic 排盤與 R6.2.1 + P2 + P3 runtime。
- Auth、payment、Supabase schema。
- 宋式視覺、小漫畫、青玉小龍、播放器、Login animation。

## 驗證狀態

合併前必須通過 Deploy gate、Engine suite、iPhone Safari 與 r191 error-isolation contract。

合併後必須重新打開 canonical Production `/`，確認不再是「Something went wrong」，並 smoke `/login`、`/updates`、修仙測驗及 runtime errors。

## 回滾

r191 只增加首頁錯誤隔離與 fail-open，不涉及資料遷移；必要時可回滾前端 commit。Supabase 已完成的零引用 Storage 清理不回滾。
