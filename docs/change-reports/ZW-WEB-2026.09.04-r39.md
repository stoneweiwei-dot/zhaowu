# 昭梧更新報告｜ZW-WEB-2026.09.04-r39

## 本次改動

- 將站主確認的甲木／寅木綠金蓮花「昭梧」圖正式設為網站加入手機主畫面的 App 圖標。
- 產出並鎖定 180×180、192×192、512×512 PNG，移除原始圖四角黑底，保留暖米宣紙、綠金蓮花與朱紅「昭梧」印。
- iOS `apple-touch-icon`、PWA `manifest.webmanifest`、192/512 favicon 全部改用同一套 r39 圖標。
- 首頁「把昭梧存到手機桌面」引導改為直接展示同一張綠金蓮花 App 圖標，不再顯示舊的通用 lotus-emblem SVG。
- 新增版本化圖標路徑，降低 Safari/iOS 沿用舊桌面圖標快取的機率。
- 保留既有舊 icon alias，但內容同步為新圖，避免舊連結或舊瀏覽器路徑失效。

## 為什麼改

使用者要求客人在首頁看到的「保存到主畫面」圖示，與真正保存到 iPhone/Android 桌面後出現的網站圖標必須是同一張綠金蓮花「昭梧」圖，而不是舊的簡化蓮花符號。這次把安裝引導、Apple metadata、PWA manifest 與實際 PNG 資產統一成一個品牌圖標來源。

## 影響範圍

- `index.html` 的 Apple/PWA icon metadata。
- `public/manifest.webmanifest`。
- `src/components/home-screen-install-prompt.tsx` 首頁保存引導。
- `scripts/home-icons/` 與 `public/icons/` 的 PWA 圖標資產。
- home-screen / intro icon regression tests。

不改：八字、紫微、七政、一掌經計算；報告內容；Gallery 命誥匹配；登入；付款；Supabase schema。

## 回滾

回滾本 release 的 icon assets、`index.html`、manifest、install prompt 與對應測試，即可恢復 r38 的舊桌面圖標。既有已安裝在手機桌面的 icon 是否即時更新仍由 iOS/Android 快取策略決定；如設備保留舊圖標，移除舊主畫面捷徑後重新加入即可取得新版本。
