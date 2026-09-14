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
修正真太陽時 `placeId`：官方要求 `geonames:<id>` 字串，不再錯誤轉成數字。補上城市查詢端點，讓真太陽時旁證流程可以完整走通。

## 安全邊界

本次不修改：
- `src/lib/bazi/chart.ts`
- `src/lib/bazi/calendar.ts`
- `src/lib/bazi/interpret.ts`
- `finalizeReading`
- auth / payment / Supabase schema
- 免費／付費客人報告內容

Mingshu 失敗時 fail-open；昭梧本地 R6.2.1 照常工作。

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
