# 昭梧更新報告｜ZW-WEB-2026.09.06-r62

日期：2026-09-06 AEST

## 本次改動

- 命之書「總覽」從全站通用 `/wallpaper-song.jpg` 升級為專屬四時宋系宣紙背景：`report-visuals/r62/overview-bg.webp`，並保留原宣紙圖作 fail-open fallback。
- 新版報告固定母圖正式收口：十天干 10、十二月令 12、運之書五行 5、命之書總覽 1；停止沒有明確 slot 的泛用擴圖。
- 後台 Gallery 以 Storage eTag + bytes 稽核 exact duplicate；移除已確認的重複 Gallery entry，保留唯一有效版本。未經證明只是「相似」的圖不做破壞性刪除。
- 將 r59 運之書五行與 r62 命之書總覽正式登記進 `gallery_assets`，並把 r57 報告母圖標為 approved / song-atlas。
- 新增 `docs/GALLERY-AUTO-INGEST-POLICY.md`：往後由 agent 生成且具昭梧長期重用價值的最終圖片，預設自行走 Gallery 入庫流程，不再要求站主另行手動上傳；臨時圖、QA 圖、未選變體、重複圖與沒有明確用途的泛用圖除外。

## 為什麼改

站主要求這次美工系統必須一次收口，不再「東生成一張、西生成一張」。因此 r62 的目標不是繼續增加圖片數量，而是把已核准素材映射、總覽背景、Gallery 去重與未來自動入庫規則固定下來，使後續所有 agent 都沿同一套可維護流程工作。

## 影響範圍

- `src/report-art-final-r62.css`
- `src/main.tsx`
- `docs/GALLERY-AUTO-INGEST-POLICY.md`
- `scripts/report-art-final-r62.test.mjs`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- Supabase `gallery_assets` metadata / exact-duplicate cleanup
- Supabase Storage 既有 `report-visuals/r62/overview-bg.webp`

## 保護範圍

本次不修改：
- 八字排盤與真太陽時計算
- 月令邊界
- 身強弱、喜用、格局病藥判斷
- 大運 / 流年計算
- 報告正文
- 登入、付款、帳戶、歷史報告
- Supabase schema
- 路由與 Production project

圖片仍只負責意象；圖片失敗不得阻塞文字或 SVG/CSS 圖表。

## 回滾

- 移除 `report-art-final-r62.css` import 即可恢復舊總覽視覺；原 `/wallpaper-song.jpg` fallback 仍存在。
- Gallery 去重只移除 byte-identical 的重複 entry；保留的 canonical entry 與正式 report assets 不受影響。
- 若需撤回自動入庫政策，可回退本 release 的 policy 文件，不需修改命理引擎或資料 schema。

## 驗證

發布前必須：
- `npm run test:engine` PASS
- `npm run build` PASS（包含 Vite + TypeScript）
- Preview 對 exact branch SHA 為 READY
- merge 後 Vercel Production 對 exact main SHA 為 READY
- Production `/` PASS
- r57 / r59 / r62 report CDN assets HTTP 200
- Supabase Gallery exact duplicate query 返回 0 組

真實登入後 iPhone 報告畫面的肉眼確認若工具無法取得使用者 session，需明確標為 `NOT VISUALLY VERIFIED`，不得假稱已看見。
