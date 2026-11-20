# 昭梧更新報告｜ZW-WEB-2026.09.15-r137

## 本次改動

- 觀世錄新增《你不是缺什麼，而是有些力量還沒有用對地方》，把《探索未至之境》36 頁素材中的可用主線重新整理：缺不等於用、旺不等於喜、旺勢要看有路／承載／出口，並修正「三個以上＝天賦」「印旺＝福」「缺金＝人格問題」等過度簡化。
- 新增 `docs/WFX-WANGSHI-ZHIHUA-v1.0.md`，作為 R6.2.1 之下的解釋層防錯模組；不改曆法、四柱、十神、旺衰或歲運 Calculation Truth。
- `BAZI_HARD_GUARDS` 新增四道 runtime 守門：旺不得直接等於喜／用／天賦；五常不得作人格道德判決；印旺不得直接等於有福；城市／髮色／衣著／方位／日柱俗訣只能作旁證。
- 新增 `/quiz/five-element-overdrive`「五行優勢內耗測驗」：10 題日常行為自評，分木／火／土／金／水五種常用功能，最高分並列時保留並列，不強迫破同分。
- 測驗固定標示：只反映目前自報行為傾向，不等同八字命盤、不判喜用神、不把結果寫入命理資料；不新增 Supabase 人格或測驗資料表。
- 首頁最新觀世錄文章展開後提供測驗入口；PWA shell 升至 `zhaowu-shell-r137`。
- 補回 r136 與 r136.1 缺失的正式 change report，保持最新背景音樂 Supabase bootstrap fallback 不被本批覆蓋。

## 為什麼改

站主提供的資料有一條值得保留的核心：與其把命盤當成「缺什麼補什麼」，更應該判斷哪股力量真正成勢、它有沒有路、能不能承載並轉成現實功能。但原資料同時混入「同一五行三個以上就是天賦」「印旺的人都很有福」「缺某五行可以直接判人格」「髮色／城市五行直接改運」等網路化簡化說法。本次把可用方法與不可直接主判的內容正式分層，避免之後的網站報告重新把俗訣當成 Calculation Truth。

趣味測驗則把「長板用過頭會變成內耗」轉成自我觀察工具，不反向冒充八字排盤。

## 影響範圍

- `/` 首頁「昭梧 · 觀世錄」最新文章與測驗 CTA
- `/knowledge` 觀世錄長文來源
- `/quiz/five-element-overdrive`
- 子平 runtime 解釋層 `src/lib/bazi/runtime-contract.ts`
- 研究規則 `docs/WFX-WANGSHI-ZHIHUA-v1.0.md`
- PWA cache 與公開 release ledger fallback

不修改：四柱計算、真太陽時、節氣、D60、紫微、西洋占星、登入、付費流程、Supabase schema、r136／r136.1 背景音樂 fallback。

## 驗證要求

- Deploy gate：必須 PASS
- Engine suite：必須 PASS
- iPhone Safari：既有必要檢查不得退化
- Production：`/`、`/knowledge`、`/quiz/five-element-overdrive` 均能打開
- Production commit：必須與合併後 `main` 完全一致
- Supabase：Production VERIFIED 後才寫入 `release_history` r137；不新增 schema

## 回滾

回退 r137 merge commit 即可移除新文章、WFX runtime guards 與趣味測驗，PWA cache 回到上一版。r136／r136.1 的背景音樂修復與既有命理 Calculation Truth 不受影響。