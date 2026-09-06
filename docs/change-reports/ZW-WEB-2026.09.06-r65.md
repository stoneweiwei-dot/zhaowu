# 昭梧更新報告｜ZW-WEB-2026.09.06-r65

日期：2026-09-06 AEST

## 本次改動

- 分享命象圖不再讀取已淘汰的 `/report-visuals/day-master/*.webp` 單圖路徑。
- 改為直接使用目前正式報告視覺系統的 Supabase 十天干 sprite，依 `index / count` 正確裁切使用者對應日主母圖。
- 遠端母圖載入時設定 `crossOrigin=anonymous`，避免 Canvas 產生跨域污染後無法輸出 PNG。
- 圖片仍保留 `/wallpaper-song.jpg` fail-open 備援；圖片失敗不影響文字報告。

## 為什麼改

固定母圖系統已在 r58–r62 改為 Supabase CDN sprite，但 ShareCard 還沿用舊本地單圖 `imagePath`，存在母圖 404、分享圖退回通用背景，或跨域 Canvas 無法匯出的風險。本次只把 ShareCard 接回同一套已核准母圖資料源，不增加新的命理判斷。

## 影響範圍

- `src/lib/report/share-card.ts`
- 分享命象圖 1080×1920 Canvas 圖像來源與 sprite 裁切
- 公開版本資訊與 release ledger

保護範圍：不修改八字計算、月令邊界、喜忌判定、大運、報告正文、登入、付款、Supabase schema、Production 路由。

## 回滾

回退 r65 ShareCard commit，恢復 r64 `share-card.ts` 與 r64 release metadata。無資料庫 migration。

## 驗證要求

- deploy-gate / build 必須 PASS。
- ShareCard 必須引用 `getReportVisualAsset("day-master", ...)`，不得回到舊本地單圖路徑。
- Canvas 必須按 sprite `index / count` 裁切，並保留紙張 fallback。
- Vercel Production `githubCommitSha` 必須等於合併後 main HEAD。
