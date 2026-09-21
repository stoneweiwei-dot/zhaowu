# 昭梧更新報告｜ZW-WEB-2026.09.21-r171

## 本次改動

- 問事結果第一屏固定使用既有 Decision Report Model：原問題 → 最多兩句直接答案 → 依據狀態 → 最大現實變數。
- 首頁生辰預覽與問事結果中的四柱細項全部明確設定為預設收合；藏干、納音、十二長生、空亡與大運只在使用者主動展開後顯示。
- 補回歸測試，防止首頁再次以 `expandDetails` 強制展開，亦防止結果第一屏漏掉依據狀態與最大現實變數。

## 為什麼改

第一次使用者在回答問題後應先看到可執行答案，而不是先閱讀技術盤；同時，出生資料保存後的命盤仍保留完整內容，但不應一次把所有專業細項鋪滿手機長頁。

## 影響範圍

- `src/components/result-view.tsx`
- `src/components/analysis-form.tsx`
- `scripts/report-answer-first-r110.test.mjs`
- 公開版本資訊與 release ledger

## 受保護範圍

不修改四柱／真太陽時／節氣／十神／起運等 deterministic calculation truth；不修改報告生成規則、Auth、Supabase schema、付款、定位、城市搜尋、夜模式、小龍助手或專業路由。

## 驗證狀態

- Source contract：已加入 answer-first／collapsed-details regression assertions。
- GitHub CI：待 PR 執行 Deploy gate、Engine suite、iPhone Safari。
- Production：尚未部署；不得視為已上線。

## 回滾

回滾本 release 的 UI commit，即可恢復 r170 的結果卡與首頁命盤展開狀態；命理計算與資料結構未變，不需資料 migration。
