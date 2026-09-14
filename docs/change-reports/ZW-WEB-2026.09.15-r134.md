# 昭梧更新報告｜ZW-WEB-2026.09.15-r134

## 本次改動

- 「昭梧 · 觀世錄」新增長篇文章《相由心生，不是命由臉定：一張臉如何留下心性的痕跡》。
- 將原始素材中「好命相、修心改面相、能量場」的內容重新分層：保留可觀察的神情、姿態、語氣、睡眠、壓力與人際反應；明確排除用固定五官直接判定善惡、富貴、福報、人格或命運的推論。
- 將「氣場」改寫為日常可觀察的非語言訊號與自我調節能力，不把未證實的神祕能量場描述成科學事實。
- 加入一張 9:16 STONE 原創宋式水墨 WebP 插圖 `/articles/face-mind-cultivation-2026-09-14.webp`；圖片延遲載入，不阻塞文章文字。
- 保留剛上線的十神關係文章，新的面相／修心文章置於觀世錄最新位置；長文總數由 13 增至 14。
- 公開 release fallback 升級至 `ZW-WEB-2026.09.15-r134`，PWA shell cache 同步升至 `zhaowu-shell-r134`。

## 為什麼改

站主要求把原始面相／修心素材重新分析後正式加入觀世錄並配圖。此前 PR #334 以舊 `main` 為基底，之後 r133 的十神關係文章先行合併，導致版本號與觀世錄 registry 發生衝突；本版本以最新 `main` 重建，保留 r133 全部有效改動，只新增本次文章與圖片，不覆蓋十神文章。

## 影響範圍

- `src/lib/life-view-long-form/face-mind-cultivation.ts`
- `src/lib/life-view-long-form.ts`
- `public/articles/face-mind-cultivation-2026-09-14.webp`
- 首頁「昭梧 · 觀世錄」最新文章摘要
- `/knowledge` 觀世錄文章庫
- `src/lib/site-stats.ts`
- `public/sw.js`
- 觀世錄與 release ledger regression tests

受保護範圍保持不變：八字／紫微／D60／西占等 calculation truth、登入／站主權限、Supabase schema、付款、客資、報告歷史、命理計算與既有多語系統均不修改。

## 回滾

移除 `FACE_MIND_CULTIVATION_LONG_FORM` 在觀世錄 registry 的登記及其文章／圖片資產，將 release fallback 與 PWA cache 回退到 r133，即可恢復上一版。無資料庫 schema 或使用者資料回滾需求。

## 驗證狀態

合併前必須通過 `Deploy gate`、`Engine suite`、`iPhone Safari`；合併後需確認 Production 精確 commit、首頁、`/knowledge` 與圖片 URL，並把 r134 寫入 `public.release_history`。