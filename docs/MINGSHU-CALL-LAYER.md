# 昭梧｜個人命書旁證與雙引擎驗證層

狀態：`SIDE_CHANNEL`（r138）

## 定位

這是昭梧對 [個人命書 CLI / API](https://mingshu.help/zh-TW/cli) 的伺服器旁證層，以及昭梧自己的驗證／發現接口；不是第二套排盤核心。

- 昭梧 Calculation Truth 仍只來自 `src/lib/bazi/chart.ts`、`calendar.ts` 與既定 R6.2.1 runtime。
- 個人命書的 `judgments` 一律標為「本命書引擎的判斷」，只作 `SIDE_CHANNEL` 旁證。
- 外部結果不得覆蓋昭梧四柱、月令、十神、旺衰、調候、病藥、取用或歲運主判。
- 外部服務失敗時 fail-open：昭梧本機引擎繼續獨立運作。

## 四級來源標籤

| 標籤 | 含義 |
|---|---|
| `CALC_TRUTH` | 可重算的確定計算，例如四柱、節氣與真太陽時結果 |
| `ZHAOWU_DERIVED` | 依 STONE R6.2.1 主線推導出的昭梧判斷 |
| `SIDE_CHANNEL` | 個人命書等外部引擎／旁證；永遠不能覆蓋主判 |
| `AI_INTERPRETATION` | 將既有事實與推導翻譯成自然語言，不新增 Calculation Truth |

## API

| 路徑 | 作用 | 權限 | 出生資料 |
|---|---|---|---|
| `GET /api/zhaowu-capabilities` | 公開昭梧引擎版本、能力、來源層級與端點 | 公開 | 不接收 |
| `GET /api/zhaowu-doctor` | 檢查昭梧本地狀態；附帶 Mingshu 非必要旁路狀態 | 公開 | 不接收／不轉發 |
| `GET /api/mingshu-doctor` | 直接探測 Mingshu `/api/v1/capabilities` | 公開 | 不接收／不轉發 |
| `GET /api/mingshu-locations?q=...` | 查城市級 GeoNames placeId，供真太陽時旁證 | 站主 Cookie | 無出生資料 |
| `POST /api/mingshu-chart` | 轉送已消毒出生輸入到 Mingshu | 站主 Cookie | 明確站主操作才送出 |
| `POST /api/mingshu-compare` | 同一張昭梧命盤與 Mingshu 回傳逐項比對 | 站主 Cookie | 明確站主操作才送出 |

`finalizeReading`、Focused Report、免費／付費報告均不會自動呼叫上述 Mingshu 端點。

## 雙引擎驗證

`/api/mingshu-compare` 只做審稿式比對，不做裁決替換。比較維度目前包括：

- 四柱
- 日主
- 旺衰標籤
- 用神元素
- 格局（兩邊都提供時才比較）

每一項只能得到：

- `MATCH`
- `PARTIAL`
- `CONFLICT`
- `UNAVAILABLE`

整體結果固定帶：

- `resolution: ZHAOWU_REMAINS_AUTHORITATIVE`
- `overridesBaziCalcTruth: false`

因此「外部一致」只能增加旁證；「外部衝突」只會標記差異，不會改寫昭梧 R6.2.1 結論。

## ZW Chart Fingerprint

`lib/zhaowu-verification.js` 對命盤核心投影建立：

`ZW-R6.2.1-<16位SHA256摘要>`

Fingerprint 只投影與命盤結構有關的欄位，例如四柱、日主、月支、旺衰證據、用神與大運；不納入：

- 姓名
- 城市顯示字串
- 原始出生日期／時間字串
- 問題文字
- AI 解讀文案
- locale／翻譯文字

目的：

1. 驗證繁中／英文等呈現層是否仍指向同一張底層盤。
2. 發布前後偵測底層計算漂移。
3. 對比外部引擎時保留匿名的本盤識別，不用把原始出生資料寫進日誌。

它不是使用者 ID、授權憑證或付費報告校驗碼。

## Mingshu v1 契約修正

真太陽時 `placeId` 必須採官方格式：

`geonames:<numeric-id>`

例如 `geonames:1796236`。不得把 placeId 轉成裸數字。`mingshu-locations` 用來取得城市級 ID；若查不到城市或服務無法解析時間，不得偷偷降級成 clock mode。

## 隱私與失敗策略

- `doctor` / `capabilities` 完全不接受出生資料。
- `mingshu-chart` / `mingshu-compare` 只在站主登入後可用。
- 出生資料只送往目前設定的 `MINGSHU_API_ORIGIN`（預設 `https://mingshu.help`）。
- Mingshu 回傳與比對結果不寫 Supabase、不建立客資表、不自動寫報告。
- 不把 CLI 安裝進 Vercel runtime；正式站只走 HTTP。
- Mingshu 逾時、429 或不可用時，昭梧 Calculation Truth 不受影響。

## 鎖定邊界

r138 不修改：

- `src/lib/bazi/chart.ts`
- `src/lib/bazi/calendar.ts`
- `src/lib/bazi/interpret.ts`
- auth / payment / Supabase schema
- Focused Report 與客人正式報告組裝
