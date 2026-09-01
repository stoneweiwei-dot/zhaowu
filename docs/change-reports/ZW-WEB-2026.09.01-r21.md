# 昭梧更新報告｜ZW-WEB-2026.09.01-r21

日期：2026-09-01（AEST）
狀態：待 Production 驗證

## 本次改動

1. 鎖定 `docs/METAPHYSICS-DEFAULT-PROTOCOL-v1.0.md` 為昭梧命理預設協議：子平八字主判；紫微只作現象／場景驗證；一掌經只作文化／精神象徵；風水只在真實空間資料充分時啟用。
2. 新增 `docs/ZIWEI-INTERPRETATION-GRAMMAR-v1.0.md` 與 `src/lib/ziwei/interpretation-grammar.ts`，將紫微固定為七層語法：星曜功能 → 宮位場景 → 四化變化 → 輔煞過程 → 三方四正關聯 → 大限流年觸發。
3. 四化不再作吉凶標籤：祿＝輸入／獲得，權＝推動／承擔，科＝顯化／認可，忌＝阻滯／代價。
4. 新增十四主星及主要可化輔曜功能詞庫、十二宮場景邊界、七級廟旺解釋、空宮／身宮／多主星同宮規則，以及宮干自化未有明確 profile 前不得混用的限制。
5. 輔煞只改變過程性質；羊陀火鈴空劫不得直接映射疾病、手術、車禍、死亡等重大事件。
6. 新增本命／大限／流年疊層證據規則：單一流年只作 observation；至少兩層一致才可提高語氣；三層一致只稱重複引動，仍不得保證事件必然發生。
7. 身體模組固定為壓力與承載提示，不做疾病診斷、壽夭、必手術或停藥建議。
8. 新增 `grammar-summary.ts` 並接入正式 `/ziwei` 專題報告，客戶現在會看到「四化與歲運結構」一節；歷史保存亦同步帶入該段。
9. `routeMethods` 現在可在可靠時辰與 deterministic Ziwei data ready 時把紫微標記為已執行，否則維持「資料未接入」，不強排。
10. Supabase `site_settings` 已存入 `metaphysics_default_protocol` 與 `ziwei_interpretation_grammar` 兩個私有版本化設定，作為網站／Agent 的持久專案記憶與 runtime policy source。
11. 新增 regression tests 鎖定四化語法、醫療邊界、十二宮限制、歲運疊層、方法路由與 live grammar synthesis。

## 為什麼改

原本昭梧已具備可靠的紫微 deterministic 排盤資料層，但「計算真值」與「解釋語法」仍未完全分離；站主新補充的四化、身體與歲運材料若直接當事件表使用，容易出現化忌＝凶、煞曜＝疾病、單一流年＝重大事件等過度推論。本次把可保留的傳統／現代象義轉成可編碼的解釋語法，同時把醫療直斷、死亡災禍、未驗證數值權重隔離到 QUARANTINE。

## 影響範圍

- `/ziwei` 紫微斗數專題報告
- 命理方法路由與 Ziwei readiness 顯示
- 紫微解釋層與內部 evidence policy
- 命理知識入庫規則
- Supabase 私有命理 runtime policy
- 首頁公開 release footer 版本資訊

## 不改範圍

- 子平八字 calendar、四柱、格局、病藥計算核心
- 紫微安星、十四主星定位、四化落星、五行局等 deterministic calculation truth
- 登入、付款、帳戶權限
- 一掌經排盤核心
- Gallery／圖片生成流程
- Supabase schema

## 算力策略

- 排盤、星曜、四化、宮位關係、大限流年：TypeScript deterministic engine，只算一次。
- 同一報告共享 engine snapshot／evidence trace，禁止每頁重算。
- AI 若啟用，只做白話綜合與客戶問題映射，不重算命盤。
- 免費層優先 zero-AI；付費層才增加語言綜合。
- 圖文分離，AI／圖片失敗時文字結果 fail-open。

## 回滾

回退本 PR 新增的命理協議、interpretation grammar、grammar summary、`routeMethods` 與 `/ziwei` 報告接線；將 `SITE_RELEASE_FALLBACK` 回退 r20；Supabase 私有設定可保留作歷史或回退至上一版本 JSON。不得回退既有 Ziwei deterministic calculation truth layer。

## Production 驗證欄

- GitHub PR：#190
- Merge commit：待填
- CI / Build：待填
- Vercel deployment：待填
- Production `/ziwei`：待填
- Supabase：`metaphysics_default_protocol = zhaowu_metaphysics_default_v1.0`；`ziwei_interpretation_grammar = zhaowu_ziwei_interpretation_v1.1`；無 schema 變更
