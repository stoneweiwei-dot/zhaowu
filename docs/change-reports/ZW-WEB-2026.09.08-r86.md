# 昭梧更新報告｜ZW-WEB-2026.09.08-r86

## 本次改動

- 將站主本次提供的 1024×1024 原圖正式設為昭梧 App、iPhone「加入主畫面」與 Android PWA 圖示：金色葫蘆、金色分隔線、深藍「昭梧」及原宣紙底均保持不變。
- 由同一原圖輸出 16、32、180、192、512 與 1024 像素 PNG；只做格式轉換與等比例縮放，沒有重畫、改字、換色或加入其他標記。
- 使用版本化的 `/apple-touch-icon-r86.png` 與 `/icons/zhaowu-gourd-wordmark-r86-*.png` 路徑，避免 iOS／瀏覽器繼續命中舊蓮花圖示快取；同步 manifest、favicon、service worker shell 與安裝引導預覽。
- 保留 Header 現行蓮花介面標記為獨立資產；本次只更換 App／桌面捷徑／favicon 圖示，不改 Header 版面。

## 為什麼改

站主明確指定本次上傳的葫蘆「昭梧」原圖作為 App 與手機桌面 Logo。現行主動設定仍指向綠金蓮花，且安裝引導預覽顯示另一個 SVG，會讓網站提示、實際桌面圖示與最新品牌指令互相衝突，因此需要一次同步所有主動入口與快取版本。

## 影響範圍

- iPhone／iPad Safari 的 Apple Touch Icon
- Android／Chromium PWA manifest 的 192、512 與 1024 圖示
- 網站 favicon
- 首頁「保存到手機桌面」引導中的圖示預覽與三語辨識文字
- Service worker shell cache 版本與圖示預載路徑
- 圖示產生器、尺寸／路徑回歸測試與公開 release fallback

## 保護範圍

本次沒有修改 Header 版面、Loading 動畫、首頁內容排版、八字／紫微／七政／一掌經／D60 計算、報告內容、登入、付款、Supabase schema／權限／客人資料、Owner 權限、路由或圖片供應商。

## 回滾

如需回滾，恢復 r85 的 `index.html`、`public/manifest.webmanifest`、`public/sw.js`、`scripts/write-home-icons.mjs`、`scripts/home-icons/`、`HomeScreenInstallPrompt`、相關圖示輸出與測試，並將 `site-stats.ts` 恢復為 r85。無需修改資料庫 schema 或使用者資料。

## 驗證狀態

- Source：HTML、manifest、service worker 與安裝引導均鎖定 r86 葫蘆「昭梧」圖；舊綠金蓮花不再位於 App／主畫面圖示的主動路徑。
- Asset：所有 PNG 由同一張站主原圖等比例輸出，IHDR 尺寸分別為 16、32、180、192、512 與 1024 像素。
- Local：production deploy-gate 19／19、完整 engine／contract 489／489、Vite production build 與 TypeScript 均通過。工作容器缺少 WebKit 系統函式庫且無權安裝，因此本機 iPhone Safari 瀏覽器測試交由 GitHub `iphone-safari` 阻斷工作流執行，不把容器依賴錯誤視為網站失敗。
- Production：以 r86 最終 commit 對應的 Vercel Production `READY`、正式 alias commit 與正式站資產 HTTP／影像驗證結果為準。
- iPhone 實機：自動瀏覽器檢查不能取代站主實機；已保存的舊捷徑可能保留 iOS 快取，必要時需刪除舊捷徑後重新「加入主畫面」。
