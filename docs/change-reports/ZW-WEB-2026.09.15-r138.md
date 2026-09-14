# 昭梧更新報告｜ZW-WEB-2026.09.15-r138

## 本次改動

r138 從單純「個人命書 HTTP 呼叫層」收口為一套可驗證、可追蹤、不可反向污染主判的旁證架構。

### 1. 個人命書 HTTP 旁路
- `GET /api/mingshu-doctor`
- `GET /api/mingshu-locations`（站主限定）
- `POST /api/mingshu-chart`（站主限定）
- `POST /api/mingshu-compare`（站主限定）
- 正式站不安裝 Mingshu CLI；Vercel function 只透過 HTTPS 呼叫公開 API。

### 2. 雙引擎驗證
新增 `lib/zhaowu-verification.js`，可逐項比較昭梧與 Mingshu：
- 四柱
- 日主
- 旺衰
- 用神
- 格局（有資料才比較）

輸出 `MATCH / PARTIAL / CONFLICT / UNAVAILABLE`，但永遠固定：
`ZHAOWU_REMAINS_AUTHORITATIVE`。

### 3. 四級來源標籤
正式鎖定：
- `CALC_TRUTH`
- `ZHAOWU_DERIVED`
- `SIDE_CHANNEL`
- `AI_INTERPRETATION`

外部 Mingshu 只能落在 `SIDE_CHANNEL`。

### 4. ZW Chart Fingerprint
新增匿名命盤摘要：
`ZW-R6.2.1-<16位摘要>`

只基於命盤核心結構，不包含原始出生日期、城市顯示文字、問題、AI 文案或 locale。用於版本漂移、語言一致性與交叉驗證。

### 5. 昭梧 discovery / health
- `GET /api/zhaowu-capabilities`
- `GET /api/zhaowu-doctor`

doctor 即使 Mingshu 失效仍保持昭梧本地 `ok: true`，並把外部服務標為非必要 side channel。

### 6. Mingshu v1 契約修正
修正真太陽時 `placeId`：官方要求 `geonames:<id>` 字串，不再錯誤轉成數字。補上城市查詢端點，讓真太陽時旁證流程可以完整走通。農曆日期只做格式與閏月旗標檢查，實際農曆日期合法性由 Mingshu 服務端判定，不套用 Gregorian 日期規則。

## 為什麼改

個人命書最有價值的部分不是取代昭梧子平主判，而是提供一個可獨立查詢的外部判斷來源，以及清楚的 discovery／doctor／digest 契約。r138 因此採取「旁證而不奪權」：昭梧 R6.2.1 繼續是唯一主判，外部引擎只負責交叉驗證與暴露差異。這樣既能利用另一套引擎發現四柱、旺衰、用神等差異，也不會讓第三方固定表格反向污染昭梧的月令、調候、病藥、承載、流通與歲運判斷。

同時補上 ZW Chart Fingerprint 與昭梧自己的 capabilities／doctor，目的是讓不同語言、不同部署版本與外部 AI 都能確認自己面對的是同一套底層命盤與同一個 R6.2.1 runtime，而不是依賴自然語言文案猜測版本。

## 影響範圍

新增／更新的範圍限定在：
- `api/zhaowu-capabilities.js`
- `api/zhaowu-doctor.js`
- `api/mingshu-doctor.js`
- `api/mingshu-locations.js`
- `api/mingshu-chart.js`
- `api/mingshu-compare.js`
- `lib/mingshu-client.js`
- `lib/zhaowu-verification.js`
- `src/lib/mingshu/client.ts`
- r138 契約、變更報告、release ledger 與回歸測試
- `vercel.json` 對上述 Serverless Function 的 duration 宣告

明確不修改：
- `src/lib/bazi/chart.ts`
- `src/lib/bazi/calendar.ts`
- `src/lib/bazi/interpret.ts`
- `finalizeReading`
- auth / payment / Supabase schema
- 免費／付費客人報告內容

## 安全邊界

Mingshu 失敗時 fail-open；昭梧本地 R6.2.1 照常工作。任何 `CONFLICT` 只顯示差異，不自動採納 Mingshu 判斷，固定以 `ZHAOWU_REMAINS_AUTHORITATIVE` 收束。

## 隱私

- capabilities / doctor 不接收出生資料。
- locations 只傳地名。
- chart / compare 只有站主 Cookie 可呼叫。
- 第三方回傳不寫 Supabase、不建立檔案、不進普通客人報告。
- Fingerprint 不含原始出生資料與自然語言文案。

## 驗證要求

- Deploy gate：PASS
- Engine suite：PASS
- iPhone Safari：PASS
- Production `/api/zhaowu-capabilities`：200
- Production `/api/zhaowu-doctor`：200，即使 side channel 掛掉仍不得拖垮本地
- Production `/api/mingshu-doctor`：回報實際外部狀態
- 未登入 `/api/mingshu-locations`、`/api/mingshu-chart`、`/api/mingshu-compare`：401

## 回滾

若 r138 的旁證層造成任何正式站退化，回退 r138 merge commit 即可移除新增的 Mingshu／Zhaowu discovery 與 compare API。由於本次沒有修改 `chart.ts`、`calendar.ts`、`interpret.ts`、客戶報告組裝、auth、payment 或 Supabase schema，回滾不需要資料庫遷移，也不會改變既有命盤 Calculation Truth。
