# 昭梧更新報告｜ZW-WEB-2026.09.11-r110

## 本次改動
- 完整命理報告改為 answer-first：第一屏先顯示客人原始問題、兩句內直接答案、判斷把握與最大現實變數。
- 新增 `Question Contract` 與 `Decision Report Model`：辨識主問題、次問題、題型與 answer mode，將內容派生成「為什麼／風險／時間／現在怎麼做」四類卡片，按題型動態排序。
- 新增 Answer QA gate：檢查主問題、直接答案、支持理由、行動、時間題與二選一題是否實際回答要求；QA 結果只作內部標記，不向客戶暴露。
- 保留既有 `summary / body` 持久化契約；完整 summary 下移為收合「完整說明」，避免第一屏再次重複答案，不做資料庫 migration。
- 新增四柱核心快照：年／月／日／時四柱同屏，日柱突出，藏干可展開；時辰未知顯示未定，不補造資料。
- 五行視覺改為固定品牌色，新增「相生路徑」視圖，並明示相生順序與百分比不能單獨代表完整流通判定。
- 大運／流年視圖加入 Relevance Gate：只有時間、工作、感情、財務、家宅等相關題型才進入主閱讀流。
- iPhone 閱讀字級提升：主回答 21–24px、正文 17px、模組標題 25–28px，補充資料最低 13px；同步放大五行圖表、tabs、facts 與說明文字。
- 報告配色統一為宣紙暖白、松綠、朱砂、古金、黛青與固定五行色。
- Release fallback 推進至 r110 / 累計更新 110。

## 為什麼改
- 現有完整報告雖然已能在 summary 首段回答問題，但 UI 仍容易把技術資料、長文與視覺模組放到與答案同等的位置，客戶需要自己從報告中找結論。
- 本次把「問 A 就先答 A」落成前端資料模型與呈現契約，讓答案、證據、風險、時間與行動形成固定資訊階層，而不是依 AI 文長決定版面。
- 同時保留既有 `summary / body` 內容與歷史相容層，避免為視覺改版觸碰 Supabase schema 或重寫已穩定的完整報告儲存格式。
- 五行百分比只適合做氣勢可視化，不能直接等同喜用或真正流通，因此本次在 UI 中加入明確方法邊界。

## 影響範圍
- `src/lib/report/decision-report-model.ts`
- `src/components/paid-report-pages.tsx`
- `src/components/report-visual-book.tsx`
- `src/focused-report.css`
- `src/report-visual-book.css`
- `src/report-answer-first-r110.css`
- `src/main.tsx`
- `src/lib/site-stats.ts`
- `docs/FOCUSED-REPORT.md`
- `scripts/report-answer-first-r110.test.mjs`
- `scripts/release-ledger.test.mjs`
- `package.json`
- 本變更報告

## 保護範圍
- 不修改八字排盤、真太陽時、月令、日主、藏干、十神計算、大運起排、格局、病藥、喜用或其他 deterministic calculation。
- 不修改 R6.2.1 子平主判優先級與旁證隔離規則。
- 不修改 auth、payment、Supabase schema、使用者報告資料結構或歷史記錄。
- 不恢復舊 01–09 固定多 session／`ninePages` 報告生成。
- 不把五行百分比當作喜用神，也不把「相生路徑」視覺當成已驗證的完整刑沖合害／流通作用鏈。
- 不建立 AppDeploy、Lovable、Netlify 等第二個 production；正式站仍只允許 Vercel `stone-zhaowu-official`。

## 回滾
- 回滾 `decision-report-model.ts` 與 `paid-report-pages.tsx`，恢復 r109 的連續 summary/body 主呈現。
- 回滾 `report-visual-book.tsx`、`focused-report.css`、`report-visual-book.css` 與 `report-answer-first-r110.css`，並移除 `main.tsx` 的 r110 scoped CSS import。
- 將 `site-stats.ts` 與 `release-ledger.test.mjs` 恢復 r109，刪除 r110 測試與本報告。
- 本次沒有資料庫 migration，因此回滾不需要資料修復。

## 驗證
- 必須通過 Deploy gate、Engine suite、TypeScript、Vite build 與 iPhone Safari 核心套件。
- 390–430px 必須無整頁橫向溢出；第一屏直接答案不得被圖表、浮動元素或長文遮擋。
- 二選一／時間題的 Question Contract 與 Decision Report Model 必須滿足對應 QA gate。
- 時辰未知時，四柱快照不得補造時柱，大運／精細時間結論需維持既有降級規則。
- 正式站至少驗證首頁、分析結果／完整報告入口、已保存報告讀取與 production runtime errors。
- 合併後 Vercel Production 必須 `READY` 且 `githubCommitSha == main HEAD`。
- 只有 Production 驗證通過後，才把 r110 寫入 Supabase `public.release_history`。
