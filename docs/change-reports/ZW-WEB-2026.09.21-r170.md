# 昭梧更新報告｜ZW-WEB-2026.09.21-r170

## 為什麼改
站主提供的排盤截圖顯示一個常見問題：格局法、扶抑強弱、五行量化與民俗旁證如果沒有分層，會讓客戶同時看到互相衝突的「喜用」或把 2–11／6–15 之類數字誤讀成人格代碼。這次把方法分工、格局狀態與紫微五行局邊界正式寫進昭梧。

## 本次改動
新增 `ZW-BAZI-METHOD-LAYERING-1.0`：CURRENT 子平主鏈是唯一最終結構裁決；扶抑身強身弱只作力量旁證；五行數量與分數只描述分布；神煞、納音、十二長生降為低權重旁證；稱骨留民俗參考；日柱通用人格文案不得充當個人主結論。格局輸出增加候選格／成格／成而有病／破格／假格或變格狀態。知識庫新增手機友善「判斷依據」教學卡。紫微新增五行局與第一大限起歲說明：水二局 2–11、木三局 3–12、金四局 4–13、土五局 5–14、火六局 6–15，並禁止把局數直接人格化。

## 影響範圍
八字 runtime 指令治理、Focused Report 方法分層契約、`/knowledge` 八字／紫微教學內容、紫微 interpretation grammar 與對應回歸測試。

## 受保護範圍
不改四柱、節氣、真太陽時、藏干、十神、起運、大運或紫微星位等 deterministic calculation truth；不改 auth、payment、Supabase schema、報告歷史、專業路由權限或部署架構。首頁與命書第一屏不重新塞入方法自述。

## 驗證狀態
本分支需通過 interpretation-layering 專項測試、Deploy gate、Engine suite、TypeScript/build；合併後只做一次 Vercel Production release，再核對正式站與 `/knowledge`。真實 iPhone Safari 仍需以既有實機 Gate 分開判定。

## 回滾
回退本次 r170 相關提交即可；無資料庫 migration、無使用者資料變更、無計算真值變更。
