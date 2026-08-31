# 昭梧更新報告｜ZW-WEB-2026.09.01-r20

日期：2026-09-01（AEST）
狀態：Production 驗證完成

## 本次改動

1. iPhone「加入主畫面」圖標改為 Stone 指定的米白宣紙、金線蓮花與朱砂圓點圖標。
2. 移除建置時繪製舊棕色雙橫線圖標的 `paintSeal` 產生器，180、192、512 三種尺寸改為複製同一套已核對的蓮花 PNG。
3. Apple Touch Icon 改用 `/apple-touch-icon-r20.png`，precomposed 與 manifest 圖標也改用新的版本化檔名，避開 iOS 對舊網址的圖標快取。
4. 保留舊標準網址作相容別名，但內容同樣改為蓮花，不再有任何路徑生成舊棕色圖標。
5. 回歸測試新增像素來源一致、180／192／512 實際尺寸、舊 `paintSeal` 不得回流，以及 HTML／manifest 新網址檢查。

## 為什麼改

正式站雖曾嘗試更換圖標，但測試與建置流程每次都會執行 `write-home-icons.mjs`，把檔案重新畫成舊棕色雙橫線圖標；因此 iPhone 的加入主畫面預覽始終沒有真正換掉。此次直接修正產生源，並更換 Apple Touch Icon URL，處理建置覆蓋與 iOS 快取兩個根因。

## 影響範圍

- iPhone Safari「加入主畫面」預覽圖標
- PWA manifest 180／192／512 圖標
- 瀏覽器 favicon
- 首頁公開 release footer

## 不改範圍

- 首頁表單、文章、青玉小龍與所有視覺排版
- Loading 動畫與三秒放行規則
- 八字、紫微、七政、一掌經與報告生成
- 登入、權限、付款、Supabase schema 與 Edge Functions

## 回滾

回退 `scripts/write-home-icons.mjs`、`scripts/home-icons/`、`index.html`、`public/manifest.webmanifest`、對應測試與 release 檔案。不得只換 public 輸出檔而保留舊產生器，否則下一次建置會再次覆蓋。

## Production 驗證欄

- GitHub PR：[#187](https://github.com/stoneweiwei-dot/zhaowu/pull/187)
- Merge commit：`bbc9ab0e8ce340cbfef2ff0a59b5b63158a25b78`
- CI / Build：Production CI #866 PASS；299/299 tests、TypeScript、Vite production build 與 iPhone Safari regression 全部通過
- Vercel deployment：`dpl_7YrFv3dUeuLXZygm4dX3pGKUQKbQ`，Production READY，來源 commit 與 merge commit 一致
- Production assets：`/apple-touch-icon-r20.png`、`/icons/zhaowu-lotus-192.png`、`/icons/zhaowu-lotus-512.png` 均回傳 HTTP 200；PNG IHDR 尺寸分別為 180×180、192×192、512×512，內容來自同一蓮花圖標來源
- iPhone 驗證：正式首頁已輸出新的版本化 Apple Touch Icon URL；iOS 已開啟的「加入主畫面」視窗不會即時刷新，須關閉後重新開啟；已安裝的舊捷徑須刪除後再加入
- Supabase：`release_history` 已寫入 `ZW-WEB-2026.09.01-r20`；無 schema 變更
