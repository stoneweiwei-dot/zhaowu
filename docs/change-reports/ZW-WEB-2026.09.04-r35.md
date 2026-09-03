# 昭梧更新報告｜ZW-WEB-2026.09.04-r35

## 本次改動

- 新增 `src/lib/report/practical-cultivation-advice.ts`，把 2026-09-04 站主提供的《DeepSeek - 探索未至之境(8)》中已批准、可落地的修心素材整理成六組三語建議：
  - 修心重於形式
  - 善良需要界線
  - 改變要落成具體方案
  - 用逆境照見自動反應，但不神聖化苦難
  - 擁有不等於占有
  - 內在反省與外在現實處理並行
- 在既有 `buildMindAdviceLines()` 中接入新層：`修心與環境` 專項仍優先，新實踐層其次，原一般建議最後兜底。
- 每份報告仍最多兩條建議，不新增 report session、卡片層、付費頁或計算流程。
- 新增來源吸收記錄與七篇文章草稿綱要，正式發布文章前仍須與既有文章庫去重／合併。
- 新增回歸測試，防止超自然、疾病因果與未核實科學說法滲入客戶建議文案。
- 公開 release fallback 更新為 `ZW-WEB-2026.09.04-r35` / 累計更新 `35`。

## 為什麼改

這份來源同時包含兩種性質完全不同的內容：一部分是可落地的自省、界線、行動與依附處理；另一部分則混有佛道語彙、民間靈修敘事、DeepSeek 二次評論，以及「松果體＝天眼」「接靈／地魂」「疾病是業障」等未證實主張。

本次只把第一部分吸收到昭梧既有報告建議層，第二部分全部隔離。這樣可以增加報告的實用性，而不把二手靈修敘事冒充成經典、科學或命理計算真值。

## 影響範圍

會變更：

- `src/lib/report/mind-advice.ts`
- `src/lib/report/practical-cultivation-advice.ts`
- 命中相關問題時的修心／處世建議文字
- `src/lib/site-stats.ts` 的公開版本 fallback
- 來源研究與文章草稿文件

不變更：

- 八字排盤、真太陽時、四柱、藏干、十神、大運等 deterministic calculation truth
- 紫微排盤與解讀語法
- auth / login / account 權限
- payment
- Supabase schema 與客戶資料
- report session／頁面結構
- 圖像 provider
- production routing
- 多語系架構

## 安全邊界

- 此 PDF 是 DeepSeek 對截圖的二次整理，不是一手佛教／道教／經典來源。
- `松果體＝天眼`、以現代物理證明超自然知覺、`接靈`、`地魂`、乩身／通靈、業障致病等全部維持 `QUARANTINE`。
- 健康、法律、財務與安全問題仍以現實專業處理為準。
- 不從本材料新增任何八字／紫微計算規則。

## 測試

新增 `scripts/practical-cultivation-advice.test.mjs`，鎖定：

- `OWNER_MATERIAL` 分層
- 每次最多兩條
- 原有 `修心與環境` 優先級不變
- QUARANTINE 防線
- 客戶建議正文不出現指定超自然主張

同步更新 `scripts/release-ledger.test.mjs` 至 r35／35，確保公開 footer fallback 與本更新報告一致。

## 回滾

回滾本 release commit 即可：移除新的 practical cultivation module 與 import，並把 `SITE_RELEASE_FALLBACK` 恢復 r34／34。本次沒有資料庫 migration，也沒有客戶資料變更，因此不需要資料庫回滾。

## 驗證狀態

撰寫本檔時為 release candidate：**PENDING CI / PREVIEW / PRODUCTION VERIFICATION**。

只有在 exact merged SHA 於唯一 Vercel 專案 `stone-zhaowu-official` 變成 Production `READY`，且正式站相關路徑驗證後，才可標為完成；最終 deployment ID、source commit 與驗證說明寫入 `public.release_history` 的 `ZW-WEB-2026.09.04-r35` / `update_number=35`。
