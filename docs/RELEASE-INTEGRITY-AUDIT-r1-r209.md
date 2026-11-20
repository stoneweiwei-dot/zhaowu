# 昭梧 Release Integrity Audit｜r1–r209

> 歷史稽核快照：本文件記錄 2026-09-27 對 r1–r209 的證據核對；current runtime 以最新 `main`、`docs/CURRENT-STATE.md` 與 Vercel Production 為準，不以本文件中的 r210 狀態回滾現況。

稽核日期：2026-09-27 AEST

## 稽核方法

本次不把 change-report 文字本身當作完成證據，而是交叉核對：
1. current `main` Git tree；
2. `docs/change-reports/` 實際檔案；
3. Git commit 歷史中的 rNN release commit；
4. CURRENT / Instruction Registry；
5. 現行 regression / Production CI contracts；
6. Vercel Production runtime SHA。

## 編號結果

稽核前 `docs/change-reports/`：
- 185 個檔案；
- 183 個 unique r 編號；
- 最小 r11，最大 r209；
- 歷史重複標籤：r119（兩份日期檔）、r136 + r136.1。保留歷史，不改名、不刪除。

r1–r10：change-report 制度尚未建立；現有 Git 歷史不足以安全重建為十個正式 release，不補造。

r59：在本次檢查的 main Git 歷史中找不到對應 r59 release commit；保留為歷史跳號，不補造假 report。

## 有真實 release commit、但缺 change-report 的版本

本次共確認 15 個：
- r71、r72、r73、r74、r75、r76、r77
- r93
- r121
- r124
- r128
- r143
- r172
- r195
- r202

以上全部依真實 commit SHA 回填歷史紀錄；回填檔明確標示「歷史回填」，不冒充新 runtime，也不把已被後續版本 supersede 的舊要求重新啟用。

## 發現的 current drift

### 1. TUS 大檔上傳 403
current source 把 object signed-upload token 同時放進 `Authorization` 與 `x-signature`。Supabase resumable endpoint 的 bearer 需要可驗證 credential；object signed token 應放 `x-signature`。這個 drift 對應站主實機的 403 RLS。

r210 修正：
- `Authorization: Bearer ${SUPABASE_KEY}`
- `x-signature: signedUploadToken`
- 保留 `apikey`
- 不關 RLS、不公開 anon INSERT、不把 service_role 放前端。

### 2. r209 release ledger 漂移
r209 source 一度寫 `updateNumber: 207`，與已存在的 r208 / 208 release-history sequence 衝突。這會讓 public stats 把較舊 database row 判成 current。

r210：
- 現行 release 推進至 r210 / updateNumber 210；
- r209 歷史報告補註其正確序號為 209；
- Production 後補齊 release_history 209 / 210。

### 3. CURRENT login animation 規則落後
`CURRENT-STATE.md` 仍寫 r191 的「每次登入流程一次」，但 Instruction Registry r204 已 supersede 為「同裝置每本地日最多一次」。

r210 已把 CURRENT 同步到 r204 真實規則。

### 4. Instruction Registry 標籤漂移
r208 的 R6.2.2 final-closure entry 標題仍寫 r206。r210 修正標籤，不改 runtime。

### 5. 唯一交接板 Issue #1 落後
Issue #1 仍停在 r197 evidence。這不是 runtime bug，但會誤導後續 agent。r210 Production 驗證後更新到最新 exact evidence。

## 沒有重新實作的歷史項目

歷史 change-report 不是永遠有效的需求池。凡已被後續 owner 指令／CURRENT / Instruction Registry supersede 的 UI、登入、PWA、報告入口，不因本次稽核而復活。

本次只修：
- current source 與 active contract 明確不一致；
- 真實 release 缺 evidence；
- release ledger / handoff truth 漂移。

## 仍需人類 / 真機證據

以下不是「程式沒做」，而是現有工具無法冒充的驗收：
- 真實體 iPhone Safari 最終 STO-5 / STO-20 驗收；
- 已驗證 owner session 下，實際上傳一個 >6 MB、<=15s 的 MP4/WebM，確認 TUS 成功；
- logout 後再次嘗試寫入必須失敗。

這兩項沒有真機／owner session 證據前，只能標為 NOT LIVE-VERIFIED，不能用 CI 或文件文字代替。
