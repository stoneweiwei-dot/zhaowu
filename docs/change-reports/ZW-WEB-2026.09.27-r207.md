# 昭梧更新報告｜ZW-WEB-2026.09.27-r207

## 本次改動

- 加入站主 2026-09-27 截圖材料的三組知識：
  1. 五行五常與功能語言：金義、木仁、水智、火禮、土信。
  2. 十干性格梗：只作 social shorthand／趣味文案。
  3. 辰戌丑未四庫速查：水庫／金庫／木庫／火庫、濕燥屬性與藏干。
- 新增 `ZW-OWNER-FIVE-ELEMENT-COGNITION-1.0`，接入 instruction registry。
- 四庫 runtime 顯示新增「濕土／水庫、濕寒土／金庫、燥土／木庫、燥土／火庫」教學標籤。
- 新增 r207 regression gate，防止「缺某五行＝人格缺陷」「十干梗＝正式人格」「沖庫必開／必發」回歸。

## 分層

本材料固定為 `OWNER_MATERIAL`／training & symbolic layer。

它不改 deterministic chart truth，不取代：
- R6.2.2 CURRENT governance
- R6.2.1 deterministic runtime
- P2 / P3
- 四庫既有主判與病藥／ODL／FC／承載鏈

## 明確不採用為硬規則

- 缺金／木／水／火／土，不直接推出人格缺陷。
- 五行過旺，不直接推出固定壞性格。
- 十干漫畫梗，不進正式人格主判。
- 四庫不等於財庫；沖庫不等於必開；開庫不等於必發財。
- 辰戌沖／丑未沖對住所、事業、感情、家庭的說法，只可在宮位、十神、原局種子與歲運鏈成立時作候選場景。

## 受保護範圍

- 不改排盤核心、calendar、chart truth。
- 不改 auth、payment、Supabase schema、Storage。
- 不新增公開卡片或新入口。

## 驗證

- Deploy gate
- Engine suite
- iPhone Safari CI
- r207 owner cognition regression
- Vercel Production exact SHA
- Supabase release_history evidence
