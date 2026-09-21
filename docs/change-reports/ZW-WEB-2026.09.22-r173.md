# 昭梧更新報告｜ZW-WEB-2026.09.22-r173

## 本次改動

- 「今日指引」保留低摩擦 IP 定位，但先核對 IP 時區與瀏覽器時區；不一致時拒絕該城市並顯示「尚未確認位置」，可由使用者主動使用瀏覽器定位。
- 出生城市只有形成有效結構化 CityHit 才能提交；精確匹配或唯一無歧義候選可自動確認，未選中時只在欄位內顯示錯誤並自動捲回、聚焦。
- 生辰保存後的 #bazi 首層只保留四柱快照與基礎解釋；完整命盤細節預設收合。\n- 青玉小龍在新分析生成後主動承接閱讀，提供「看依據／看風險／看下一步」三個入口。

## 為什麼改

避免 VPN／Private Relay／IP 判斷錯位時顯示虛假城市，降低出生城市選取摩擦，壓縮命盤長頁，並讓生成結果後的閱讀能由小龍自然承接。

## 影響範圍

- `src/components/daily-almanac-widget.tsx`
- `src/components/city-picker.tsx`
- `src/components/analysis-form.tsx`
- 對應 location／city／home/report 回歸測試與 public release metadata

## 受保護範圍

不修改四柱、真太陽時、節氣、十神、起運等 deterministic calculation truth；不修改回答引擎、Auth、Payment、Supabase schema、夜模式或首頁主流程。小龍只讀取既有 DecisionReportModel，不另造判斷。

## 驗證狀態

- Source contract：已補 IP／瀏覽器時區 sanity check、瀏覽器定位、CityHit Gate／focus、#bazi 預設收合與小龍結果接續測試。
- Deploy gate：待 PR CI。
- Engine suite：待 PR CI。
- iPhone Safari：待 PR CI。
- Production：尚未部署；不得視為已上線。

## 回滾

回滾本 release 的 UI commit 即可恢復 r172；命理計算與資料結構未變，不需資料 migration。
