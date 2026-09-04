# 昭梧更新報告｜ZW-WEB-2026.09.05-r49

## 本次改動

- 修正 `/yizhangjing` 前世今生頁的 D60 出生資料契約。
- 「填寫出生資料」新增出生時間的「時／分」欄位，精確到分鐘；新增出生地搜尋欄位與 D60 時間精度確認。
- 一掌經與 D60 共用同一次報告輸入：一掌經直接使用本次出生時間排時宮；D60 只在本次同時具備精確分鐘、出生地與精度確認時才計算。
- 移除 D60 對登入帳戶 `user.birthData` 的隱性 fallback。D60 不再從舊帳戶資料、其他報告或不同來源自動補算。
- 若時間未知、未確認精度或未選出生地，一掌經仍正常生成；D60 明確顯示資料不足並不作判定。
- 保留 D60 的 ±2 分鐘敏感度測試，且改為只針對本次報告的出生資料執行。
- 移除前世今生頁反覆出現的裝飾性小 logo／emblem（小法輪、蓮花、法螺、寶瓶、寶傘、吉祥結等）；保留既有卡片比例、文字層級、留白、色調與功能性圓章。

## 為什麼改

目前正式站的 D60 會在前世今生表單沒有精確分鐘與出生地輸入的情況下仍產生結果，因為元件實際讀取的是登入帳戶裡既存的 `birthData`。這會讓使用者誤以為 D60 是根據剛剛填寫的資料計算，也可能把另一份出生資料混入本次報告。D60 對分鐘高度敏感，因此資料來源必須與當次報告一一對應，不能隱性補值。

同時，站主已確認目前報告卡片排版基本可接受，但裝飾性小 logo 再次回歸，造成視覺雜訊，因此本版只移除裝飾物，不重新設計已批准的卡片結構。

## 影響範圍

- `/yizhangjing` 前世今生出生資料表單。
- 一掌經時宮輸入方式：由兩小時時辰選單改為精確時／分；算法仍使用同一 `buildPalm` 引擎。
- D60 資料來源、顯示條件、±2 分鐘敏感度旁證。
- 前世今生頁裝飾性 emblem／logo 顯示。
- 本機專題歷史紀錄的輸入摘要會記錄精確時間與已選出生地。

## 保護範圍

未修改：一掌經 `buildPalm` 核心算法、D60 天文／Lahiri 計算公式、其他八字／紫微／七政／報告引擎、登入與權限、付款、Supabase 使用者資料、Loading gate、首頁、背景音樂、其他路由與全站三語系統。D60 資料不足時採 fail-closed；不影響一掌經文字交付。

## 驗證狀態

- 新增 source-contract regression test，鎖定精確分鐘、出生地、D60 當次資料事件與「不得讀取 user.birthData」。
- 新增視覺回歸 source guard，鎖定前世今生元件不得再引用 `/emblems/` 或 `BrandSeal`。
- GitHub CI／build：本版本合併前必須通過。
- Vercel Preview：本版本合併前必須為 READY。
- Vercel Production：合併後必須核對 exact main SHA 與 production READY。
- `/yizhangjing` 正式站：需核對表單可輸入時、分、出生地；未提供完整 D60 資料時不得出現 D60 判定；提供完整資料時才生成 D60。

## 回滾

將 `src/components/palm-standalone.tsx`、`src/components/d60-karma-section.tsx`、`scripts/d60-report-input.test.mjs`、`src/lib/site-stats.ts` 與 release-ledger test 回復到 r48；刪除本 r49 change report。回滾不涉及資料庫 schema、登入、付款或其他命理引擎。
