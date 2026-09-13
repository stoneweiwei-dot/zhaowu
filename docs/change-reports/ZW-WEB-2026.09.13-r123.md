# 昭梧更新報告｜ZW-WEB-2026.09.13-r123

## 本次改動

- Loading 改播站主原片飛升動畫 `/intro/owner-immortal-ascent-r123.mp4`（H.264 High、720×1280、24 fps、10.04 秒、約 9.2MB）與同名 JPEG 海報；成功播放時走原時長，右下角提供 Skip，錯誤或 WebKit 無首幀約 1.6 秒 fail-open，硬退出 12 秒。Playwright `navigator.webdriver` 預設跳過 10 秒 intro，避免 Safari 套件超時。
- 印度占星 `/indian-astrology` 重建 D60 出生分鐘可靠度 Gate：顯示年月日＋精確時分＋出生地，需明確確認分鐘，confirmation 綁定 birth fingerprint（時間／時區／經緯改變即失效），再跑 ±2 分鐘穩定性；不穩定或檢查失敗一律「不作判定」，不用 D60 反向考時，不改 Astronomy Engine／Lahiri／Ascendant／D60 分段公式。
- 專卷依站主最新規則顯示對應命盤：西洋完整十二宮／七曜／四軸／相位（r122 已在 main）、七政與紫微在有生辰時顯示 `data-natal-chart`。舊「技術盤一律不向客戶顯示」退出 active path。
- Production CI：Engine suite 改為真正必要檢查（取消 `continue-on-error` 與 observe 名稱）。`netlify.toml` 以 `ignore = "exit 0"` 停止舊 Netlify 自動 Preview／Deploy。PR #295 維持暫停；不 merge 舊 PR #304。

## 為什麼改

站主本輪單批收口：Safari 回歸必須先綠、D60 必須有分鐘確認、Loading 必須用未降解析度的原片與 Skip、專卷要真的顯示命盤。舊 2.4／2.8 秒 Loading 契約與「專卷不顯示技術盤」已被最新指令取代。

## 影響範圍

IntroGate 媒體與時長、D60 前台 Gate、專卷命盤可見性測試、Production CI Engine job、Netlify ignore、PWA cache `zhaowu-shell-r123`、CURRENT-STATE／Instruction Registry。不改八字／紫微／七政／西占 calculation truth，不改 auth、付款、Supabase schema。付費圖片 PR #295 不重啟。

## 保護範圍

- Astronomy Engine 2.1.19、Lahiri、Ascendant、D60 0.5° 分段公式
- 八字主判、`finalizeReading`、guest-first、站主-only login
- r113 App Icon／Header 金葫蘆
- Paid visual #295 暫停

## 驗證

合併前要求 Deploy gate、Engine suite、iPhone Safari 全部通過。Safari 需確認：webdriver 下普通流程不被 10 秒 intro 拖死；force=1 時 Skip 在右下且 ≥44px；影片錯誤 fail-open；D60 確認前無「核心慣性」與 D60 盤；七政／紫微有生辰時顯示命盤；西洋七曜 7 列、十二宮 12 列、四軸 4 列。合併後必須確認 Vercel Production READY、exact SHA match。真實 iPhone 與 `zhaowu.soul-terminal.com` DNS 仍不能由 CI 代替。

## 回滾

回退 r123 提交即可恢復 r122 Loading（`owner-lotus-bloom-r53`、2.4／2.8 秒）與沒有獨立 D60 Reliability Gate 的印度專卷。不需資料庫 migration。Netlify ignore 一併回退。
