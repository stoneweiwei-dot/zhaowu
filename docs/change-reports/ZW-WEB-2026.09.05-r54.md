# 昭梧更新報告｜ZW-WEB-2026.09.05-r54

日期：2026-09-05 AEST

## 本次改動

- 主畫面／PWA 圖標改用站主提供的宋畫金蓮原圖（`4242BCBE`）緊裁、提高對比後輸出 180／192／512 PNG，讓 iPhone 60px 主畫面仍可讀成一朵金蓮，而不是舊 r20 細線圓標＋朱點。
- Apple Touch Icon 改走版本化路徑 `/apple-touch-icon-r53.png`（含 precomposed），manifest 同步；舊 `/apple-touch-icon-r20.png` 別名寫入同一組新 bytes，避免舊網址還是另一個標。
- Service Worker cache 升為 `zhaowu-shell-r53`，shell 清單改取 r53 圖標。
- Loading 改播站主原片雙蓮開花：`/intro/owner-lotus-bloom-r53.mp4`（H.264 High、720×1280、24 fps、約 5 秒、769,104 bytes）與同名 JPEG 海報；reduced-motion 靜帧同步改用這張海報。
- 舊 r26 雙蓮檔保留在倉庫作回滾，不再被 IntroGate 引用。
- 站台發佈編號為 r54，因為 r53 已被 main 上的背景音樂管理佔用；媒體檔名仍用 r53 作為 iOS／SW 快取突破標記。

## 為什麼改

站主要求主畫面 logo 盡量接近他提供的宋畫金蓮，並用他提供的 5.04 秒 720×1280 雙蓮開花影片作 Loading。舊 r20 圖標 iOS 會把同一 URL 快取很久，所以必須換新檔名；Loading 必須提交真實 mp4，不能再走 r40 分片解碼（production 曾因此 404）。

## 影響範圍

- `src/components/intro-gate.tsx`
- `src/intro-extra.css`
- `index.html`
- `public/manifest.webmanifest`
- `public/sw.js`
- `scripts/write-home-icons.mjs`
- `scripts/home-icons/zhaowu-lotus-{180,192,512}.png`
- `public/apple-touch-icon*.png`、`public/icons/*`
- `public/intro/owner-lotus-bloom-r53.mp4`
- `public/intro/owner-lotus-bloom-r53.jpg`
- `scripts/intro-loading.test.mjs`
- `scripts/intro-motion-r33.test.mjs`
- `scripts/home-screen-install-prompt.test.mjs`
- `e2e/loading-gate.iphone-safari.spec.ts`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- `docs/change-reports/ZW-WEB-2026.09.05-r54.md`
- `docs/CURRENT-STATE.md` Loading 現況

## 保護範圍

未修改：八字／紫微／七政／一掌經與其他命理計算、auth、payment、Supabase schema、報告生成與報告歷史、測驗題目、人物面板、r53 背景音樂管理、三語、路由。Loading 時序仍為最短 1.2 秒、蓮開 5 秒、硬退出 5.3 秒；啟動檢查 fail-open 契約維持 r51。

## 回滾

回滾本 r54 commit 即可恢復 r53 圖標路徑與 r26 Loading 影片，並保留 r53 背景音樂管理。新 r53 媒體檔可留在倉庫作稽核，不需要資料庫 schema 回滾。已加到 iPhone 主畫面的舊捷徑可能仍顯示舊圖，需刪除捷徑後重新加入。

## 驗證狀態

- GitHub / CI / Vercel / Production：以合併後 exact commit 與 Production deployment 為準。
- `/apple-touch-icon-r53.png`、`/intro/owner-lotus-bloom-r53.mp4` 必須 HTTP 200 且為真實 PNG／MP4。
- iPhone Safari Loading regression 必須 PASS。真機主畫面圖標與開場影片標為 `NOT PHYSICALLY VERIFIED`，由站主實機確認。
