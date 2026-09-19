# 昭梧更新報告｜ZW-WEB-2026.09.20-r170

## 為什麼改
站主已把「回答是否真正回答到問題」定為目前最高優先級。r170 已修正天賦與適合工作，但 QA 對工作去留、感情發展、財務風險、二選一與複合問題仍可能只靠關鍵字或長度通過，存在「程式能跑、答案仍沒答到點」的風險。

## 本次改動
強化最終回答驗收器與 customer-facing guard。工作去留必須直接說明能否可靠判斷與成立條件；感情發展必須落到聯繫、投入、承諾／下一步；財務風險必須點名實際風險類型或說明資料不足；二選一缺少同一組可比條件時必須明說暫不強選。複合問題改為所有已辨識要求都必須被回答，例如「不知道時辰＋適合什麼工作」不能只答其中一半。泛用雞湯句會直接觸發 QA 失敗。並新增 actions 實際流程回歸，不只測 regex。

同時修正專案治理中的 Hosting 真相：正式 Production 為 Vercel `stone-zhaowu-official`，Netlify archive 不再作 canonical。

## 影響範圍
問答內容驗收、最終直接回答 guard、工作／感情／財務／二選一／複合問題、Release metadata 與 Production 治理文件。

## 受保護範圍
不修改 Bazi 排盤核心、calendar/chart/interpret 分類順序、命理母指令計算真相、Auth、Supabase schema、payment、歷史報告資料或 UI 架構。

## 回滾
回退本次 PR 即可；沒有資料庫 migration。若只需回滾回答 QA，可回退 `answer-quality.ts` 與 `direct-answer-guard.ts`，不影響排盤與資料。

## 驗證狀態
合併前要求 Engine suite、Deploy gate、iPhone Safari 全部通過。合併後必須確認 Vercel Production READY 且 Production SHA = main SHA；真實 iPhone 主觀內容閱讀仍與自動化 Gate 分開記錄。
