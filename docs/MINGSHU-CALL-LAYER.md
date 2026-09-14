# 昭梧｜個人命書呼叫層

狀態：`SIDE_CHANNEL`（r138）

## 定位

這是昭梧對 [個人命書 CLI / API](https://mingshu.help/zh-TW/cli) 的伺服器呼叫層，不是第二套排盤核心。

- 昭梧 Calculation Truth 仍只來自 `src/lib/bazi/chart.ts` 等鎖定檔。
- 個人命書的 `judgments` 標為「本命書引擎的判斷」，可作旁證，不得覆蓋月令、四柱、十神、旺衰或歲運。
- 分類：`MODERN_INTERPRETATION / SIDE_CHANNEL`。不是 `CALC_TRUTH`。

## 目前接線

| 路徑 | 作用 | 權限 | 是否進報告 |
|---|---|---|---|
| `GET /api/mingshu-doctor` | 探測 `https://mingshu.help/api/v1/capabilities` | 公開，不送出生資料 | 否 |
| `POST /api/mingshu-chart` | 轉送已消毒的出生輸入到 `/api/v1/chart` | 站主 Cookie `__Host-zhaowu_owner_session` | 否 |

`finalizeReading`、Focused Report、免費／付費報告均未呼叫本層。失敗必須 fail-open：昭梧本機引擎繼續獨立運作。

## 隱私

- doctor 不接受、不轉發出生欄位。
- chart 只在站主已登入時轉發；資料送往 `https://mingshu.help`（可用 `MINGSHU_API_ORIGIN` 覆寫，預設不寫入）。
- 不寫 Supabase、不建命盤資料表、不保存第三方回傳。

## 未做（需另一次明確指令）

- 客人報告顯示命書旁證
- 用命書用神覆蓋昭梧取用
- 把 CLI 裝進 Vercel 運行時（正式站只走 HTTP）
