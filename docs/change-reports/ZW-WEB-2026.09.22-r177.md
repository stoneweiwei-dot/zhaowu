# 昭梧更新報告｜ZW-WEB-2026.09.22-r177

## 本次改動

- 觀世錄新增長文《見局，破局，歸自己》，並置於同日文章的最新位置。
- 保留已上線的《沒有神蹟之後，人怎麼修行》，不做重複覆寫。
- r177 公開版本資訊同步到網站 footer／更新頁 fallback。

## 為什麼改

站主要求把本輪關於玄學、宗教、修行與「自我主權」的定稿放入網站「觀世錄」。現有內容已經包含《沒有神蹟之後，人怎麼修行》，因此本次不重複建同義文章，只新增另一篇較完整的「見局 → 破局 → 歸自己」文章，形成同一主題下的兩個互補文本。

## 影響範圍

- `src/lib/life-view-long-form/see-break-return.ts`
- `src/components/life-view-home-section.tsx`
- `src/lib/site-stats.ts`
- `/knowledge` 觀世錄內容流與首頁觀世錄最新內容摘要。

## 受保護範圍

- 不改八字／紫微／其他 deterministic calculation truth。
- 不改報告生成、登入、付款、Supabase schema、Storage 或使用者資料。
- 不新增外部 runtime 依賴。
- 不改 Vercel main-only Production 政策。

## 成本與配額

- 新增內容全部為 repository 文字，無新增 Supabase Storage。
- 不新增付費服務。
- 只允許通過 CI 後合併 main 觸發單一正式 Production release。

## 驗證狀態

- 合併前：Deploy gate、Engine suite、iPhone Safari 必須通過。
- 合併後：Production SHA 必須與 main SHA 一致。
- Production 必須驗證首頁可載入、`/knowledge` 可讀到《見局，破局，歸自己》，且《沒有神蹟之後，人怎麼修行》仍存在。

## 回滾

如新文章造成內容或編譯異常，可回滾 r177 的文章 import、文章檔與 release metadata；不影響命理核心、資料庫或既有使用者資料。
