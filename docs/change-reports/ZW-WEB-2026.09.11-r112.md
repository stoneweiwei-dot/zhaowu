# 昭梧更新報告｜ZW-WEB-2026.09.11-r112

## 本次改動

- 完整報告加入「五行功能訓練」文字模組，只消費既有八字結構化結果，不修改排盤與命理 calculation truth。
- 五行功能不再用「缺什麼補什麼」邏輯；保留六種功能狀態與明確 action gate，只有「有利但不足／有利但受阻」允許主動增強功能。
- 上游結構不足時 fail closed：不硬指定主訓練元素，不把 provisional 資料升格成確定喜用神。
- 完整報告同步加入「個人靈光／脈輪」象徵文字，只作人格與人生主題視覺語言；禁止醫療、能量檢測、宗教等級、前世身份與偽百分比聲稱。
- 免費／not_required 報告不呼叫任何圖片生成 API；客戶前台不顯示內部 evidence 或 prompt。
- 付費視覺 Blueprint 可先建立兩個 9:16 prompt，但真正準備圖片生成 job 前必須再次通過 `paid_basic|paid_full + paymentStatus=paid` Gate。
- support-first／過度／不宜增加等狀態的付費圖不得偷改成直接補元素；prompt 必須保留「先通關／疏導／維持／不增強」語義。
- 新增 `docs/FIVE-ELEMENT-FUNCTIONAL-TRAINING.md` 作為本模組當前契約，並把 regression test 納入 deploy gate。

## 為什麼改

站內原本已有「五行功能測驗」，但完整命理報告缺少一個能把既有結構判斷翻譯成現實行動的方法；同時，五行生活建議若直接從數量、百分比或表面缺失推「補法」，會違反目前 R6.2.1 與 Focused Report 對正式取用／喜用的驗證邊界。

r112 因此把五行改成「功能訓練／調節」：先讀月令、承載、格局病藥與已存在的結構證據，再決定是訓練、維持、疏導、停止增加或先建立支持條件。靈光／脈輪只作象徵視覺層，不反向覆蓋子平主判。

## 影響範圍

客戶端：

- 完整報告在答案、命盤與命之書後增加五行功能訓練與象徵靈光文字。
- 三語支援 `zh-Hant / zh-Hans / en`。
- 免費前台保持 0 圖片生成呼叫；文字報告不依賴圖片 provider。
- 英文版不顯示內部中文病藥 evidence，避免多語洩漏。

命理層：

- 不修改 `calendar.ts`、`chart.ts`、`interpret.ts` 或其他鎖定 calculation core。
- 不用五行百分比直接決定喜用或補法。
- 病藥／結構證據不足時保留不確定性。

付費視覺：

- 本版只建立 Blueprint 與 payment gate；不把圖片 provider 接到免費報告。
- 9:16 圖像 prompt 明確要求宋系宣紙／礦物淡彩、高端手機圖譜，文字與 `STONE 原創` 水印由產品後處理層完成。

## 驗證

發布前必須通過：

1. `npm run test:deploy`
2. `npm run build`
3. `scripts/five-element-functional-training.test.mjs`
4. GitHub PR `Deploy gate`
5. GitHub PR `iPhone Safari`
6. 合併後 Vercel Production 狀態 `READY`，`githubCommitSha` 必須等於當時 `main` HEAD。
7. Production 實際檢查完整報告：文字模組可見、免費報告無圖片生成依賴、三語無明顯殘留或溢出。

## 回滾

如新報告模組造成 UI 或內容回歸，可回滾：

- `src/components/five-element-training-block.tsx`
- `src/lib/report/five-element-functional-training.ts`
- `src/lib/report/aura-chakra-blueprint.ts`
- `src/lib/report/paid-visual-blueprint.ts`
- `src/components/paid-report-pages.tsx` 中對 `FiveElementTrainingBlock` 的接入

回滾不需要修改 Supabase schema，也不影響八字排盤、auth、歷史報告、命請圖與既有 report image delivery。
