# r138 個人命書旁證／驗證層

- 契約：`docs/MINGSHU-CALL-LAYER.md`
- 個人命書固定為 `SIDE_CHANNEL`，不是 Calculation Truth。
- 昭梧來源層級固定為：`CALC_TRUTH` → `ZHAOWU_DERIVED` → `SIDE_CHANNEL` → `AI_INTERPRETATION`。
- 新增昭梧 capability / doctor、Mingshu 地點查詢、雙引擎 compare、ZW Chart Fingerprint。
- 所有衝突結果固定 `ZHAOWU_REMAINS_AUTHORITATIVE`，不得自動覆蓋 R6.2.1 主判。
- 真太陽時 placeId 遵守 Mingshu v1 `geonames:<id>` 契約。
- 禁止：把出生資料預設送第三方、把旁證寫進普通客人報告、把 CLI 裝進 Vercel 當核心引擎。
