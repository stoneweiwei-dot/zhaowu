# 昭梧更新報告｜ZW-WEB-2026.09.11-r113

## 本次改動

- 修正一掌經頁面帶入首頁共享出生資料時，D60 分鐘級確認沒有同步到自動提交狀態的問題。
- 讓 D60 事件只由表單提交產生；共享記錄刷新不再繞過「出生時間可核對到分鐘」的確認。
- 使用者改動日期、出生時、出生分或出生地時，會清除既有確認；未知時間仍 fail closed。
- 修正繁中／簡中報告圖片載入失敗提示中的「命詰／命诰」錯字為「命象」。
- 補強非 Vite 測試環境的 telemetry 降級，並同步目前靜態公開圖鑑的契約測試。

## 為什麼改

一掌經頁面會沿用首頁已保存的出生資料並自動生成報告，但舊 runtime 會在共享記錄變動時直接發出 D60 事件，可能讓 D60 在未確認分鐘精度時仍出現。這會讓精確時間的輸入責任邊界不清楚，也使使用者修改資料後留下過期的確認狀態。

本版把 D60 的資料來源收斂到同一次表單提交，讓顯示條件與頁面上的時間、出生地、確認勾選一致；圖片仍是可選層，不能阻塞文字答案與完整報告。

## 影響範圍

- /yizhangjing 的共享出生資料帶入、D60 顯示條件與方向切換自動提交。
- 完整報告圖片失敗時的繁中／簡中提示文案。
- deploy gate 的 D60 合約測試與現有 runtime regression 合約。
- 公開 footer release fallback：ZW-WEB-2026.09.11-r113，累計更新 113。

## 保護範圍

- 不修改八字、日曆、真太陽時、命理 interpretation、登入、付款、Supabase schema 或 D60 計算公式。
- 未知出生時間、沒有出生地或取消確認時，D60 仍不會補算；一掌經主報告不受阻塞。
- 圖片 provider 失敗時，文字答案、完整報告與報告保存流程仍獨立可用。

## 驗證

- GitHub Production CI run 34618913079：deploy gate PASS、engine suite PASS、iPhone Safari PASS。
- 合併前已核對 source branch commit、PR 變更範圍與 Vercel ignore policy。
- Production URL 與 release_history 的正式核對在合併後執行；未有 production READY 證據前不宣稱正式上線。

## 回滾

回滾本版的 palm-standalone、yizhangjing-runtime-r79、D60 contract tests、圖片 fallback copy 與 telemetry safe-env 修改即可；不需變更 Supabase schema，也不影響既有使用者資料。
