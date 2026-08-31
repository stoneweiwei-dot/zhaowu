# 昭梧更新報告｜ZW-WEB-2026.08.31-r15

日期：2026-08-31（AEST）
狀態：Production 已驗證

## 本次改動

1. 首頁人生試卷移除「方向」與「最近狀態」兩組預設選項，改為直接填寫真正想問的問題。
2. 問題與出生資料重新編為 01、02；提交時只傳送使用者原始問題，不再在問題前拼接選項標籤。
3. 首頁與答卷三語引導文案同步改為「直接寫問題＋出生資料」，避免舊選項指示回流。
4. 觀世錄手機配圖由約 150px 的小碎片放大為最高 232px 的中等裁切插圖，左右錯落置於段落之間；保留 `object-fit: cover`，不恢復整張長圖。
5. 新增與更新回歸測試，鎖定選項不再出現、問題仍原樣提交、手機插圖寬度可讀且頁面無橫向溢出。

## 為什麼改

方向與近況按鈕重複替使用者預設問題，令手機首頁過長、過擠；使用者本來就能直接輸入要問的內容。觀世錄現有裁切方向正確，但尺寸小到看不清畫面，因此保留文章內散落裁切的形式，只放大到手機可辨識的閱讀尺寸。

## 影響範圍

- 首頁人生試卷欄位、引導文案與問題提交內容
- 首頁觀世錄展開文章的配圖尺寸與手機排列
- 全站 release footer 版本資訊更新為 r15

## 不改範圍

- 四柱、真太陽時、月令、格局、喜用、歲運與報告生成邏輯
- 出生資料欄位、城市選擇、登入後資料保存與報告歷史
- 青玉小龍現行頁面內排版與快捷入口
- Auth、payment、Supabase schema、Edge Functions 與其他路由
- 觀世錄文章文字與原始圖片資產

## 回滾

如首頁表單回歸，可回滾 `src/components/analysis-form.tsx`、`src/routes/index.tsx` 與 `src/lib/report/quiz-copy.ts`；如文章排版回歸，可回滾 `src/content-layout-fixes.css`。本版不涉及資料庫 schema 或命理核心。

## Production 驗證欄

- GitHub PR：#181
- Merge commit：`306903842b80bcd6262f65d3dfa4ee807a690e14`
- CI：Production CI #841 通過（283 項 deterministic tests、TypeScript、Vite build、iPhone Safari）
- Vercel deployment：`dpl_HyyzbHp1PGDwBoHe5kUEhwBHbz8v`（READY，production alias 已指向）
- Supabase：`release_history` 已寫入 r15；無 schema / Edge Function 變更
- Production routes：`/`
- 驗證重點：iPhone 390×844 下首頁無方向/近況選項；問題與出生資料保留；點開觀世錄文章後插圖清晰可見、仍為裁切片段、無橫向溢出
- 結果：正式站 r15 可見；首頁方向/近況選項為 0，問題框與出生資料仍可見；已實際點開《人生修行的五個支柱》，文章顯示兩張 `object-fit: cover` 裁切插圖且無橫向溢出。iPhone Safari 回歸鎖定 390px 視窗下插圖寬度為 180–240px。
