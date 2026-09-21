# 昭梧更新報告｜ZW-WEB-2026.09.22-r173

## 本次改動

- 「今日指引」保留既有 IP 定位／天氣回退；定位失敗或無可用城市時，明確顯示「尚未確認位置」，不再用 Local／本地等假預設城市。
- 出生城市只有形成有效結構化 CityHit 才能提交；精確匹配候選可自動確認，未選中時顯示錯誤並自動捲回、聚焦城市欄位。
- 生辰保存後的 #bazi 首層只保留四柱快照與基礎解釋；BaziChart 技術細項維持預設收合，ChartTrustPanel 與 UnifiedBirthReport 收進「展開完整命盤細節」。

## 為什麼改

避免定位失敗時顯示虛假城市、降低出生城市選取摩擦，並把生辰保存後的長頁壓縮成先讀核心、需要時再展開完整細節的手機閱讀層級。

## 影響範圍

- `src/components/daily-almanac-widget.tsx`
- `src/components/city-picker.tsx`
- `src/components/analysis-form.tsx`
- 對應 location／city／home/report 回歸測試與 public release metadata

## 受保護範圍

不修改四柱、真太陽時、節氣、十神、起運等 deterministic calculation truth；不修改回答引擎、Auth、Payment、Supabase schema、夜模式、青玉小龍或其他首頁功能。

## 驗證狀態

- Source contract：已補 IP 回退文案、CityHit Gate／focus、#bazi 預設收合測試。
- Deploy gate：待 PR CI。
- Engine suite：待 PR CI。
- iPhone Safari：待 PR CI。
- Production：尚未部署；不得視為已上線。

## 回滾

回滾本 release 的 UI commit 即可恢復上一版；命理計算與資料結構未變，不需資料 migration。
