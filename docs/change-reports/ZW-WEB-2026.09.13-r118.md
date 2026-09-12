# 昭梧更新報告｜ZW-WEB-2026.09.13-r118

## 本次改動

- 印度古法占星／D60 新增明確的「出生分鐘可靠度 Gate」：先顯示本次使用的年月日、精確時分與出生地，使用者必須確認這是可核對到分鐘的出生時間，才會開始 D60 穩定性檢查。
- 確認綁定當次出生記錄；年月日時分、時區或出生地變動後，原確認立即失效，必須重新確認。
- 確認後先沿用現有 D60 上升點算法做 ±2 分鐘檢查；若前後兩側任一足以改變 D60 上升細分，直接標示「不作判定」，不渲染 D60 盤面／五項解讀。
- 若穩定性檢查本身失敗，同樣 fail-closed：D60 不作判定，其他分析照常保留。
- 新增 iPhone Safari 契約測試，鎖定 04:40 精確分鐘顯示、確認 Gate 必須出現，以及未確認前不得顯示 D60 解讀。

## 為什麼改

r117 正式站以 1988-10-04 04:40、Sydney 的合成訪客資料驗證時，確認共享生辰與精確分鐘均能正確保留，但 `/indian-astrology` 沒有出現 Instruction Registry 所宣告的分鐘確認 Gate；而且 ±2 分鐘不穩定時仍可看到 D60 解讀內容。這與現行 `VEDIC-INTERPRETATION-PROTOCOL-v1.0.md` 的時間可靠度 Gate 衝突。

本版只補可靠度與輸出 Gate，不改 D60 計算公式，不用 D60 反向考時，也不把 D60 升級為子平主判。

## 影響範圍

- `/indian-astrology` 的 D60 公開補充區。
- D60 使用者確認與 ±2 分鐘穩定性前置流程。
- iPhone Safari D60 回歸測試。
- public release fallback 與 PWA shell cache。

## 保護範圍

- 不修改現有 Astronomy Engine、Lahiri ayanamsa、上升點與 D60 分段公式。
- 不修改子平八字、紫微、七政、一掌經等主計算與判法。
- 不修改 Auth、Supabase schema、RLS、使用者資料、報告歷史、payment、paywall 或任何付費 PR。
- PR #295 按站主指令繼續暫停，不納入本批。
- D60 仍只作印度古法占星的輔助旁證；時間不可靠即停止，不以 D60 反向修正出生時間。

## 驗證

發布前：Deploy gate、Engine suite、iPhone Safari 必須全部通過。

發布後：使用未登入的合成出生記錄 `1988-10-04 04:40 · Sydney, Australia` 驗證 `/indian-astrology`：頁面必須先顯示 04:40 的分鐘確認 Gate；確認前不得出現 D60 解讀；確認後若 ±2 分鐘不穩定，必須只顯示「不作判定」而不顯示 D60 盤面解讀。另核對 Production READY、GitHub main exact SHA、PWA cache 與 runtime errors。

## 回滾

完整回滾本批 commit 即恢復 r117。因 r117 已知缺少 D60 明確分鐘確認 Gate，若回滾僅可作緊急技術回退，不應視為符合現行 D60 可靠度規範的長期狀態。