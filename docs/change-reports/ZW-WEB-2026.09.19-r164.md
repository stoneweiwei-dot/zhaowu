# 昭梧更新報告｜ZW-WEB-2026.09.19-r164

## 本次改動
日夜改成兩個直接選擇按鈕，各至少 44px；補齊夜间报告與青玉小龍文字對比，提高播放器輔助字級。
## 為什麼改
r163 已完成紙面與底色，但部分子元素仍沿用舊深色字。分段外觀原本僅能反轉狀態。
## 影響範圍
首頁、報告、小龍與 Header；沿用 canonical stylesheet。
## 受保護範圍
不改計算、報告內容、權限、資料、音樂來源與登入動畫。
## 回滾
回滾本次提交；無資料遷移。
## 驗證狀態
待本次 build、engine、Safari CI 與正式站核對。實體 iPhone 尚未人工驗收。

本機驗證：685 項 engine tests 通過；deploy gate、Vite build 與 TypeScript 通過。WebKit 因環境缺少系統函式庫無法啟動，新增回歸交由 GitHub CI；實體 iPhone 尚未驗證。
