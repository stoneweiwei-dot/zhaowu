# 昭梧更新報告｜ZW-WEB-2026.09.28-r210

## 本次改動

- 把 r207 已接入的五行認知／十干性格梗／四庫速查真正帶入完整報告文字，不再只停留在 instruction registry。
- 新增 `src/lib/report/owner-cognition-lines.ts`：
  - 每份中文完整報告加入一條「五行功能」：只翻譯核心天干所屬五行的五常／功能語言。
  - 加入一條「天干一面」趣味側寫，明確標示不是人格定論。
  - 命盤出現辰戌丑未時，加入一條「四庫提示」，列出所在柱位、濕燥／庫別與藏干，並明示「庫不等於財庫」。
  - 英文報告有獨立純英文版本，不混入漢字。
- `src/lib/report/focused-report.ts` 將上述內容接入正式 `summary/body` 報告保存鏈，文字版與網站版共用同一份內容。
- 新增 `scripts/r210-report-owner-cognition.test.mjs`，防止內容只進資料庫卻沒有真正出現在完整報告。

## 為什麼改

站主明確要求：這批五行認知、十干白話與四庫資料不只作網站內部知識，也要進入實際報告。為避免把 IG 式簡化內容升格成主判，本次採「已完成主判之後的白話翻譯層」：內容會出現在完整報告，但不能反向改寫格局、病藥、用神、承載或歲運。

## 影響範圍

- 完整報告文字內容。
- 保存到歷史記錄的完整報告文字。
- 英文完整報告新增對應英文功能語言。
- 不新增第三個 report session、卡片或新公開入口。

## 受保護範圍

- 不改四柱、節氣、藏干、十神、起運、大運等 deterministic calculation truth。
- 不改 R6.2.2 主判順序、P2/P3、GF-13、ODL/FC/CAPACITY。
- 「五行功能」不是缺什麼補什麼；「天干一面」不是正式人格判定；「四庫提示」不等於財庫或自動開庫。
- 不改 auth、payment、Supabase schema、Storage 或 owner 權限。

## 驗證狀態

- 合併前：Deploy gate、Engine suite、iPhone Safari CI 必須全綠。
- r210 regression 必須證明繁中報告實際包含「五行功能／天干一面／四庫提示」，英文報告必須保持純英文。
- 合併後：Vercel Production SHA 必須等於最新 main，`/release.json` exact SHA match，並寫入 Supabase `release_history`。

## 回滾

回滾本次 PR 即可恢復 r209 報告內容；本次沒有資料庫 migration 或 Storage 變更。
