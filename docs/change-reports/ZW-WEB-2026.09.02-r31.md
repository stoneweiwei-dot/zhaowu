# 昭梧更新報告｜ZW-WEB-2026.09.02-r31

## 本次改動

修復「保存到手機桌面」流程。移除會把提示永久隱藏、但實際沒有建立桌面圖示的「已加入」假確認。iPhone／iPad 改為 Safari 專用保存指引；LINE、微信、Instagram、Chrome iOS 等內置／非 Safari 瀏覽器會明確要求改用 Safari。Android／Chromium 補上 Service Worker、`beforeinstallprompt` 與 `appinstalled` 完整流程，並在關閉提示後保留一個可再次打開的「存到桌面」入口。

## 為什麼改

客戶反映按下保存後桌面沒有任何圖示。舊實作把網站內部按鈕當成「已安裝」確認，實際只寫 localStorage；同時 Android 沒有 Service Worker，導致瀏覽器的系統安裝事件不穩定。這兩項都屬網站問題，不應要求客戶自己承擔。

## 影響範圍

只改 Home Screen／PWA 安裝流程、manifest 識別與 Service Worker 註冊。不改登入、八字排盤、報告、付款、Supabase schema、首頁美工、背景、動畫、圖庫或新加入的 D60 區塊。Service Worker 導航採 network-first，只在離線時回退已快取首頁，避免正常上線時讀到舊版本。

## 驗收

TypeScript/TSX transpile、`sw.js` syntax check、manifest JSON 解析均通過。新契約要求不存在 `INSTALLED_ACK_KEY`／`markInstalled`，存在 `appinstalled`、Safari／iPadOS 判斷、可重試入口、Service Worker fetch handler 與 registration。最終仍需實體 iPhone Safari 和 Android Chrome 各做一次真正加到主畫面的端到端驗收；未實測前不把手機實機標為 PASS。

## 回滾

回滾本次提交即可恢復 r30。沒有資料庫遷移；Service Worker cache 名稱為 `zhaowu-shell-r31`，舊同前綴 cache 會在 activate 時清理。
