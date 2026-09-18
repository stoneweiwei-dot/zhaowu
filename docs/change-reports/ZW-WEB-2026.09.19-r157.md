# 昭梧更新報告｜ZW-WEB-2026.09.19-r157

## 本次改動

- 移除獨立右下角背景音樂浮層；全站公開頁只保留一個青玉小龍助手作為唯一 floating entry。
- 小龍預設在右下角，可拖動，鬆手後自動吸附左右邊緣，位置保存在本機。
- 小龍未展開時會間歇隨機顯示 speech bubble：
  - 站內導覽提示；
  - 迷你音樂播放器／目前曲目狀態。
- 迷你音樂氣泡提供播放／暫停與下一首；點擊主氣泡可打開完整助手。
- 小龍面板內整合完整背景音樂控制：播放／暫停、上一首、下一首、循環播放、隨機播放。
- 保留現有 owner playlist、`/api/owner-music`、本機 loop／shuffle 偏好與 iPhone Safari 首次 user-gesture unlock。
- 修正首次點擊明確播放按鈕時，gesture unlock 與 click handler 可能重複 toggle 的競態。
- 移除舊 mobile compatibility CSS 將小龍強制拉回 document flow 的規則，讓最新可拖動浮層契約真正生效。
- Owner workspace 仍沿用既有規則，不顯示 public dragon overlay。
- r156 新增的音樂改名、批量刪除與其他後台批量操作全部保留，不被本次前台 UI 改動覆蓋。
- 新增 r157 regression tests，鎖住單一浮層、拖動／吸邊／位置持久化、隨機導覽／音樂氣泡及完整歌單控制。

## 為什麼改

r149 補齊完整音樂控制後，獨立播放器與原有青玉小龍同時佔用右下角，形成兩個固定浮層、重影與 z-index 競爭。站主最新指令要求把播放器與小龍合體，讓小龍成為唯一可移動助手，並由氣泡輪播導覽與音樂內容。

## 影響範圍

- `src/components/green-dragon-guide.tsx`
- `src/components/background-music.tsx`
- `src/green-dragon-guide.css`
- `src/content-layout-fixes.css`
- `src/main.tsx`
- iPhone Safari 青玉小龍／音樂 regression
- 公開 release metadata / CURRENT-STATE / INSTRUCTION-REGISTRY

## 受保護範圍

- 不修改 owner music API、音樂改名、批量刪除、站主 Cookie 驗證、音檔 manifest、曲目檔案或上傳流程。
- 不新增第二套音樂來源，不接回舊 Supabase audio bucket。
- 不修改 Supabase schema、會員／站主 auth、payment、報告資料、命理計算、D60、紫微、七政、一掌經。
- 不重做青玉小龍的站內導覽判斷邏輯，只改呈現方式與音樂整合。
- Owner workspace 繼續隱藏 public dragon guide。
- 不觸碰 Paid Visual PR #295。

## 驗證狀態

- Source 已修改，等待 PR Production CI。
- 合併前必須通過 Deploy gate、Engine suite、iPhone Safari。
- 合併後必須確認 Netlify active Production 使用 exact merge SHA。
- Production 至少驗證：首頁 HTTP 200、青玉小龍唯一浮層存在、舊獨立 music dock 不再渲染、`/api/owner-music` 正常、正式 bundle 包含拖動／bubble／完整歌單控制。
- 真實手指拖動與氣泡動畫若工具無法做視覺確認，明確標為未做真機人工驗收，不把 CI 等同實機。

## 回滾

回滾本 release 的 GreenDragonGuide、BackgroundMusic、CSS、main 接線、tests 與 r157 release metadata，即可恢復 r156/r149 的分離式 UI。此變更不涉及資料 migration、音檔刪除或 r156 後台批量管理資料。
