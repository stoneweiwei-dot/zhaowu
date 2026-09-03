# 昭梧｜Supabase 指令正式啟用對照 v1.0

狀態：ACTIVE RUNTIME CONTRACT

本文件只處理 Supabase 中具有「規則／指令」性質的設定，不把統計資料、遷移狀態或未驗證素材誤當客戶分析規則。

## 已正式接入

- `metaphysics_default_protocol`：已由 `docs/METAPHYSICS-DEFAULT-PROTOCOL-v1.0.md`、`src/lib/core/method.ts` 與既有測試執行；不另建第二套路由。
- `ziwei_interpretation_grammar`：已由 `src/lib/ziwei/interpretation-grammar.ts` 與紫微報告層執行；計算真值與解釋層保持分離。
- `paid_report_style`：保留可兼容的四柱繪意、9:16、命局證據→視覺象徵與水印要求；已移除舊九頁唯一結構，正式服從「總體概括 → 身體需要注意」連續紙面，命之書／運之書／分享卡排在文字主報告之後。
- `classic_passage_library`：網站報告可透過只讀 RPC 取得一條已核對的古籍原句；資料表仍不向匿名或一般登入用戶開放。RPC 只讀取 `verified + is_direct_quote=true + active` 的內容，失敗時不阻塞文字報告。
- `classical_bazi_research_digest`：只作後台研究／吸收流程，不直接注入客戶結論；研究結果仍須按 `docs/ANALYSIS-INGESTION-POLICY.md` 分層、去重、驗證後才進分析庫。

## 不屬於待啟用指令

- `migration_state`：部署／資料庫遷移狀態。
- `visitor_count`：訪客統計。

## 明確不強行上線

- `classic_passages` 內標記 `pending`、`is_direct_quote=false` 的 STONE 主理人素材仍保留為 OWNER_MATERIAL，不冒充古籍原文。
- 來源不可讀、來源層級未核定、或含未驗證科學／能量機制的文字，不直接進客戶判斷。
- 舊 `nine_page_only` 不得復活。

這個啟用層的原則是：Supabase 可作為規則與素材來源，但網站只消費已分類、已驗證、與當前產品契約相容的部分；任何資料讀取失敗都不得拖死核心排盤與文字答案。
