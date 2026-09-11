# 昭梧｜統一完整報告（ZW-FOCUSED-REPORT-2.3）

> 2026-09-11 更新：本版把「先答問題」提升為完整報告的最高呈現規則。Supabase／歷史記錄仍維持 `summary / body` 內容契約，前端則由可驗證資料派生 `Question Contract + Decision Report Model`，不恢復舊 01–09 多 session。

## 1. 核心原則

完整報告的閱讀順序固定為：

**答案 → 依據 → 風險 → 時間（題目需要時）→ 行動 → 命盤與延伸證據。**

第一屏必須先顯示使用者原問題與直接答案；不得先用性格、五行百科、神煞、圖像或方法說明佔據主畫面。

第一個答案區最多先呈現兩句核心判斷。完整說明保留在後段，不讓長文取代決策答案。

## 2. Question Contract

每次生成／呈現完整報告，都必須先建立內部 Question Contract：

- `sourceText`：使用者原始問題，不自行改題。
- `primaryQuestion`：主問題。
- `secondaryQuestions`：同一輸入中可辨識的次問題。
- `providedContext`：使用者已提供、但不是問句的背景。
- `kind`：career / love / money / health / choice / timing / self / past / home。
- `answerMode`：yes-no / comparison / timing / reason / forecast / action-plan / direct。
- `requirements`：沿用 `src/lib/core/answer-contract.ts` 已驗證的 when / where / compare / travel / medical / investment 等要求。
- `decisionTarget`：這次真正需要做出的現實判斷。

Question Contract 只做路由與呈現，不重新計算八字，不修改 deterministic core。

## 3. Decision Report Model

客戶端的第一層結構化欄位固定為：

```ts
{
  contract,
  directAnswer,
  confidence,
  confidenceLabel,
  confidenceBasis,
  biggestVariable,
  reasons[],
  risks[],
  timing[],
  actions[],
  sectionOrder[],
  supportingModules[],
  validationIssues[]
}
```

規則：

- `directAnswer`：開頭兩句內直接回答。
- `reasons`：只取本題相關的已生成判斷，不塞其他主題。
- `risks`：優先標示資料限制、現實條件與高風險邊界。
- `timing`：只有題目問時間或時間本身就是主題時才成為主卡。
- `actions`：至少一條可執行下一步。
- `supportingModules`：由問題相關性決定；大運／流年視圖不得在完全無關的題型中強行搶主畫面。
- `validationIssues`：供 QA 使用，不直接顯示給客戶。

這個結構是前端派生閱讀層，不改變目前資料庫 `summary / body` 相容性。

## 4. 原有 summary / body 契約

新生成報告仍只持久化兩個文字內容塊：

1. **summary**：包含直接結論、與本題有關的依據、時間節奏、現實行動與必要關係條件。
2. **body**：十二地支身體象義觀察。

舊 `conclusion / basis / timing / action / relationship / ninePages` 只讀相容，不得恢復成新生成主契約。

前端可以把同一份已生成內容派生成回答卡、四柱快照、五行視圖、大運視圖等，但不得為了 UI 再呼叫模型生成互相矛盾的多份答案。

## 5. 題型回答格式

- 要不要做：是／否／有條件可以 + 條件。
- A 還是 B：明確偏向 A/B；若條件不足，必須明說「暫不強選」並指出缺少哪些可比較資料。
- 什麼時候：時間窗口 + 可做什麼；無法精確時明確降級。
- 為什麼：核心原因排序，不用人格套話替代。
- 未來會怎樣：最可能情境 + 主要變數 + 風險。
- 工作／創業：方向、模式、條件、時機、退出成本。
- 感情：關係結構、對方實際行為、邊界、時間與下一步。
- 財務：現金流、風險、條件；不得把命理當投資標的或收益保證。
- 健康：只作傳統象義觀察，不作診斷、治療或延誤醫療。
- 搬遷／居住：方向只能作參考，預算、通勤、合約、安全與實際環境優先。

## 6. Relevance Gate

每一個模組在出現在主閱讀流之前，必須能回答至少一個問題：

1. 它會改變本題答案嗎？
2. 它能直接支持本題答案嗎？
3. 它能解釋本題的風險、時間或行動嗎？

三者皆否：移到延伸閱讀、收合或不顯示。

大運／流年目前只在 timing、career、love、money、home 或明確時間要求中進入主支援模組。

## 7. Evidence Gate

重要結論必須能追溯到目前已接入的命盤／reading 資料。術語只能作證據，不得代替答案。

不得：

- 用「宇宙提醒」「命中注定」等不可驗證語句替代主判。
- 把旁證當子平主判。
- 把五行百分比直接等同喜用神。
- 把未驗證的完整刑沖合害、病藥或流通鏈畫成已確定結果。
- 把時辰不確定的時柱／應期寫成硬結論。

## 8. Answer QA Gate

完整報告至少檢查：

- 主問題存在。
- 直接答案存在。
- 本題至少有一組支持理由。
- 至少有一條現實行動。
- 時間題不能缺時間回答；資料不足時必須明確降級。
- 二選一題必須給方向，或明確說條件不足而不強選。
- 不用無關人格套話填滿主畫面。
- 不洩露內部推理、UUID、實作說明、模型狀態或驗收文案。

## 9. UI 第一層

第一屏：

- 使用者原問題
- 兩句直接答案
- 判斷把握（文字等級，不使用虛假精準百分比）
- 最大現實變數

第二層：按題型動態排序的「為什麼／風險／時間／現在怎麼做」。

第三層：命盤基礎四柱快照，日柱視覺突出；藏干可展開；時辰未知顯示未定，不補造資料。

第四層：程式化命之書／五行視圖。大運視圖只在 Relevance Gate 通過時出現。

完整 summary 改為收合「完整說明」，避免第一屏重複答案；body 保持後置。

## 10. 身體象義系統

身體欄仍採固定三層：

- 地支固定部位：午頭、巳右肩、未左肩、辰右臂、申左臂、卯右腰、酉左腰、寅右大腿、戌左大腿、丑右小腿、亥左小腿、子下陰。
- 季令與臟腑本氣：寅卯辰看春木肝膽筋目；巳午未看夏火心神與中焦；申酉戌看秋金肺、皮膚與燥；亥子丑看冬水腎、下焦、水液與封藏。
- 六組對沖軸：子午、丑未、寅申、卯酉、辰戌、巳亥。

只輸出「觀察區域／傳統體質象／生活信號」；症狀持續、加重或影響活動時，以實際醫療檢查為準。

## 11. 視覺規格

詳見 `docs/REPORT-VISUAL-SYSTEM.md`。核心方向：宋式紙本命理報告 × 現代手機資訊圖表。

- 主背景 `#F6F1E7`
- 卡片 `#FFFDF8`
- 次背景 `#EEE9DE`
- 正文 `#242620`
- 次文字 `#686A62`
- 松綠 `#355E50`
- 朱砂 `#A64D3E`
- 古金 `#C19A55`
- 黛青 `#456B72`
- 木 `#64865D`
- 火 `#B95B49`
- 土 `#AF8E55`
- 金 `#C2A25B`
- 水 `#4382A0`

iPhone 正文不得低於 16px；主回答 21–24px；模組標題 25–28px；極小補充不得低於 13px。

## 12. 相容與回滾

- 歷史 Supabase 記錄繼續讀取 `summary / body` 與舊鍵相容層。
- 本版不做資料庫 migration。
- 若 answer-first UI 發生 production regression，可回滾 `decision-report-model.ts`、`paid-report-pages.tsx` 與對應 CSS，而不改八字核心、auth、payment 或歷史資料。
