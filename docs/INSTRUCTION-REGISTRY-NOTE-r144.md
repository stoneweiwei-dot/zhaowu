# 昭梧 Instruction Registry Note｜r144

狀態：`ACTIVE SUPERSESSION NOTE`

日期：2026-09-15

本 Note 依 `AGENTS.md` 的「最新明確站主指令優先」生效，專門覆蓋與 r144 衝突的舊登入／首頁問事／答案呈現指令；其餘既有規則不變。

## 1. 普通訪客登入｜r139 / r141 部分撤銷

現行：普通訪客不需要會員 Email 登入或註冊，回到裝置本地 guest 模式。出生資料以 `zhaowu.birth-record.v1` 保存在自己的手機／瀏覽器。

保留：獨立站主登入、站主 HttpOnly Cookie、安全邊界與 owner console。

`SUPERSEDED`：
- r139「恢復會員登入／註冊」；
- r141 Email-only member auth；
- 任何要求首頁公開顯示普通會員登入 CTA 的舊契約。

注意：站主口語所稱「手機 IP 登入」依歷史實碼還原為手機／瀏覽器裝置本地 localStorage guest identity。不得新增以 IP 位址作永久個人身份的認證機制，因 IP 可能輪替及多人共用。

## 2. 首頁問事｜r139 no-question 部分撤銷

現行固定流程：

出生資料 → 保存／確認 → 顯示問題輸入 → 提交真實問題 → `analyzeLife` → 直接答案。

問題區不得在出生資料尚未完成時搶先顯示；已有本機生辰紀錄時可直接顯示問題區。

`SUPERSEDED`：r139「首頁拿掉問事 textarea，只留保存生辰」。

## 3. 答案專業度｜Answer-first Hard Rule

首屏只保留：

1. 使用者原問題；
2. 直接回答；
3. 一個最重要的下一步。

命盤、人物分析與技術證據降到可展開第二層。完整分析可再展開，但不得用大量無關模組掩蓋問題本身。

最終 QA 必須檢查答案是否真的覆蓋原問題；若證據不足，不得以通用性格句、五行模板或不相關資訊填滿版面，應明確降級結論。

## 4. 不變範圍

- `R6.2.1 + P2 + P3/EC-7` 命理母指令不變；所有八字／命理專項繼承 CURRENT 主鏈；
- deterministic Bazi calculation truth 不變；
- D60 / 紫微 / 西占 / 印度占星計算不變；
- 站主獨立登入不變；
- 付款、Supabase schema、私有資料不因本次改動而重構。
