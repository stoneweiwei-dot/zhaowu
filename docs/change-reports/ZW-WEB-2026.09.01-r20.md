# 昭梧更新報告｜ZW-WEB-2026.09.01-r20

日期：2026-09-01（AEST）
狀態：待 Production 驗證

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

- GitHub PR：待建立
- Merge commit：待合併
- CI / Build：待驗證
- Vercel deployment：待驗證
- Production assets：待驗證 `/apple-touch-icon-r20.png`、`/icons/zhaowu-lotus-192.png`、`/icons/zhaowu-lotus-512.png`
- iPhone 驗證：待確認加入主畫面預覽顯示蓮花圖標
- Supabase：Production 驗證後寫入 `release_history`；無 schema 變更
