# 昭梧更新報告｜ZW-WEB-2026.09.15-r138

## 本次改動

- 新增個人命書 HTTP 呼叫層：`GET /api/mingshu-doctor`、`POST /api/mingshu-chart`。
- 正式站不安裝 CLI；由 Vercel function 轉送 `https://mingshu.help`。
- doctor 只探測能力介面，不送出生資料。
- chart 僅站主 Cookie 可呼叫，輸入先消毒再轉發；回傳標為旁證，並寫明未接入 `finalizeReading`。
- 文件化為 `docs/MINGSHU-CALL-LAYER.md`。客人報告、首頁版式、PWA cache 不變。

## 為什麼改

站主要求把已安裝的個人命書接到昭梧，且只加呼叫層、不改鎖定核心。命書引擎是外部固定表，不能 silently 變成昭梧 Calculation Truth；出生資料預設也不可上傳給第三方。因此先做可驗證、可關閉、不進報告的伺服器旁路。

## 影響範圍

- `api/mingshu-doctor.js`
- `api/mingshu-chart.js`
- `lib/mingshu-client.js`
- `src/lib/mingshu/client.ts`
- `docs/MINGSHU-CALL-LAYER.md`
- 公開 release ledger fallback

不修改：`src/lib/bazi/chart.ts`、`calendar.ts`、`interpret.ts` 分類順序、`palm/engine.ts`、`core/method.ts`、auth 契約、payment、Supabase schema、Focused Report、首頁版式。

## 驗證要求

- Deploy gate：必須 PASS
- Engine suite：必須 PASS
- iPhone Safari：既有必要檢查不得退化
- Production：`GET /api/mingshu-doctor` 回 JSON；未登入 `POST /api/mingshu-chart` 回 401
- 首頁與既有分析路徑行為不變

## 回滾

回退 r138 merge commit 即可移除兩個 API 與呼叫層文件。昭梧本機排盤不受影響。
