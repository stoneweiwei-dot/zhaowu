# ZHAOWU Illustrated Destiny System v1

「昭梧手繪命書系統」是已完成主判的單向視覺轉譯層。命理負責判，插畫負責懂，分享卡負責傳。本版本在首頁出生入口旁提供一幅不含命理判詞的提問小景，在完整命書插入本地 SVG 場景，並提供 9:16、4:5、1:1 SVG 分享卡下載；不建立新的命理模組，也不呼叫圖片服務。

## Current public route

首頁 `src/routes/index.tsx` → `ResultView` → 使用者選擇「補充」後的 `FocusedReportSections`。首頁直接答案和下一步先顯示。現行 `FocusedReportSections` 依序呈現概括、插頁、身體附註與收合的判斷備註。

目前主路徑沒有掛載 Comic Lite 元件；`unified-birth-report.tsx` 是相容／保存報告路徑，並非首頁目前的報告呼叫鏈。首頁小景只呈現固定提問文案，不讀取 chart 或 report model；舊 Comic Lite 元件與資料可留作歷史相容，不能重複掛進此 public flow。

## Data and translation gate

命書插頁唯一輸入為 `AnalysisResult`（canonical chart、final reading、question）與 `buildDecisionReportModel` 產生的 Question Contract／決策欄位。插頁 sourceClaim 取自既有 `nextAction`，sourceEvidence 取自 direct answer、reasons、actions；沒有 nextAction、答案缺漏或受限主判信心時不產生插畫。未知出生時辰會將插頁 confidence 降為 `limited`，保留已有主判支持的內容，不補造時柱或歲運精度。

每個 scene 保存並呈現 sourceClaim、sourceEvidence、sceneType、visualMetaphor、caption、confidence。Metaphor 僅是依題目類別選擇的固定構圖說明；不產生回饋主判的資料。人物不依日干或五行著色，圖中色彩不帶力量、吉凶含義。圖像與文字共用同一判斷模型。

## Visual and cost

本地 deterministic SVG，以宋式冊頁的淡墨、暖紙、礦物色、小人物和留白呈現。SVG 若載入或繪製失敗，文字報告仍可用。沒有 AI image provider、遠端 asset 或 Supabase 寫入；免費報告不增加圖片成本。

## Scope and migration

- 首頁：出生入口旁提供一幅小景與最多兩句提問文案，不搶出生資料主流程，也不帶 chart-derived claim。
- 完整命書：在概括與身體附註之間插入一幅場景與一句白話行動 caption，依據放入使用者可展開的折疊層。
- 分享卡：使用者主動展開後可下載同一場景的 9:16、4:5、1:1 SVG；包含短文、品牌與 QR 預留框。
- Legacy：Comic Lite、ninePages、舊漫畫與 ReportDragonSticker 保留相容；目前 public call chain 無引用，不予恢復。
- FREE/FULL：插頁只在完整命書生成後顯示，不影響免費答案與下一步。沒有訂閱、provider 或 schema 變更。

## Verification contract

Regression coverage checks canonical chart immutability, missing/limited claim suppression, unknown-time confidence downgrade, claim provenance, provider-free rendering, non-judgemental homepage entry, report placement, share formats and legacy non-duplication. Mobile visual acceptance remains required at 390px, with 16px captions, no overflow, night paper/deep ink contrast, and English copy fitting its container. Run the existing Today visual regression without updating screenshot baselines.
