# 昭梧更新報告｜ZW-WEB-2026.09.05-r44

日期：2026-09-05 AEST

## 本次改動
- 正式接入昭梧新版報告母圖系統：10 個日主、12 個月令，以及按既有干支首干五行匹配的運勢意象。
- 以 7 個輕量 WebP 群組承載母圖，前端依既有 `visualKey`／已計算干支確定性裁切對應圖像，避免每位客戶臨時生成整套頁面。
- 命之書與運之書共用同一資產 registry；所有正式標題、說明、圖表及 `STONE 原創` 仍由前端渲染，不依賴圖片模型生成中文字。
- 圖像容器固定 9:16、延遲載入；資產缺失或載入失敗時自動退回 `/wallpaper-song.jpg`，不得阻塞文字報告、五行圖表、時間線或交付流程。
- 更新 Phase 1 regression contract，使 fallback 驗證跟隨新的共用 `ReportSpriteArtwork` 元件，而不是要求備援路徑硬寫在舊頁面元件。

## 為什麼改
先前新版視覺規格與母圖已存在，但舊 PR #208 同時混入登入、首頁與 PWA 等已被後續 main 修改的內容，因衝突無法安全合併。r44 把其中純粹且仍有效的視覺資產、映射與共用元件乾淨移植到最新 r43 主線，避免重做圖片，也避免回滾目前已運作的登入、開場、引擎和首頁行為。

## 影響範圍
- `public/report-visuals/groups/*`
- `public/report-visuals/README.md`
- `src/lib/report/report-visual-assets.ts`
- `src/components/report-sprite-artwork.tsx`
- `src/components/report-visual-book.tsx`
- `src/components/report-luck-book.tsx`
- `src/report-visual-assets.css`
- 報告視覺 regression tests
- 公開版本號／更新台帳

## 保護範圍
本版不修改：
- 八字、紫微、七政、一掌經等排盤／推理計算
- Supabase schema、使用者資料、既有報告紀錄
- Auth / OAuth / 登入
- 付款
- 報告文字生成與直接答案順序
- report history
- routing
- multilingual 基礎架構
- 首頁與雙生蓮開場

Supabase `report_requests` 已有 `engine_snapshot`、`paid_report`、`visual_profile`、`image_path`、`image_error` 等欄位，本視覺層不需要資料庫 migration。

## 回滾
回滾 r44 的視覺整合 commit，即可恢復 r43 的宣紙山水 fallback 行為；不需要資料庫回滾。母圖載入本身為 fail-open，不應影響既有文字、付款或報告交付。

## 驗證狀態
- GitHub：PR #211；提交後執行完整 Production CI。
- CI / build：本報告建立時待最終結果；必須通過 engine/contract tests、TypeScript、production build 與 Mobile Safari fallback regression 才可合併。
- Vercel：僅在合併 `main` 後使用既有 Git integration 自動 Production deployment，不手動重複部署。
- Production：待 exact merged commit `READY` 後驗證 `/` 與母圖資產 URL。
- Mobile Safari：自動 regression 必須通過；真實 iPhone 視覺在沒有真機證據前標為 `NOT VISUALLY VERIFIED`。
