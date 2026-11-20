# 昭梧更新報告｜ZW-WEB-2026.09.09-r94

## 本次改動
- 依 2026-09-09 iPhone 實機截圖直接修正三個可見回歸。
- 開場 loading fallback：改為滿版 owner poster + 宋式蓮景層，不再顯示中央窄小圖片與大面積空白；保留原 owner video 與最多三秒 fail-open。
- 《觀世錄》五行插圖：改為 800×800 緊湊構圖，以竹葉、火焰／蓮形、山形、銅鏡、水紋對應木火土金水，去除過高的抽象色塊卡與無效留白。
- 手機浮動控制：背景音樂與「存到桌面」分開位置，瀏覽器模式抬高避開 iPhone Safari／內置瀏覽器底欄；standalone 模式仍貼安全區底部。
- 保留 r93 客人資料文案與文章視覺契約，不回滾 r93 之後的功能。

## 為什麼改
- 實機畫面證明原 loading fallback 的 poster 被寫成小尺寸 contain；五行 SVG 為狹長抽象構圖；兩個 fixed 控制共用右下角。
- 這些是實際 DOM/CSS/資產問題，不能以 CI 綠燈視為畫面完成。

## 影響範圍
- `src/components/intro-gate.tsx`
- `src/components/background-music.tsx`
- `src/visual-hotfix-r94.css`
- `src/main.tsx`
- `public/articles/bazi-health-five-phases.svg`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- `docs/change-reports/ZW-WEB-2026.09.09-r94.md`
- 不修改命理計算、D60、十神／五行 runtime analysis、出生資料、登入、付款、Supabase schema 或 RLS。

## 回滾
- 回滾 r94 單一提交即可恢復 r93；本次不涉及資料庫 schema migration。

## 驗證
- Production deploy/build、Engine suite、iPhone Safari regression 必須成功。
- Vercel Production 必須精確指向 r94 最終 SHA 且 `READY`。
- `/intro/owner-lotus-bloom-r53.jpg` 與 `/articles/bazi-health-five-phases.svg` 必須可讀，Production runtime 不得新增錯誤。
