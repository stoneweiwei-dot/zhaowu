# 昭梧更新報告｜ZW-WEB-2026.09.22-r173

## 本次改動

- 「今日指引」不再自動用 IP 猜訪客城市；未取得定位前明確顯示「尚未確認位置」。
- 只有使用者主動按「使用目前位置」後才請求瀏覽器 geolocation；定位失敗時不硬塞任何城市名。
- 出生城市支援精確／單一匹配自動確認，未形成有效 CityHit 時在欄位下直接顯示錯誤，提交後自動捲回並聚焦該欄位。
- 青玉小龍在新分析結果生成後主動提示，可直接查看「依據／主要風險／下一步」。

## 為什麼改

第一次晚上進站的使用者不應先看到錯誤城市，也不應因為已輸入城市文字但忘記點候選而卡住。生成結果後，小龍應承接閱讀，而不是回到泛用導覽狀態。

## 影響範圍

- `src/components/daily-almanac-widget.tsx`
- `src/components/city-picker.tsx`
- `src/components/analysis-form.tsx`
- `src/components/green-dragon-guide.tsx`
- 對應回歸測試與 public release metadata

## 受保護範圍

不修改四柱、真太陽時、節氣、十神、起運等 deterministic calculation truth；不修改回答引擎、Auth、Payment、Supabase schema、夜模式或首頁主流程。

## 驗證狀態

- Source contract：已補定位同意、CityPicker 錯誤／自動確認與小龍結果接續測試。
- Deploy gate：待 PR CI。
- Engine suite：待 PR CI。
- iPhone Safari：待 PR CI。
- Production：尚未部署；不得視為已上線。

## 回滾

回滾本 release 的 UI commit 即可恢復 r172。命理計算與資料結構未變，不需資料 migration。
